import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { logMedicalRecordAction } from "@/lib/medicalRecordAudit";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const ownerId = session?.user?.id;

    if (!ownerId) {
      return NextResponse.json(
        { error: "Please sign in to delete documents." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const recordId =
      body && typeof body.id === "string" ? body.id : null;

    if (!recordId) {
      return NextResponse.json(
        { error: "A document ID is required." },
        { status: 400 }
      );
    }

    const { data: record, error: lookupError } = await supabaseAdmin
      .from("medical_records")
      .select("id, owner_id, storage_path")
      .eq("id", recordId)
      .eq("owner_id", ownerId)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json(
        { error: "Unable to retrieve document details." },
        { status: 502 }
      );
    }

    if (!record) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    // Do not delete a version that another version depends on.
    const { data: newerVersion, error: versionError } =
      await supabaseAdmin
        .from("medical_records")
        .select("id")
        .eq("owner_id", ownerId)
        .eq("previous_version_id", record.id)
        .limit(1)
        .maybeSingle();

    if (versionError) {
      return NextResponse.json(
        { error: "Unable to verify document version history." },
        { status: 502 }
      );
    }

    if (newerVersion) {
      return NextResponse.json(
        {
          error:
            "This document has a newer version. Delete the latest version first to preserve version history.",
        },
        { status: 409 }
      );
    }

    const { error: storageError } = await supabaseAdmin.storage
      .from("medical-records")
      .remove([record.storage_path]);

    if (storageError) {
      return NextResponse.json(
        { error: "Unable to delete the stored file." },
        { status: 502 }
      );
    }

    const { error: databaseError } = await supabaseAdmin
      .from("medical_records")
      .delete()
      .eq("id", record.id)
      .eq("owner_id", ownerId);

    if (databaseError) {
      return NextResponse.json(
        {
          error:
            "The file was removed, but its database record could not be deleted. Please contact support.",
        },
        { status: 502 }
      );
    }

    await logMedicalRecordAction(ownerId, "delete", record.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Delete request failed." },
      { status: 500 }
    );
  }
}