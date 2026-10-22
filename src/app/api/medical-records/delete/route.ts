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

    // Confirm ownership before deleting anything from storage.
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