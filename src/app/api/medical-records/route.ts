import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { randomUUID } from "crypto";
import { authOptions } from "@/lib/authOptions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { logMedicalRecordAction } from "@/lib/medicalRecordAudit";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const ALLOWED_CATEGORIES = [
  "prescription",
  "lab_report",
  "medical_report",
  "other",
];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const ownerId = session?.user?.id;

    if (!ownerId) {
      return NextResponse.json(
        { error: "Please sign in to upload documents." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const requestedCategory = formData.get("category");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select a file." },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File must be between 1 byte and 10 MB." },
        { status: 400 }
      );
    }

    const extension = ALLOWED_TYPES[file.type];

    if (!extension) {
      return NextResponse.json(
        { error: "Only PDF, JPEG and PNG files are allowed." },
        { status: 415 }
      );
    }

    const category =
      typeof requestedCategory === "string" &&
      ALLOWED_CATEGORIES.includes(requestedCategory)
        ? requestedCategory
        : "other";

    const bytes = Buffer.from(await file.arrayBuffer());

    // Check file signatures instead of trusting the supplied MIME type.
    const isPdf =
      extension === "pdf" &&
      bytes.subarray(0, 5).toString("ascii") === "%PDF-";

    const isJpeg =
      extension === "jpg" &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff;

    const isPng =
      extension === "png" &&
      bytes.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      );

    if (!isPdf && !isJpeg && !isPng) {
      return NextResponse.json(
        { error: "The file contents do not match the file type." },
        { status: 415 }
      );
    }

    // Keep the original filename out of the storage path.
    const storagePath = `${ownerId}/${randomUUID()}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("medical-records")
      .upload(storagePath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Medical document storage upload failed.");
      return NextResponse.json(
        { error: "Unable to store the document." },
        { status: 502 }
      );
    }

    const { data, error: databaseError } = await supabaseAdmin
      .from("medical_records")
      .insert({
          owner_id: ownerId,
          file_name: file.name.replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 200),
          storage_path: storagePath,
          category,
          content_type: file.type,
          file_size: file.size,
          version_number: 1,
          retention_until: new Date(
             Date.now() + 7 * 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
          previous_version_id: null,
        })
      .select("id, file_name, category, content_type, file_size, created_at")
      .single();

    if (databaseError) {
      // Avoid leaving an untracked document if metadata insertion fails.
      const { error: cleanupError } = await supabaseAdmin.storage
        .from("medical-records")
        .remove([storagePath]);

      if (cleanupError) {
        console.error(
          "Storage cleanup failed after metadata insertion failure."
        );
      }

      console.error("Medical document metadata insertion failed.");
      return NextResponse.json(
        { error: "Unable to save document details." },
        { status: 502 }
      );
    }

    await logMedicalRecordAction(ownerId, "upload", data.id);
    return NextResponse.json({ record: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const ownerId = session?.user?.id;

    if (!ownerId) {
      return NextResponse.json(
        { error: "Please sign in to view your documents." },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("medical_records")
      .select(
           "id, file_name, category, content_type, file_size, created_at, version_number, previous_version_id"
          )
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json(
        { error: "Unable to retrieve documents." },
        { status: 502 }
      );
    }

    return NextResponse.json({ records: data });
  } catch {
    return NextResponse.json(
      { error: "Unable to retrieve documents." },
      { status: 500 }
    );
  }
}