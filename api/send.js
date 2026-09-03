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

    /*
      Validasi dasar.
    */
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        ok: false,
        error: "Format email tidak valid"
      });
    }

    /*
      API_URL dan secret disimpan
      di Vercel Environment Variables.

      Contoh:
      AM_API_URL
      AM_API_SECRET
    */

    const apiUrl = process.env.AM_API_URL;

    if (!apiUrl) {
      return res.status(500).json({
        ok: false,
        error: "API belum dikonfigurasi"
      });
    }

    /*
      Tempat integrasi API berizin lu.

      Jangan menaruh secret di frontend.
    */

    const response = await fetch(apiUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        ...(process.env.AM_API_SECRET
          ? {
              "Authorization":
                `Bearer ${process.env.AM_API_SECRET}`
            }
          }
          : {})
      },

      body: JSON.stringify({
        email
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error:
          data?.error ||
          data?.message ||
          "API request gagal"
      });
    }

    return res.status(200).json({
      ok: true,
      data
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      ok: false,
      error: "Internal server error"
    });
  }
}
