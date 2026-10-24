import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { logMedicalRecordAction } from "@/lib/medicalRecordAudit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const ownerId = session?.user?.id;

    if (!ownerId) {
      return NextResponse.json(
        { error: "Please sign in to download documents." },
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
      .select("id, owner_id, storage_path, file_name")
      .eq("id", recordId)
      .eq("owner_id", ownerId)
      .maybeSingle();

    if (recordError) {
      return NextResponse.json(
        { error: "Unable to retrieve document details." },
        { status: 502 }
      );
    }

    if (!record) {
      // Use the same response for missing and other users' documents.
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    const { data: signedData, error: signedError } =
      await supabaseAdmin.storage
        .from("medical-records")
        .createSignedUrl(record.storage_path, 60);

    if (signedError || !signedData?.signedUrl) {
      return NextResponse.json(
        { error: "Unable to create a download link." },
        { status: 502 }
      );
    }

    await logMedicalRecordAction(ownerId, "download", record.id);

   return NextResponse.json({
     downloadUrl: signedData.signedUrl,
     expiresInSeconds: 60,
     fileName: record.file_name,
});
  } catch {
    return NextResponse.json(
      { error: "Download request failed." },
      { status: 500 }
    );
  }
}