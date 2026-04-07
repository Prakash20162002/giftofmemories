import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import { broadcastStatus } from "./statusBroadcaster.js";

let sock = null;
let currentQr = null;
let currentStatus = 'disconnected';
let isInitializing = false; // FIX 1: Lock to prevent multiple connections

export const getQr = () => currentQr;
export const getStatus = () => currentStatus;

export async function startClient() {
  // Prevent multiple spam initializations from the frontend
  if (isInitializing || currentStatus === 'connected') {
    return;
  }

  isInitializing = true;
  console.log("🔄 Initializing Baileys WhatsApp engine (No-Chrome Edition)...");

  try {
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
    const { version } = await fetchLatestBaileysVersion(); // Fetch latest WA version

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false, // FIX 2: Removed deprecated warning
      logger: pino({ level: 'silent' }),
      browser: ['Gift of Memories CRM', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQr = qr;
        currentStatus = 'qr_needed';
        broadcastStatus(currentStatus, { qr });
        console.log("⚠ WhatsApp QR Code generated. Please scan in the CRM.");
      }

      if (connection === 'close') {
        currentQr = null;
        currentStatus = 'disconnected';
        isInitializing = false; // Release the lock

        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.warn(`⚠ WhatsApp connection closed (Status: ${statusCode}).`);

        // FIX 3: Explicitly catch 405, 401, and LoggedOut to wipe the bad session
        const shouldLogout = 
          statusCode === DisconnectReason.loggedOut || 
          statusCode === 405 || 
          statusCode === 401 || 
          statusCode === 403;

        if (shouldLogout) {
          console.log('❌ Invalid Session or Logged Out. Clearing old session and restarting...');
          if (fs.existsSync('baileys_auth_info')) {
            fs.rmSync('baileys_auth_info', { recursive: true, force: true });
          }
          setTimeout(startClient, 3000); // Give it a moment to breathe before restarting
        } else {
          console.log('🔄 Reconnecting in 5 seconds...');
          setTimeout(startClient, 5000);
        }
        broadcastStatus(currentStatus);

      } else if (connection === 'open') {
        currentQr = null;
        currentStatus = 'connected';
        isInitializing = false; // Release the lock
        console.log('✓ WhatsApp client ready & connected securely!');
        broadcastStatus(currentStatus);
      }
    });
  } catch (error) {
    console.error("❌ Error initializing Baileys:", error);
    isInitializing = false;
  }
}

export async function sendWhatsAppMessage(phone, message, imageUrl = null) {
  try {
    if (!phone || !message) return { success: false, error: "Phone and message are required" };
    
    if (currentStatus !== 'connected' || !sock) {
      console.error(`❌ Cannot send message. WhatsApp is ${currentStatus}`);
      return { success: false, error: "Client not connected" };
    }

    // Clean all non-digit characters
    let cleanPhone = phone.toString().replaceAll(/\D/g, ''); 
    
    // Automatically add India country code '91' if it's exactly 10 digits
    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }
    
    // Baileys requires the @s.whatsapp.net suffix
    cleanPhone = cleanPhone.replace('@c.us', '');
    const formattedPhone = cleanPhone.includes('@s.whatsapp.net') ? cleanPhone : `${cleanPhone}@s.whatsapp.net`;

    if (imageUrl) {
      try {
        await sock.sendMessage(formattedPhone, { 
          image: { url: imageUrl }, 
          caption: message 
        });
        console.log(`✅ Media message sent successfully to ${formattedPhone}`);
        return { success: true };
      } catch (imageError) {
        console.error(`❌ Failed to send image: ${imageError.message}. Falling back to text only...`);
      }
    }

    await sock.sendMessage(formattedPhone, { text: message });
    console.log(`✅ Text message sent successfully to ${formattedPhone}`);
    return { success: true };

  } catch (err) {
    console.error(`✗ Error sending message to ${phone}:`, err.message);
    return { success: false, error: err.message };
  }
}