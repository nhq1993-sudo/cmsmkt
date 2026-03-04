import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
// Using Resend API for email

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(cors());

  // API Routes
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
      if (!process.env.RESEND_API_KEY) {
        return res.json({ success: false, message: "Chưa cấu hình RESEND_API_KEY" });
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'AdCMS PRO <onboarding@resend.dev>',
          to: [recipientEmail],
          subject: `[AdCMS] Quảng cáo "${adName}" đã được phê duyệt!`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
              <div style="background-color: #4f46e5; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">AdCMS PRO</h1>
              </div>
              <div style="padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="color: #4f46e5;">Chúc mừng!</h2>
                <p>Chào <strong>${owner}</strong>,</p>
                <p>Mẫu quảng cáo <strong>"${adName}"</strong> của bạn đã được phê duyệt và sẵn sàng để phân phối.</p>
                <p>Bạn có thể kiểm tra chi tiết tại hệ thống quản lý quảng cáo.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                  <p>Đây là email tự động từ hệ thống AdCMS PRO.</p>
                  <p>Vui lòng không trả lời email này.</p>
                </div>
              </div>
            </div>
          `
        })
      });

      const data = await response.json();
      if (response.ok) {
        res.json({ success: true, message: `Email sent to ${recipientEmail}` });
      } else {
        res.json({ success: false, message: data.message || 'Lỗi gửi email' });
      }
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/send-comment-email", async (req, res) => {
    const { adName, owner, ownerEmail, fieldName, comment, reviewer } = req.body;
    
    if (!owner && !ownerEmail) {
      return res.status(400).json({ error: "Missing owner information" });
    }

    const recipientEmail = ownerEmail || `${owner}@gmail.com`;
    
    try {
      if (!process.env.RESEND_API_KEY) {
        return res.json({ success: false, message: "Chưa cấu hình RESEND_API_KEY" });
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'AdCMS PRO <onboarding@resend.dev>',
          to: [recipientEmail],
          subject: `[AdCMS] Phản hồi mới cho quảng cáo "${adName}"`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
              <div style="background-color: #f59e0b; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">AdCMS PRO - Feedback</h1>
              </div>
              <div style="padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
                <p>Chào <strong>${owner}</strong>,</p>
                <p>Mẫu quảng cáo <strong>"${adName}"</strong> của bạn vừa nhận được phản hồi mới từ <strong>${reviewer || 'Người duyệt'}</strong>.</p>
                <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold; color: #92400e;">Trường thông tin: ${fieldName}</p>
                  <p style="margin: 10px 0 0 0; font-style: italic;">"${comment}"</p>
                </div>
                <p>Vui lòng kiểm tra và cập nhật lại mẫu quảng cáo theo yêu cầu.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                  <p>Đây là email tự động từ hệ thống AdCMS PRO.</p>
                </div>
              </div>
            </div>
          `
        })
      });

      const data = await response.json();
      if (response.ok) {
        res.json({ success: true, message: `Comment email sent to ${recipientEmail}` });
      } else {
        res.json({ success: false, message: data.message || 'Lỗi gửi email' });
      }
    } catch (error: any) {
      console.error("Error sending comment email:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
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
