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

function validateFileSignature(
  bytes: Buffer,
  extension: string
): boolean {
  if (extension === "pdf") {
    return bytes.subarray(0, 5).toString("ascii") === "%PDF-";
  }

  if (extension === "jpg") {
    return (
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }

  if (extension === "png") {
    return bytes
      .subarray(0, 8)
      .equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      );
  }

  return false;
}

/**
 * Upload a new version of an existing document.
 * Send multipart form data:
 * - file: the new document
 * - id: the existing document ID
 */
export async function POST(request: Request) {
  let uploadedStoragePath: string | null = null;

  try {
    const session = await getServerSession(authOptions);
    const ownerId = session?.user?.id;

    if (!ownerId) {
      return NextResponse.json(
        { error: "Please sign in to upload a new version." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const recordId = formData.get("id");
    const requestedCategory = formData.get("category");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select a file." },
        { status: 400 }
      );
    }

    if (typeof recordId !== "string" || !recordId.trim()) {
      return NextResponse.json(
        { error: "The existing document ID is required." },
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

    const { data: parent, error: parentError } = await supabaseAdmin
      .from("medical_records")
      .select(
        "id, owner_id, file_name, category, version_number, retention_until"
      )
      .eq("id", recordId)
      .eq("owner_id", ownerId)
      .maybeSingle();

    if (parentError) {
      return NextResponse.json(
        { error: "Unable to retrieve the existing document." },
        { status: 502 }
      );
    }

    if (!parent) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    // Only allow adding a child to the latest version.
    const { data: existingNextVersion, error: nextVersionError } =
      await supabaseAdmin
        .from("medical_records")
        .select("id")
        .eq("owner_id", ownerId)
        .eq("previous_version_id", parent.id)
        .limit(1)
        .maybeSingle();

    if (nextVersionError) {
      return NextResponse.json(
        { error: "Unable to verify document version history." },
        { status: 502 }
      );
    }

    if (existingNextVersion) {
      return NextResponse.json(
        {
          error:
            "This document already has a newer version. Select the latest version instead.",
        },
        { status: 409 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    if (!validateFileSignature(bytes, extension)) {
      return NextResponse.json(
        { error: "The file contents do not match the file type." },
        { status: 415 }
      );
    }

    const category =
      typeof requestedCategory === "string" &&
      ALLOWED_CATEGORIES.includes(requestedCategory)
        ? requestedCategory
        : parent.category;

    uploadedStoragePath =
      `${ownerId}/${randomUUID()}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("medical-records")
      .upload(uploadedStoragePath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Medical document version storage upload failed.");
      return NextResponse.json(
        { error: "Unable to store the new document version." },
        { status: 502 }
      );
    }

    const retentionUntil = new Date(
      Date.now() + 7 * 365 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: newVersion, error: insertError } =
      await supabaseAdmin
        .from("medical_records")
        .insert({
          owner_id: ownerId,
          file_name: file.name
            .replace(/[\\/\u0000-\u001f]/g, "_")
            .slice(0, 200),
          storage_path: uploadedStoragePath,
          category,
          content_type: file.type,
          file_size: file.size,
          version_number: (parent.version_number ?? 1) + 1,
          retention_until: retentionUntil,
          previous_version_id: parent.id,
        })
        .select(
          "id, file_name, category, content_type, file_size, created_at, version_number, retention_until, previous_version_id"
        )
        .single();

    if (insertError) {
      const { error: cleanupError } = await supabaseAdmin.storage
        .from("medical-records")
        .remove([uploadedStoragePath]);

      if (cleanupError) {
        console.error(
          "Storage cleanup failed after version metadata insertion failure."
        );
      }

      uploadedStoragePath = null;

      // A concurrent request may have created the next version.
      if (insertError.code === "23505") {
        return NextResponse.json(
          {
            error:
              "A newer version was created at the same time. Refresh the document list and try again.",
          },
          { status: 409 }
        );
      }

      console.error("Medical document version metadata insertion failed.");
      return NextResponse.json(
        { error: "Unable to save the new version details." },
        { status: 502 }
      );
    }

    await logMedicalRecordAction(ownerId, "upload", newVersion.id);

    return NextResponse.json(
      { record: newVersion },
      { status: 201 }
    );
  } catch {
    // Best-effort cleanup if an unexpected error occurs after storage upload.
    if (uploadedStoragePath) {
      try {
        await supabaseAdmin.storage
          .from("medical-records")
          .remove([uploadedStoragePath]);
      } catch {
        console.error("Unexpected version upload cleanup failure.");
      }
    }

    return NextResponse.json(
      { error: "Version upload failed. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * List all versions belonging to the selected document's version chain.
 * Query: GET /api/medical-records/versions?id=DOCUMENT_ID
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const ownerId = session?.user?.id;

    if (!ownerId) {
      return NextResponse.json(
        { error: "Please sign in to view document versions." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("id");

    if (!recordId) {
      return NextResponse.json(
        { error: "A document ID is required." },
        { status: 400 }
      );
    }

    const { data: record, error: recordError } = await supabaseAdmin
      .from("medical_records")
      .select("id, owner_id, file_name, previous_version_id")
      .eq("id", recordId)
      .eq("owner_id", ownerId)
      .maybeSingle();

    if (recordError) {
      return NextResponse.json(
        { error: "Unable to retrieve document versions." },
        { status: 502 }
      );
    }

    if (!record) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    // Walk backwards to find the oldest version.
    let rootId = record.id;
    let previousId = record.previous_version_id;
    const visited = new Set<string>([record.id]);

    while (previousId) {
      if (visited.has(previousId) || visited.size >= 100) {
        return NextResponse.json(
          { error: "Invalid or excessively long version history." },
          { status: 409 }
        );
      }

      const { data: previous, error } = await supabaseAdmin
        .from("medical_records")
        .select("id, previous_version_id")
        .eq("id", previousId)
        .eq("owner_id", ownerId)
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { error: "Unable to retrieve document versions." },
          { status: 502 }
        );
      }

      if (!previous) {
        return NextResponse.json(
          { error: "Version history is incomplete." },
          { status: 409 }
        );
      }

      rootId = previous.id;
      visited.add(previous.id);
      previousId = previous.previous_version_id;
    }

    // Walk forwards from the oldest version.
    const versions = [];
    let currentId: string | null = rootId;
    const seen = new Set<string>();

    while (currentId) {
      if (seen.has(currentId) || seen.size >= 100) {
        return NextResponse.json(
          { error: "Invalid or excessively long version history." },
          { status: 409 }
        );
      }

      seen.add(currentId);

      const { data: version, error } = await supabaseAdmin
        .from("medical_records")
        .select(
          "id, file_name, category, content_type, file_size, created_at, version_number, retention_until, previous_version_id"
        )
        .eq("id", currentId)
        .eq("owner_id", ownerId)
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { error: "Unable to retrieve document versions." },
          { status: 502 }
        );
      }

      if (!version) {
        return NextResponse.json(
          { error: "Version history is incomplete." },
          { status: 409 }
        );
      }

      versions.push(version);

      const { data: nextVersions, error: nextError } =
        await supabaseAdmin
          .from("medical_records")
          .select("id")
          .eq("owner_id", ownerId)
          .eq("previous_version_id", version.id)
          .limit(2);

      if (nextError) {
        return NextResponse.json(
          { error: "Unable to retrieve document versions." },
          { status: 502 }
        );
      }

      if ((nextVersions ?? []).length > 1) {
        return NextResponse.json(
          { error: "Version history contains conflicting branches." },
          { status: 409 }
        );
      }

      currentId = nextVersions?.[0]?.id ?? null;
    }

    return NextResponse.json({
      document: { id: record.id, file_name: record.file_name },
      versions,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to retrieve document versions." },
      { status: 500 }
    );
  }
}