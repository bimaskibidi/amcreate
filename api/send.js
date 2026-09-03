export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({
ok: false,
error: "Method not allowed"
});
}

try {
const { email } = req.body || {};

if (!email) {
  return res.status(400).json({
    ok: false,
    error: "Email diperlukan"
  });
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  return res.status(400).json({
    ok: false,
    error: "Format email tidak valid"
  });
}

const apiUrl = process.env.AM_API_URL;

if (!apiUrl) {
  return res.status(500).json({
    ok: false,
    error: "API belum dikonfigurasi di Vercel"
  });
}

const response = await fetch(apiUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",

    ...(process.env.AM_API_SECRET
      ? {
          "Authorization": `Bearer ${process.env.AM_API_SECRET}`
        }
      : {})
  },
  body: JSON.stringify({ email })
});

const contentType = response.headers.get("content-type") || "";
const raw = await response.text();

let data;

if (contentType.includes("application/json")) {
  try {
    data = JSON.parse(raw);
  } catch {
    data = { message: raw };
  }
} else {
  data = { message: raw };
}

if (!response.ok) {
  return res.status(response.status).json({
    ok: false,
    error:
      data?.error ||
      data?.message ||
      `API request gagal (${response.status})`
  });
}

return res.status(200).json({
  ok: true,
  data
});

} catch (error) {
console.error("SEND API ERROR:", error);

return res.status(500).json({
  ok: false,
  error: error?.message || "Internal server error"
});

}
}
