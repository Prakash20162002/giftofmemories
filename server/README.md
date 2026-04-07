# Server SMTP configuration

To enable real email delivery for enquiry status notifications, set the following environment variables in your server environment or in `.env`:

- SMTP_HOST
- SMTP_PORT (default 587)
- SMTP_SECURE (true for port 465, otherwise false)
- SMTP_USER
- SMTP_PASS
- FROM_EMAIL (optional)

Example `.env` entries are provided in `.env.example`.

Notes:
- In development (NODE_ENV != "production"), if SMTP is not configured the server will send emails using an Ethereal test account and log the preview URL to the console. That preview URL is also returned to the client and can be opened in the browser.
- Use `/api/admin/test-email` (POST, admin-protected) to verify SMTP configuration by sending a test mail to any recipient.
