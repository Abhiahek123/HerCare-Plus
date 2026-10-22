import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
  createSignedUrl: vi.fn(),
  logMedicalRecordAction: vi.fn(),
}));

vi.mock("next-auth/next", () => ({
  getServerSession: mocks.getServerSession,
}));

vi.mock("@/lib/authOptions", () => ({
  authOptions: {},
}));

vi.mock("@/lib/medicalRecordAudit", () => ({
  logMedicalRecordAction: mocks.logMedicalRecordAction,
}));

vi.mock("@/lib/supabaseAdmin", () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: mocks.select,
    })),
    storage: {
      from: vi.fn(() => ({
        createSignedUrl: mocks.createSignedUrl,
      })),
    },
  },
}));

import {
  GET as listRecords,
  POST as uploadRecord,
} from "../src/app/api/medical-records/route";

import {
  GET as downloadRecord,
} from "../src/app/api/medical-records/download/route";

describe("Medical records API security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue(null);

    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ eq: mocks.eq });
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });

    // The last ownership filter leads to maybeSingle().
    mocks.eq.mockImplementation(() => ({
      eq: mocks.eq,
      maybeSingle: mocks.maybeSingle,
    }));

    mocks.createSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://example.invalid/signed-test-url" },
      error: null,
    });

    mocks.logMedicalRecordAction.mockResolvedValue(undefined);
  });

  it("rejects unauthenticated requests to list records", async () => {
    const response = await listRecords();

    expect(response.status).toBe(401);
  });

  it("rejects unauthenticated requests to upload records", async () => {
    const request = new Request(
      "http://localhost/api/medical-records",
      { method: "POST" }
    );

    const response = await uploadRecord(request);

    expect(response.status).toBe(401);
  });

  it("rejects unauthenticated download requests", async () => {
    const request = new Request(
      "http://localhost/api/medical-records/download?id=record-123"
    );

    const response = await downloadRecord(request);

    expect(response.status).toBe(401);
    expect(mocks.createSignedUrl).not.toHaveBeenCalled();
  });

  it("does not create a signed URL when the record is not owned by the user", async () => {
    mocks.getServerSession.mockResolvedValue({
      user: { id: "user-b" },
    });

    mocks.maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const request = new Request(
      "http://localhost/api/medical-records/download?id=user-a-record"
    );

    const response = await downloadRecord(request);

    expect(response.status).toBe(404);
    expect(mocks.createSignedUrl).not.toHaveBeenCalled();
  });
});