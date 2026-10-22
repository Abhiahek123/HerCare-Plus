"use client";

import { useEffect, useState, useRef } from "react";

type MedicalRecord = {
  id: string;
  file_name: string;
  category: string;
  content_type: string;
  file_size: number;
  created_at: string;
};

const categories = [
  { value: "prescription", label: "Prescription" },
  { value: "lab_report", label: "Lab Report" },
  { value: "medical_report", label: "Medical Report" },
  { value: "other", label: "Other" },
];

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("other");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const formRef = useRef<HTMLFormElement>(null);

  async function loadRecords() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/medical-records", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load documents.");
      }

      setRecords(result.records || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load documents."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecords();
  }, []);

  async function uploadDocument(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!file) {
      setError("Please select a document first.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const response = await fetch("/api/medical-records", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed.");
      }

      setFile(null);
      if (formRef.current) {
       formRef.current.reset();
      }
      setCategory("other");
      setMessage("Document uploaded successfully.");
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function downloadDocument(record: MedicalRecord) {
    setBusyId(record.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/medical-records/download?id=${encodeURIComponent(record.id)}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Download failed.");
      }

      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = record.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function previewDocument(record: MedicalRecord) {
  setBusyId(record.id);
  setError("");
  setMessage("");

  // Open a tab immediately to reduce popup-blocker issues.
  const previewWindow = window.open("about:blank", "_blank");

  if (!previewWindow) {
    setError("Please allow pop-ups to preview this document.");
    setBusyId(null);
    return;
  }

  try {
    const response = await fetch(
      `/api/medical-records/download?id=${encodeURIComponent(record.id)}`
    );
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Preview failed.");
    }

    previewWindow.opener = null;
    previewWindow.location.href = result.downloadUrl;
  } catch (err) {
    previewWindow.close();
    setError(err instanceof Error ? err.message : "Preview failed.");
  } finally {
    setBusyId(null);
  }
}

  async function deleteDocument(record: MedicalRecord) {
    const confirmed = window.confirm(
      `Delete "${record.file_name}" permanently?`
    );

    if (!confirmed) return;

    setBusyId(record.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/medical-records/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Delete failed.");
      }

      setRecords((current) =>
        current.filter((item) => item.id !== record.id)
      );
      setMessage("Document deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  const filteredRecords = records.filter((record) => {
  const matchesSearch = record.file_name
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesCategory =
    filterCategory === "all" || record.category === filterCategory;

  return matchesSearch && matchesCategory;
});

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        color: "#243047",
      }}
    >
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Medical Records Vault</h1>
        <p style={{ color: "#596579", lineHeight: 1.6 }}>
          Store and manage your prescriptions, laboratory reports, and medical
          documents in one place.
        </p>
      </header>

      <section
        style={{
          border: "1px solid #dce3ec",
          borderRadius: 12,
          padding: 22,
          marginBottom: 28,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Upload a document</h2>
        <p style={{ color: "#596579", fontSize: 14 }}>
          PDF, JPEG, or PNG · Maximum 10 MB
        </p>

       <form ref={formRef} onSubmit={uploadDocument}>
          <label
            htmlFor="medical-file"
            style={{ display: "block", marginBottom: 8 }}
          >
            Choose file
          </label>
          <input
            id="medical-file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={(event) =>
              setFile(event.target.files?.[0] || null)
            }
            required
            style={{ display: "block", marginBottom: 18, maxWidth: "100%" }}
          />

          <label
            htmlFor="medical-category"
            style={{ display: "block", marginBottom: 8 }}
          >
            Document category
          </label>
          <select
            id="medical-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            style={{
              padding: 10,
              width: "100%",
              maxWidth: 360,
              marginBottom: 18,
            }}
          >
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <div>
            <button type="submit" disabled={uploading} style={buttonStyle}>
              {uploading ? "Uploading..." : "Upload document"}
            </button>
          </div>
        </form>
      </section>

      {message && (
        <p role="status" style={{ color: "#167044" }}>
          {message}
        </p>
      )}
      {error && (
        <p role="alert" style={{ color: "#b42318" }}>
          {error}
        </p>
      )}

      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h2>Your documents</h2>
          <button
            type="button"
            onClick={() => void loadRecords()}
            disabled={loading}
            style={buttonStyle}
          >
            Refresh
          </button>
        </div>

        <div
  style={{
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 18,
  }}
>
  <input
    type="text"
    value={searchTerm}
    onChange={(event) => setSearchTerm(event.target.value)}
    placeholder="Search by filename..."
    aria-label="Search medical documents"
    style={{
      flex: "1 1 220px",
      padding: 12,
      border: "1px solid #dce3ec",
      borderRadius: 8,
    }}
  />

  <select
    value={filterCategory}
    onChange={(event) => setFilterCategory(event.target.value)}
    aria-label="Filter by category"
    style={{
      flex: "0 1 200px",
      padding: 12,
      border: "1px solid #dce3ec",
      borderRadius: 8,
    }}
  >
    <option value="all">All categories</option>
    {categories.map((item) => (
      <option key={item.value} value={item.value}>
        {item.label}
      </option>
    ))}
  </select>
</div>

        {loading ? (
          <p>Loading documents...</p>
        ) : records.length === 0 ? (
          <p style={{ color: "#596579" }}>
            No documents yet. Upload a test document to get started.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {filteredRecords.map((record) => (
              <article
                key={record.id}
                style={{
                  border: "1px solid #dce3ec",
                  borderRadius: 12,
                  padding: 18,
                }}
              >
                <h3 style={{ marginTop: 0, overflowWrap: "anywhere" }}>
                  {record.file_name}
                </h3>
                <p style={{ color: "#596579", fontSize: 14 }}>
                  {categories.find((item) => item.value === record.category)
                    ?.label || "Other"}{" "}
                  · {formatSize(Number(record.file_size))} ·{" "}
                  {new Date(record.created_at).toLocaleDateString()}
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
  <button
    type="button"
    onClick={() => void previewDocument(record)}
    disabled={busyId === record.id}
    style={buttonStyle}
  >
    {busyId === record.id ? "Please wait..." : "Preview"}
  </button>

  <button
    type="button"
    onClick={() => void downloadDocument(record)}
    disabled={busyId === record.id}
    style={buttonStyle}
  >
    {busyId === record.id ? "Please wait..." : "Download"}
  </button>

  <button
    type="button"
    onClick={() => void deleteDocument(record)}
    disabled={busyId === record.id}
    style={{
      ...buttonStyle,
      background: "#fff",
      color: "#b42318",
      border: "1px solid #d9a5a5",
    }}
  >
    Delete
  </button>
</div>
              </article>
            ))}
          </div>
        )}
      </section>

      <p style={{ marginTop: 32, fontSize: 13, color: "#596579" }}>
        Security note: Malware scanning and OCR are not yet implemented. Use
        only non-sensitive test files until security testing is complete.
      </p>
    </main>
  );
}

const buttonStyle: React.CSSProperties = {
  background: "#176b59",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 16px",
  cursor: "pointer",
};