const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function request(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  let data = {};
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    data = { raw: rawText };
  }

  if (!response.ok) {
    console.error("API request failed", {
      path,
      status: response.status,
      statusText: response.statusText,
      response: data,
    });
    throw new Error(data.error || data.raw || `Request failed (${response.status})`);
  }
  return data;
}

async function uploadReport(uid, file) {
  const formData = new FormData();
  formData.append("uid", uid);
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload-report`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Upload failed");
  }
  return data;
}

export const api = {
  chat: (payload) => request("/chat", payload),
  analyze: (payload) => request("/analyze", payload),
  generateReport: (payload) => request("/generate-report", payload),
  assistant: (payload) => request("/assistant", payload),
  uploadReport,
};
