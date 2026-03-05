import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sendEmailBrevo(to: string, subject: string, htmlContent: string) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY || "",
    },
    body: JSON.stringify({
      sender: { name: "AdCMS PRO", email: "nhq1993@gmail.com" },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(cors());

  console.log("--- Server Configuration ---");
  console.log(`PORT: ${PORT}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`BREVO_API_KEY configured: ${!!process.env.BREVO_API_KEY}`);
  console.log("----------------------------");

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/send-approval-email", async (req, res) => {
    const { adName, owner, ownerEmail } = req.body;
    if (!owner && !ownerEmail) {
      return res.status(400).json({ error: "Missing owner information" });
    }
    const recipientEmail = ownerEmail || `${owner}@gmail.com`;

    try {
      if (!process.env.BREVO_API_KEY) {
        return res.json({ success: false, message: "Chua cau hinh BREVO_API_KEY" });
      }

      const html = `
        <div style="font-family:sans-serif;padding:20px;color:#333;line-height:1.6;">
          <div style="background:#4f46e5;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
            <h1 style="color:white;margin:0;">AdCMS PRO</h1>
          </div>
          <div style="padding:20px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px;">
            <h2 style="color:#4f46e5;">Chuc mung!</h2>
            <p>Chao <strong>${owner}</strong>,</p>
            <p>Mau quang cao <strong>"${adName}"</strong> da duoc <span style="color:#059669;font-weight:bold;">phe duyet</span> va san sang phan phoi.</p>
            <div style="margin-top:30px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#666;">
              <p>Day la email tu dong tu he thong AdCMS PRO.</p>
            </div>
          </div>
        </div>`;

      await sendEmailBrevo(recipientEmail, `[AdCMS] Quang cao "${adName}" da duoc phe duyet!`, html);
      console.log(`Approval email sent to ${recipientEmail}`);
      res.json({ success: true, message: `Email sent to ${recipientEmail}` });

    } catch (error: any) {
      console.error("Error sending approval email:", error);
      res.status(500).json({ error: "Loi gui mail: " + error.message });
    }
  });

  app.post("/api/send-comment-email", async (req, res) => {
    const { adName, owner, ownerEmail, fieldName, comment, reviewer } = req.body;
    if (!owner && !ownerEmail) {
      return res.status(400).json({ error: "Missing owner information" });
    }
    const recipientEmail = ownerEmail || `${owner}@gmail.com`;

    try {
      if (!process.env.BREVO_API_KEY) {
        return res.json({ success: false, message: "Chua cau hinh BREVO_API_KEY" });
      }

      const html = `
        <div style="font-family:sans-serif;padding:20px;color:#333;line-height:1.6;">
          <div style="background:#f59e0b;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
            <h1 style="color:white;margin:0;">AdCMS PRO - Feedback</h1>
          </div>
          <div style="padding:20px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px;">
            <p>Chao <strong>${owner}</strong>,</p>
            <p>Quang cao <strong>"${adName}"</strong> vua nhan phan hoi tu <strong>${reviewer || 'Nguoi duyet'}</strong>.</p>
            <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;">
              <p style="margin:0;font-weight:bold;color:#92400e;">Truong: ${fieldName}</p>
              <p style="margin:10px 0 0;font-style:italic;">"${comment}"</p>
            </div>
            <p>Vui long chinh sua lai theo yeu cau.</p>
          </div>
        </div>`;

      await sendEmailBrevo(recipientEmail, `[AdCMS] Phan hoi moi cho quang cao "${adName}"`, html);
      console.log(`Comment email sent to ${recipientEmail}`);
      res.json({ success: true, message: `Comment email sent to ${recipientEmail}` });

    } catch (error: any) {
      console.error("Error sending comment email:", error);
      res.status(500).json({ error: "Loi gui mail: " + error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
