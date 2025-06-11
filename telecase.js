require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_OWNER_ID = 7965767908;

let telegramBot;

// Cek token hanya sekali. Jika tidak ada, bot tidak akan dibuat.
if (TELEGRAM_BOT_TOKEN) {
    // Inisialisasi bot HANYA SEKALI di sini dan ekspor instance-nya.
    // Polling akan terus berjalan di latar belakang.
    telegramBot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
    console.log("✅ Instance Bot Telegram berhasil dibuat dan memulai polling.");
} else {
    console.warn("TELEGRAM_BOT_TOKEN tidak ditemukan. Fitur Bot Telegram dinonaktifkan.");
}

/**
 * Fungsi ini SEKARANG HANYA BERTUGAS Mendaftarkan Ulang Logika Perintah.
 * Fungsi ini bisa dipanggil berkali-kali untuk me-refresh command handlers.
 * @param {import('baileys').WASocket} client - Objek client Baileys.
 */
function initializeTgCommands(client) {
    if (!telegramBot) return; // Jangan lakukan apa-apa jika bot tidak terinisialisasi.

    console.log("🔄 Meregistrasi ulang command handler Telegram...");

    // Hapus semua listener yang ada untuk menghindari tumpukan event
    telegramBot.removeAllListeners("message");
    telegramBot.removeAllListeners("polling_error"); // Penting untuk kestabilan

    // Daftarkan ulang listener
    telegramBot.on('polling_error', (error) => {
        console.error(`Telegram Polling Error: ${error.code} - ${error.message}`);
    });

    telegramBot.onText(/^\/uphd$/, async (msg) => {
        // Logika /uphd Anda tetap sama persis seperti sebelumnya
        if (msg.from.id !== TELEGRAM_OWNER_ID) {
            return telegramBot.sendMessage(msg.chat.id, "❌ Perintah ini hanya untuk Owner.");
        }
        if (!msg.reply_to_message || (!msg.reply_to_message.photo && !msg.reply_to_message.video)) {
            return telegramBot.sendMessage(msg.chat.id, "❗️Gunakan perintah ini dengan cara me-reply sebuah foto atau video.");
        }
        const repliedMsg = msg.reply_to_message;
        const caption = repliedMsg.caption || "";
        let file_id, file_type;

        if (repliedMsg.photo) {
            file_type = 'photo';
            file_id = repliedMsg.photo[repliedMsg.photo.length - 1].file_id;
        } else if (repliedMsg.video) {
            file_type = 'video';
            file_id = repliedMsg.video.file_id;
        }

        const processingMsg = await telegramBot.sendMessage(msg.chat.id, "⚙️ Memproses media HD, mohon tunggu...");
        try {
            const fileLink = await telegramBot.getFileLink(file_id);
            const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
            const mediaBuffer = Buffer.from(response.data);
            const idch_wa = "120363418810450682@newsletter";
            const idch_tg = process.env.TELEGRAM_CHANNEL_ID;
            let successPlatforms = [];
            let failedPlatforms = [];
            try {
                const waOptions = { caption: caption, [file_type === 'photo' ? 'image' : 'video']: mediaBuffer };
                await client.sendMessage(idch_wa, waOptions);
                successPlatforms.push("WhatsApp");
            } catch (e) { failedPlatforms.push("WhatsApp"); }
            try {
                if (file_type === 'photo') await telegramBot.sendPhoto(idch_tg, file_id, { caption: caption });
                else if (file_type === 'video') await telegramBot.sendVideo(idch_tg, file_id, { caption: caption });
                successPlatforms.push("Telegram");
            } catch (e) { failedPlatforms.push("Telegram"); }
            let report = `Laporan Pengiriman HD:\n\n✅ Berhasil: ${successPlatforms.join(', ')}\n❌ Gagal: ${failedPlatforms.join(', ')}`;
            await telegramBot.editMessageText(report, { chat_id: msg.chat.id, message_id: processingMsg.message_id });
        } catch (error) {
            console.error("Error pada /uphd:", error);
            await telegramBot.editMessageText("Terjadi kesalahan fatal.", { chat_id: msg.chat.id, message_id: processingMsg.message_id });
        }
    });

    // Tambahkan handler lain di sini jika ada
}

// Ekspor instance bot (untuk mengirim pesan dari fastbyte.js) dan fungsi inisialisasi
module.exports = { telegramBot, initializeTgCommands };