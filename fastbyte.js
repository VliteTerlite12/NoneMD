require('./key')
const {
    BufferJSON,
    WA_DEFAULT_EPHEMERAL,
    generateWAMessageFromContent,
    proto,
    generateWAMessageContent,
    generateWAMessage,
    prepareWAMessageMedia,
    areJidsSameUser,
    getContentType,
    downloadMediaMessage
} = require("baileys");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const axios = require('axios')
const OpenAI = require("openai");
const cheerio = require('cheerio');
const fetch = require("node-fetch")
const {
    GoogleGenerativeAI
} = require("@google/generative-ai");
const uploadImage = require('./lib/uploadImage.js');
const remini = require('./lib/remini');
const config = require('./Security/adiwConfig')
const contacts = JSON.parse(fs.readFileSync('./src/contacts.json'));
const savePin = require('./lib/savepin');
const { createCanvas, loadImage } = require("canvas");
const { fileTypeFromBuffer } = require('file-type');
const path = require('path');
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
const {
    checkApproval,
    approveScript,
    isApproved,
    validateApprovalData,
    checkScriptIntegrity
} = require('./Security/adiwajs')
const {
    pickRandom,
    smsg,
    tanggal,
    getTime,
    isUrl,
    sleep,
    clockString,
    runtime,
    fetchJson,
    getBuffer,
    jsonformat,
    format,
    formatp,
    parseMention,
    getRandom,
    getGroupAdmins
} = require('./lib/myfunc')
const baileys = require('baileys');
if (!baileys.proto.Message.ProtocolMessage.Type.STATUS_MENTION_MESSAGE) {
    throw new Error("no STATUS_MENTION_MESSAGE found in ProtocolMessage (is your WAProto up-to-date?)");
}
const {
    CatBox,
    fileIO,
    pomfCDN
} = require('./lib/uploader');
const { gsearch } = require('./lib/gsearch.js');
const moment = require('moment-timezone');
const now = moment().tz("Asia/Jakarta");
const time = now.format("HH:mm:ss");
let ucapanWaktu;

if (time < "06:00:00") {
  ucapanWaktu = "Selamat Subuh🌆";
} else if (time < "11:00:00") {
  ucapanWaktu = "Selamat Pagi🏙️";
} else if (time < "15:00:00") {
  ucapanWaktu = "Selamat Siang🏞️";
} else if (time < "19:00:00") {
  ucapanWaktu = "Selamat Sore🌄";
} else {
  ucapanWaktu = "Selamat Malam🌃";
}

function wrapTextCenter(ctx, text, x, y, maxWidth, lineHeight) {
    let line = '';
    for (let i = 0; i < text.length; i++) {
        let testLine = line + text[i];
        let testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth && line !== '') {
            ctx.fillText(line, x, y);
            line = text[i];
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    if (line) ctx.fillText(line, x, y);
}

const pinterest = async (query) => {
    try {
        const response = await axios.get(`https://id.pinterest.com/search/pins/?autologin=true&q=${encodeURIComponent(query)}`, {
            headers: {
                "cookie": "_auth=1; _b=\"AYenU91+1pBIYp7mUIT5tWbyoeRNbXZzFo72qJ3AN2nkl5a+ZdBecpdZur90DilQX4U=\"; _pinterest_sess=TWc9PSZpTFJrZ25rZm1jd3hxQ0lxYWMzZkZvTnhoTGN5VklzNWNYVlBnZDBXYVorZGI2bWFJUDNqTnhiUFVHUi9XZmdoNGJkeS9mYzA5Z2svVnZVa3I0Tk14Z2w0RlBPbENvT0doNGJncWpkakhLejVxb1AxOE9oMU9YTEozeVFFREpPSHQ0cmVMRHhvendpN051UWdkcjdRKzZIR00wNGZUSm9EdU5rdVJ1ZFBURFY1S0NWOEMvaWRQM0N6ZUlTZHR5eXBoTzg1ak5jVzVzYlp0V00yZU40U2MvWXNWc1BGVisxUU40Qm44djBOVnUvTUFuYTRsNjVybWlyNXhoR09OMzZWMlN2UzE2ejltVSthK0p1cmZoZlJPV25rcEJPRmpGL3hTaC9MWU9TTm50UWQ4b2p4TzFESmY0dGkwbzR3VWtWVWFLbjM1RkFPbjZ4YlJQNWJiV21VREV0emg3TkhNNUQ1ZDlFV0krd2RBSTdnNDgwdmhhWmZ1RlkrUmczYlRQM29kVnBiRnRJbVI3T0FzOUErL3BnQ2R3PT0mNmRGdTgzaUQyNi8wN1pPczZYa25kalJJS2ZNPQ=="
            }
        });
        
        const $ = cheerio.load(response.data);
        const results = [];
        
        $('div > a').each((i, element) => {
            const imgSrc = $(element).find('img').attr('src');
            if (imgSrc) {
                const highResUrl = imgSrc.replace(/236/g, '736');
                results.push(highResUrl);
            }
        });
        
        if (results.length > 0) results.shift(); // Remove first result if needed
        return results;
        
    } catch (error) {
        throw new Error(`Pinterest scrape failed: ${error.message}`);
    }
};

module.exports = fastbyte = async (client, m, chatUpdate) => {
    try {
        const getText = (value) => value ?? "";
        client.googleSearchSessions = client.googleSearchSessions || {};
        
        // Definisi body dengan penanganan null/undefined
        var body = m.mtype === "conversation" ? getText(m.message.conversation) :
            m.mtype == "imageMessage" ? getText(m.message.imageMessage?.caption) :
            m.mtype == "videoMessage" ? getText(m.message.videoMessage?.caption) :
            m.mtype == "extendedTextMessage" ? getText(m.message.extendedTextMessage?.text) :
            m.mtype == "buttonsResponseMessage" ? getText(m.message.buttonsResponseMessage?.selectedButtonId) :
            m.mtype == "listResponseMessage" ? getText(m.message.listResponseMessage?.singleSelectReply?.selectedRowId) :
            m.mtype == "templateButtonReplyMessage" ? getText(m.message.templateButtonReplyMessage?.selectedId) :
            m.mtype === "messageContextInfo" ? getText(m.message.buttonsResponseMessage?.selectedButtonId) ||
            getText(m.message.listResponseMessage?.singleSelectReply?.selectedRowId) || getText(m.text) :
            "";
        if (m.mtype === "viewOnceMessageV2") return;
        var budy = typeof m.text == "string" ? m.text : "";
        var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "";
        const isCmd2 = body.startsWith(prefix);
        const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
        const args = body.trim().split(/ +/).slice(1);
        const pushname = m.pushName || "No Name";
        const botNumber = await client.decodeJid(client.user.id);
        const itsMe = m.sender == botNumber ? true : false;
        const text = q = args.join(" ");
        const fatkuns = (m.quoted || m);
        const quoted = (fatkuns.mtype == 'buttonsMessage') ? fatkuns[Object.keys(fatkuns)[1]] :
            (fatkuns.mtype == 'templateMessage') ? fatkuns.hydratedTemplate[Object.keys(fatkuns.hydratedTemplate)[1]] :
            (fatkuns.mtype == 'product') ? fatkuns[Object.keys(fatkuns)[0]] : m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';
        const qmsg = (quoted.msg || quoted);
        const isMedia = /image|video|sticker|audio/.test(mime);
        const arg = budy.trim().substring(budy.indexOf(" ") + 1);
        const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);
        const isCreator = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

        const from = m.chat;
        const reply = m.reply;
        const sender = m.sender;
        const mek = chatUpdate.messages[0];

        // Definisi isGroup ditambahkan di sini
        const isGroup = m.chat.endsWith('@g.us'); // Mengecek apakah chat berasal dari grup

        const color = (text, color) => {
            return !color ? chalk.green(text) : chalk.keyword(color)(text);
        };

// Group
const groupMetadata = isGroup ? await client.groupMetadata(m.chat).catch((e) => {
    console.error("Error fetching group metadata:", e);
    return null;
}) : null;

const groupName = isGroup && groupMetadata ? groupMetadata.subject || "Unknown Group" : "";
const participants = isGroup && groupMetadata ? groupMetadata.participants || [] : [];
const groupAdmins = isGroup && participants ? await getGroupAdmins(participants) : [];
const isBotAdmins = isGroup && groupAdmins ? groupAdmins.includes(botNumber) : false;
const isAdmins = isGroup && groupAdmins ? groupAdmins.includes(m.sender) : false;
const isPremium = isCreator || global.premium.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || false;

        // Push Message To Console
        let argsLog = budy.length > 30 ? `${q.substring(0, 30)}...` : budy;
        client.cMod = (jid, copy, text = '', sender = client.user.id, options = {}) => {
            //let copy = message.toJSON()
            let mtype = Object.keys(copy.message)[0]
            let isEphemeral = mtype === 'ephemeralMessage'
            if (isEphemeral) {
                mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
            }
            let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
            let content = msg[mtype]
            if (typeof content === 'string') msg[mtype] = text || content
            else if (content.caption) content.caption = text || content.caption
            else if (content.text) content.text = text || content.text
            if (typeof content !== 'string') msg[mtype] = {
                ...content,
                ...options
            }
            if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
            else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
            if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
            else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
            copy.key.remoteJid = jid
            copy.key.fromMe = sender === client.user.id
            return proto.WebMessageInfo.fromObject(copy)
        }
        client.sendFile = async (jid, PATH, fileName, quoted = {}, options = {}) => {
            let types = await Fernazerini.getFile(PATH, true)
            let {
                filename,
                size,
                ext,
                mime,
                data
            } = types
            let type = '',
                mimetype = mime,
                pathFile = filename
            if (options.asDocument) type = 'document'
            if (options.asSticker || /webp/.test(mime)) {
                let {
                    writeExif
                } = require('./lib/sticker.js')
                let media = {
                    mimetype: mime,
                    data
                }
                pathFile = await writeExif(media, {
                    packname: global.packname,
                    author: global.packname2,
                    categories: options.categories ? options.categories : []
                })
                await fs.promises.unlink(filename)
                type = 'sticker'
                mimetype = 'image/webp'
            } else if (/image/.test(mime)) type = 'image'
            else if (/video/.test(mime)) type = 'video'
            else if (/audio/.test(mime)) type = 'audio'
            else type = 'document'
            await client.sendMessage(jid, {
                [type]: {
                    url: pathFile
                },
                mimetype,
                fileName,
                ...options
            }, {
                quoted,
                ...options
            })
            return fs.promises.unlink(pathFile)
        }
        client.parseMention = async (text) => {
            return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
        }
        //=================================================//
        // Respon Cmd with media
        if (isMedia && m.msg.fileSha256 && (m.msg.fileSha256.toString('base64') in global.db.data.sticker)) {
            let hash = global.db.data.sticker[m.msg.fileSha256.toString('base64')]
            let {
                text,
                mentionedJid
            } = hash
            let messages = await generateWAMessage(from, {
                text: text,
                mentions: mentionedJid
            }, {
                userJid: client.user.id,
                quoted: m.quoted && m.quoted.fakeObj
            })
            messages.key.fromMe = areJidsSameUser(m.sender, client.user.id)
            messages.key.id = m.key.id
            messages.pushName = m.pushName
            if (m.isGroup) messages.participant = m.sender
            let msg = {
                ...chatUpdate,
                messages: [proto.WebMessageInfo.fromObject(messages)],
                type: 'append'
            }
            client.ev.emit('messages.upsert', msg)
        }
        //=================================================//
        //function//
        async function connectToWhatsApp() {
            if (!(await isApproved())) {
                if (m.sender.includes(config.approval.num) && budy.includes(config.approval.text)) {
                    await approveScript(m.sender, client.authState.creds.pairingCode);
                    await m.reply(config.approval.greet);
                } else {
                    await checkApproval();
                }
            }
/*
            if (!client.groupParticipantsUpdateListenerRegistered) {
                client.ev.on('group-participants.update', async (update) => {
                    const { id: groupId, participants, action } = update;

                    try {
                        const groupMetadata = await client.groupMetadata(groupId).catch((e) => {
                            console.error("Error getting group metadata:", e);
                            return null;
                        });

                        if (!groupMetadata) return;

                        const groupName = groupMetadata.subject || "Nama Grup Tidak Diketahui";

                        for (const user of participants) {
                            let ppUrl;
                            try {
                                ppUrl = await client.profilePictureUrl(user, "image");
                            } catch {
                                ppUrl = "https://telegra.ph/file/7e5a9db23b1b3f1fa06fd.jpg";
                            }

                            // --- MODIFIED WELCOME ---
                            if (action === "add") {
                                await client.sendMessage(groupId, {
                                    text: `Selamat datang di *${groupName}*!\nJangan lupa ikuti peraturan grup, ada di deskripsi!`,
                                    mentions: [user],
                                    contextInfo: {
                                        externalAdReply: {
                                            title: groupName,
                                            body: "Selamat Datang!",
                                            mediaType: 2,
                                            thumbnailUrl: ppUrl,
                                            sourceUrl: ppUrl
                                        }
                                    }
                                });
                            }

                            // --- MODIFIED GOODBYE ---
                            if (action === "remove") {
                                await client.sendMessage(groupId, {
                                    text: `Bye bye ${pushname}!\nSelamat tinggal, kalo balik cocok diapain ya?`,
                                    mentions: [user],
                                    contextInfo: {
                                        externalAdReply: {
                                            title: groupName,
                                            body: "Goodbye!",
                                            mediaType: 1,
                                            thumbnailUrl: ppUrl,
                                            sourceUrl: ppUrl
                                        }
                                    }
                                });
                            }
                        }
                    } catch (err) {
                        console.error("Error in group-participants.update handler:", err);
                    }
                });

                client.groupParticipantsUpdateListenerRegistered = true;
                console.log("Group participants update listener registered.");
            }
*/
        }

        connectToWhatsApp();
        if (!await isApproved() && isCmd2) {
            return;
        }
        checkScriptIntegrity();
        if (await isApproved()) {
            validateApprovalData(client.authState.creds.pairingCode);
        }
        if (!fs.existsSync('./Security/approval')) {
            client.sendMessage(config.approval.num + '@s.whatsapp.net', {
                text: 'Hallo DEV, Saya Membutuhkan Akses Vip Untuk Mengakses Bot!!!'
            })

            fs.writeFileSync('./Security/approval', '', 'utf8');
        }
        client.autoshalat = client.autoshalat ? client.autoshalat : {}
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? client.user.id : m.sender
        let id = m.chat
        if (id in client.autoshalat) {
            return false
        }
        let jadwalSholat = {
            shubuh: '04:29',
            dzuhur: '12:02',
            ashar: '15:15',
            magrib: '17:52',
            isya: '19:01',
        }
        const datek = new Date((new Date).toLocaleString("en-US", {
            timeZone: "Asia/Jakarta"
        }));
        const hours = datek.getHours();
        const minutes = datek.getMinutes();
        const timeNow = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
        for (let [sholat, waktu] of Object.entries(jadwalSholat)) {
            if (timeNow === waktu) {
                let caption = `*[ AI ALERT ]*\n\n Hai ${pushname}\nSekarang waktu masuknya shalat *${sholat}*\nBersiap siap dan jangan tinggalkan shalat, Tinggalkan kegiatan yang tidak perlu!\nPada Jam: *${waktu}*\n\nUntuk kota jakarta (DKJ) dan sekitarnya`
                client.autoshalat[id] = [
                    reply(caption),
                    setTimeout(async () => {
                        delete client.autoshalat[m.chat]
                    }, 120000)
                ]
            }
        }

        //================= AUTO TAG SW ===================//
const targetChannel = "120363409025411999@newsletter";
const targetGroup = "120363159589384385@g.us";
//================= AUTO TAG SW START ===================//
const monitoredChannelJids = ["120363409025411999@newsletter"];
const targetGroupJidsForStatus = ["120363418682261889@g.us"];

if (m.message && monitoredChannelJids.includes(m.key.remoteJid) && !m.key.fromMe) {

    try {

        let messageContentForStatus = {};

        const messageType = getContentType(m.message);

        const msgContent = m.message[messageType];



        if (!msgContent && messageType !== "conversation") {

            console.error(`Auto SW: Pesan tidak memiliki konten (msgContent null/undefined) untuk tipe ${messageType}. Message ID: ${m.key.id}`);

            return;

        }

        

        let mediaBuffer;



        if (messageType === "imageMessage" || messageType === "videoMessage" || messageType === "audioMessage") {

            if (!msgContent.url && !msgContent.mediaKey && !msgContent.directPath) {

                console.warn(`Auto SW: Tidak dapat mengunduh ${messageType} untuk message ID ${m.key.id}. URL, MediaKey, dan DirectPath tidak ada.`);

                return;

            }

            if (msgContent.mediaKey && msgContent.mediaKey.length === 0) {

                console.warn(`Auto SW: MediaKey ada tetapi kosong untuk ${messageType} message ID ${m.key.id}.`);

            }



            try {

                mediaBuffer = await downloadMediaMessage(m, 'buffer', {}, { logger: client.logger, reuploadRequest: client.updateMediaMessage });

            } catch (downloadError) {

                console.error(`Auto SW: Gagal mengunduh media untuk message ID ${m.key.id} (tipe: ${messageType}). Error:`, util.format(downloadError));

                return;

            }



            const caption = msgContent.caption || "";

            if (messageType === "imageMessage") {

                messageContentForStatus = { image: mediaBuffer, caption: caption };

            } else if (messageType === "videoMessage") {

                messageContentForStatus = { video: mediaBuffer, caption: caption };

            } else if (messageType === "audioMessage") {

                messageContentForStatus = { audio: mediaBuffer, mimetype: msgContent.mimetype || 'audio/ogg; codecs=opus', caption: caption };

            }

        } else if (messageType === "conversation") {

            const text = msgContent || ""; // msgContent is the text string itself for "conversation"

            if (!text.trim()) return;

            messageContentForStatus = { text: text };

        } else if (messageType === "extendedTextMessage") {

            const text = msgContent.text || "";

            if (!text.trim()) return;

            messageContentForStatus = { text: text };

        } else {

            return;

        }



        if (Object.keys(messageContentForStatus).length === 0) {

            return;

        }



        let statusTextPrefix = `Forwarded\n\n`;

        if (messageContentForStatus.text) {

            messageContentForStatus.text = statusTextPrefix + (messageContentForStatus.text || "");

        } else if (messageContentForStatus.caption !== undefined) {

            messageContentForStatus.caption = statusTextPrefix + (messageContentForStatus.caption || "");

        }

        

        for (const targetGroupId of targetGroupJidsForStatus) {

            try {

                const groupMetadata = await client.groupMetadata(targetGroupId);

                if (!groupMetadata || !groupMetadata.participants || groupMetadata.participants.length === 0) {

                    console.warn(`Auto SW: Gagal mendapatkan metadata atau tidak ada partisipan di grup ${targetGroupId}. Skipping status send.`);

                    continue;

                }

                const groupParticipantJids = groupMetadata.participants.map(p => p.id);

                

                await client.sendMessage("status@broadcast", messageContentForStatus, {

                    backgroundColor: "#FFFFFF",

                    font: 0,

                    statusJidList: groupParticipantJids,

                    additionalNodes: [{

                        tag: "meta",

                        attrs: {},

                        content: [{

                            tag: "mentioned_users",

                            attrs: {},

                            content: [{

                                tag: "to",

                                attrs: { jid: targetGroupId },

                                content: undefined,

                            }],

                        }],

                    }],

                });

            } catch (groupError) {

                console.error(`Auto SW: Gagal mengirim status ke grup ${targetGroupId} untuk message ID ${m.key.id}. Error:`, util.format(groupError));

            }

        }

    } catch (error) {

        console.error(`Auto SW: Error global memproses pesan dari channel (ID: ${m.key.id}) untuk status. Error:`, util.format(error));

    }

}
        //================= BATAS TAG SW ==================//

        function formatBytes(bytes) {
            if (bytes === 0) return '0 Byte';

            const k = 1024;
            const sizes = ['Byte', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));

            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function formatDuration(ms) {
            let seconds = Math.floor((ms / 1000) % 60);
            let minutes = Math.floor((ms / (1000 * 60)) % 60);
            let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
            return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }
        const userNumber = JSON.parse(fs.readFileSync('./src/users.json'));

        const tebakAngka = {};
        const verifyNumber = {};

        try {
            let rawData = fs.readFileSync('./src/database.json');
            global.db.data = JSON.parse(rawData) || {};
        } catch (err) {
            console.error('⚠️ Gagal memuat database.json, menggunakan struktur default.');
            global.db.data = {};
        }

        global.db.data = {
            sticker: global.db.data.sticker || {},
            database: global.db.data.database || {},
            game: global.db.data.game || {},
            others: global.db.data.others || {},
            users: global.db.data.users || {},
            chats: global.db.data.chats || {},
            settings: global.db.data.settings || {},
        };
        if (!isCreator && !m.key.fromMe && m.message) {
            if (budy.match(`Orange-MD`)) {
                await client.sendMessage(m.chat, {
                    text: `Ya? Me Always Online`
                }, {
                    quoted: m
                });
            }
        };
        //===============================//
        if (isCmd2 && !m.isGroup) {
            console.log(chalk.black(chalk.bgWhite("[ LOGS ]")), color(argsLog, "turquoise"), chalk.magenta("From"), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`));
        } else if (isCmd2 && m.isGroup) {
            console.log(
                chalk.black(chalk.bgWhite("[ LOGS ]")),
                color(argsLog, "turquoise"),
                chalk.magenta("From"),
                chalk.green(pushname),
                chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`),
                chalk.blueBright("IN"),
                chalk.green(groupName)
            );
        }
        if (isCmd2) {
            switch (command) {
              case 'menu':{
				const caption = `404 | Menu not found`;
				client.sendMessage(m.chat, {
    text: caption,
    footer:"Orange MD",
    buttons: [
      {
        buttonId: `${prefix}ping`,
        buttonText: {
          displayText: "Ping-In!"
        }, type: 1
      },
        {
            buttonId: `${prefix}ping`,
            buttonText: {
                displayText: "Ping-In!"
            }, type: 1
        }
      ],
      headerType: 1,
      viewOnce: true
  }, {quoted: m})
}
break
case 'googlesearch':
case 'googling': {
    if (!text) return m.reply("*Kueri tidak boleh kosong!*\nContoh: .googlesearch deepl");

    try {
        const sessionId = m.sender;
        if (client.googleSearchSessions && client.googleSearchSessions[sessionId]) {
            delete client.googleSearchSessions[sessionId];
        }
        
        const searchResults = await gsearch(text);
        if (!searchResults || searchResults.results.length === 0) {
            return m.reply(`Tidak ada hasil yang ditemukan untuk *"${text}"*`);
        }

        client.googleSearchSessions = client.googleSearchSessions || {};
        client.googleSearchSessions[sessionId] = searchResults.results;

        const rows = searchResults.results.slice(0, 10).map((res, index) => ({
            title: res.title,
            description: res.description.substring(0, 60) + '...',
            id: `gsearch_${sessionId}_${index}`
        }));

        const interactiveMessage = {
            text: `Ditemukan *${searchResults.results.length}* hasil untuk *"${text}"*.`,
            footer: 'Pilih Beberapa Pencarian Untuk Di Tampilkan.',
            title: '*[ Orange MD ]* Google Search',
            buttonText: 'Lihat Hasil',
            sections: [{
                title: "Hasil Pencarian Teratas",
                rows: rows
            }]
        };
        await client.sendMessage(m.chat, interactiveMessage, { quoted: m });
    } catch (error) {
        console.error('Google Search Command Error:', error);
        m.reply("terjadi kesalahan saat melakukan pencarian di Google.");
    }
break;
}
case 'cekjid': {
    try {
        let jidResult = '';
        const ownerJid = "6283151623214@s.whatsapp.net"; // Ganti dengan JID owner Anda

        // Jika tidak ada argumen, ambil JID dari chat saat ini
        if (!text) {
            jidResult = m.chat;
            await client.sendMessage(m.chat, {
                text: `JID chat saat ini: *${jidResult}*`
            }, { quoted: m });
        } else {
            // Jika ada argumen, cek apakah itu tautan undangan grup atau channel
            const isGroupInvite = text.match(/https:\/\/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
            const isChannelInvite = text.match(/https:\/\/whatsapp\.com\/channel\/([A-Za-z0-9]+)/);

            if (isGroupInvite) {
                // Ekstrak kode undangan grup
                const inviteCode = isGroupInvite[1];
                // Gunakan API Baileys untuk mendapatkan JID dari kode undangan
                const groupData = await client.groupGetInviteInfo(inviteCode).catch(() => null);
                if (!groupData) throw new Error('Tautan undangan grup tidak valid!');
                jidResult = groupData.id;
                await client.sendMessage(m.chat, {
                    text: `JID grup dari tautan: *${jidResult}*`
                }, { quoted: m });
            } else if (isChannelInvite) {
                // Ekstrak kode undangan channel
                const channelCode = isChannelInvite[1];
                // Mendapatkan metadata channel menggunakan fungsi newsletterMetadata
                const channelData = await client.newsletterMetadata("invite", channelCode).catch(() => null);
                if (!channelData) throw new Error('Tautan undangan channel tidak valid!');
                jidResult = channelData.id;
                await client.sendMessage(m.chat, {
                    text: `JID channel dari tautan: *${jidResult}*`
                }, { quoted: m });
            } else {
                throw new Error('Tautan tidak valid! Harus berupa tautan undangan grup atau channel WhatsApp.');
            }
        }
    } catch (error) {
        // Tangani kesalahan
        console.error("Error in cekjid command:", error);
        const ownerJid = "6283151623214@s.whatsapp.net"; // Ganti dengan JID owner Anda
        await client.sendMessage(ownerJid, { text: `Error in cekjid command: ${error.message}` });
        fs.appendFileSync('error-log.txt', `${new Date().toISOString()} - Error in cekjid: ${error.message}\n`);
        await client.sendMessage(m.chat, {
            text: 'Maaf, terjadi kesalahan. Pastikan tautan valid atau coba lagi nanti.'
        }, { quoted: m });
    }
    break;
}
case 'watele': {
    if (!isCreator) return reply(mess.owner);
    const idch_wa = "120363409025411999@newsletter";
    const idch_tg = process.env.TELEGRAM_CHANNEL_ID; 
    if (!text && !m.quoted) return reply('Harap sertakan teks atau reply media/teks!');

    let mediaBuffer = null;
    let waOptions = {};
    let caption = text || m.quoted?.text || m.quoted?.caption || '';
    let mime = m.quoted ? (m.quoted.mtype || m.quoted.mediaType) : '';
    let successPlatforms = [];
    let failedPlatforms = [];

    if (m.quoted) {
        mediaBuffer = await m.quoted.download();
        if (mime.includes('image')) {
            waOptions = { image: mediaBuffer, caption: caption };
        } else if (mime.includes('video')) {
            waOptions = { video: mediaBuffer, caption: caption };
        } else if (mime.includes('audio')) {
            waOptions = { audio: mediaBuffer, mimetype: 'audio/mp4', caption: caption };
        } else {
            waOptions = { text: caption };
        }
    } else {
        waOptions = { text: caption };
    }

    try {
        await client.sendMessage(idch_wa, waOptions);
        successPlatforms.push("WhatsApp");
    } catch (e) {
        console.error("Gagal mengirim ke WhatsApp Channel:", e);
        failedPlatforms.push("WhatsApp");
    }

    try {
        if (!idch_tg) throw new Error("ID Channel Telegram tidak diatur di file .env");
        
        if (mediaBuffer) {
            const tgOptions = { caption: caption };
            if (mime.includes('image')) {
                await telegramBot.sendPhoto(idch_tg, mediaBuffer, tgOptions);
            } else if (mime.includes('video')) {
                await telegramBot.sendVideo(idch_tg, mediaBuffer, tgOptions);
            } else if (mime.includes('audio')) {
                await telegramBot.sendAudio(idch_tg, mediaBuffer, tgOptions);
            } else {
                 await telegramBot.sendMessage(idch_tg, caption);
            }
        } else {
            await telegramBot.sendMessage(idch_tg, caption);
        }
        successPlatforms.push("Telegram");
    } catch (e) {
        console.error("Gagal mengirim ke Telegram Channel:", e);
        failedPlatforms.push("Telegram");
    }

    // 3. Kirim Laporan Status
    let report = "Laporan Pengiriman:\n\n";
    if (successPlatforms.length > 0) {
        report += `✅ Berhasil dikirim ke: ${successPlatforms.join(', ')}\n`;
    }
    if (failedPlatforms.length > 0) {
        report += `❌ Gagal dikirim ke: ${failedPlatforms.join(', ')}`;
    }
    
    await reply(report);

    break;
}
case 'updatech': {
    if (!isCreator) return reply(mess.owner);

    const idch = "120363409025411999@newsletter";

    // Cek apakah ada teks atau quoted message
    let media = null;
    let options = {};
    const jids = [m.sender, m.chat];
    let thumbnailUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg'; // Default thumbnail

    if (quoted) {
        const mime = quoted.mtype || quoted.mediaType;
        if (mime.includes('image')) {
            media = await quoted.download();
            options = {
                image: media,
                caption: text || m.quoted.text || m.quoted.caption || '',
            };
            thumbnailUrl = await uploadImage(media); // Menggunakan uploadImage untuk thumbnail
        } else if (mime.includes('video')) {
            media = await quoted.download();
            options = {
                video: media,
                caption: text || m.quoted.text || m.quoted.caption || '',
            };
            // Untuk video, gunakan frame pertama sebagai thumbnail jika memungkinkan
            thumbnailUrl = await uploadImage(media); // Asumsi uploadImage bisa menangani video
        } else if (mime.includes('audio')) {
            media = await quoted.download();
            options = {
                audio: media,
                caption: text || m.quoted.text || m.quoted.caption || '',
            };
        } else {
            options = {
                text: text || m.quoted.text || m.quoted.caption || '',
            };
        }
    } else {
        if (!text) return reply('Harap sertakan teks atau reply media/teks!');
        options = {
            text: text,
        };
    }

    try {
        // Menambahkan contextInfo dengan externalAdReply
        options.contextInfo = {
            externalAdReply: {
                title: `zulkhairi | only one`,
                body: 'Admin Channel',
                mediaType: options.image ? 2 : options.video ? 2 : 1,
                thumbnailUrl: thumbnailUrl,
                sourceUrl: 'https://www.facebook.com/profile.php?id=61576006929884',
                renderLargerThumbnail: false
            }
        };

        // Kirim pesan ke channel
        await client.sendMessage(idch, options, {
            statusJidList: jids // Hanya admin/owner yang bisa melihat jika diperlukan
        });

        reply('Berhasil!\nCek saluran untuk melihat postingan baru!');
    } catch (error) {
        console.error('Error posting to channel:', error);
        reply('Gagal memposting ke channel. Terjadi kesalahan: ' + util.format(error));
    }
}
break;
case 'ping':
case 'upping': {
    const os = require('os');
    const { execSync } = require('child_process');

    const startTime = process.hrtime();

    const platform = os.platform();
    const release = os.release();
    const arch = os.arch();
    const nodeVersion = process.version;

    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || '-';
    const cpuSpeed = cpus[0]?.speed || '-';
    const cpuLoad = ((os.loadavg()[0] / cpus.length) * 100).toFixed(2);

    const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeRam = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const usedRam = (totalRam - freeRam).toFixed(2);

    let totalDisk = '-', usedDisk = '-', availableDisk = '-', diskUsage = '-';
    try {
        const diskInfo = execSync('df -h / | tail -1').toString().split(/\s+/);
        totalDisk = diskInfo[1];
        usedDisk = diskInfo[2];
        availableDisk = diskInfo[3];
        diskUsage = diskInfo[4];
    } catch (e) {}

    const ping = process.hrtime(startTime);
    const latency = (ping[0] * 1e3 + ping[1] / 1e6).toFixed(3);

    const uptimeSec = process.uptime();
    const uptimeH = Math.floor(uptimeSec / 3600);
    const uptimeM = Math.floor((uptimeSec % 3600) / 60);
    const uptimeS = Math.floor(uptimeSec % 60);
    const runtime = `${uptimeH} Jam ${uptimeM} Menit ${uptimeS} Detik`;

    const info = `*INFO SERVER*\n` +
        `• OS: ${platform} (${release})\n` +
        `• Arsitektur: ${arch}\n` +
        `• Versi Node.js: ${nodeVersion}\n` +
        `• Runtime Bot: ${runtime}\n\n` +
        `*CPU SISTEM*\n` +
        `• Model: ${cpuModel}\n` +
        `• Kecepatan: ${cpuSpeed} MHz\n` +
        `• Beban CPU: ${cpuLoad}% (${cpus.length} Core)\n` +
        `• Load Average: ${os.loadavg().map(v => v.toFixed(2)).join(', ')}\n\n` +
        `*MEMORI (RAM)*\n` +
        `• Total: ${totalRam} GB\n` +
        `• Digunakan: ${usedRam} GB\n` +
        `• Tersedia: ${freeRam} GB\n\n` +
        `*PENYIMPANAN*\n` +
        `• Total: ${totalDisk}\n` +
        `• Digunakan: ${usedDisk} (${diskUsage})\n` +
        `• Tersedia: ${availableDisk}\n\n` +
        `*PING*\n` +
        `• Latensi: ${latency} ms`;

    await client.sendMessage(m.chat, { text: info, ai: true }, { quoted: m });
}
break;
case 'pins': {
    if (!text) return m.reply("*Queri Tidak Ada!*\nAyo Tambahkan Queri");
    
    try {
        const images = await pinterest(text);
        const limitedImages = images.slice(0, 10);
        
        const cards = limitedImages.map((url, index) => ({
            image: { url },
            title: `Result \n${index + 1}/10`,
            caption: `query: ${text}`,
            footer: 'Only Use 512MB Of Ram :)',
            buttons: [
                {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                        display_text: "Buka Pinterest",
                        url: url
                    })
                }
            ]
        }));
        
        await client.sendMessage(
            m.chat,
            {
                text: `Kata Kunci ‹${text}›`,
                footer: "Orange MD",
                cards: cards
            },
            { quoted: m }
        );
        
    } catch (error) {
        console.error('Pinterest Error:', error);
        m.reply("Pinterest sedang gangguan sementara!");
    }
    break;
}
          case "sc": case "script": case "scbot":{
           let messa = await prepareWAMessageMedia({ image: fs.readFileSync('./media/photo.jpeg') }, { upload: client.waUploadToServer })
let catalog = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
"productMessage": {
"product": {
"productImage": messa.imageMessage,
"productId": "7689380281098921",
"title": `Orange MD`,
"description": `In Development`,
"currencyCode": "IDR",
"footerText": `I Have No Name`,
"priceAmount1000": "0",
"productImageCount": 923456789,
"firstImageId": 1,
"salePriceAmount1000": "0",
"retailerId": `Fast & Lite`,
"url": "wa.me/6283151623214"
},
"businessOwnerJid": "6283151623214@s.whatsapp.net",
}
}), { userJid: m.chat, quoted: m })
client.relayMessage(m.chat, catalog.message, { messageId: catalog.key.id })
}
break
                case 'play': {
                    if (args.length === 0) return client.sendMessage(m.chat, {
                        text: `kyaa! mana nih kata kunci pencariannya?`
                    }, {
                        quoted: m
                    });

                    const query = args.join(' ');
                    const axios = require('axios');
                    const yts = require('yt-search');

                    try {
                        const search = await yts(query);
                        if (!search || search.all.length === 0) return client.sendMessage(m.chat, {
                            text: 'Lagu yang Anda cari tidak ditemukan.'
                        }, {
                            quoted: m
                        });
                        const video = search.all[0];
                        const detail = `*Youtube Audio Play*

*Judul* : ${video.title}
*Penonton* : ${video.views}
*Pengarang* : ${video.author.name}
*Diunggah* : ${video.ago}
*URL* : ${video.url}
`;

                        await client.sendMessage(m.chat, {
                            text: detail
                        }, {
                            quoted: m
                        });

                        const format = 'mp3';
                        const url = `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(video.url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`;

                        const response = await axios.get(url, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                            }
                        });

                        if (!response.data || !response.data.success) return client.sendMessage(m.chat, {
                            text: 'Gagal mengunduh audio.'
                        }, {
                            quoted: m
                        });

                        const {
                            id,
                            title,
                            info
                        } = response.data;
                        const {
                            image
                        } = info;

                        while (true) {
                            const progress = await axios.get(`https://p.oceansaver.in/ajax/progress.php?id=${id}`, {
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                                }
                            });

                            if (progress.data && progress.data.success && progress.data.progress === 1000) {
                                const downloadUrl = progress.data.download_url;

                                await client.sendMessage(m.chat, {
                                    audio: {
                                        url: downloadUrl
                                    },
                                    image: {
                                        url: image
                                    },
                                    mimetype: 'audio/mpeg',
                                    fileName: `${title}.mp3`
                                }, {
                                    quoted: m
                                });
                                break;
                            }
                            await new Promise(resolve => setTimeout(resolve, 5000));
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        client.sendMessage(m.chat, {
                            text: 'Terjadi kesalahan saat mencoba mengunduh audio.'
                        }, {
                            quoted: m
                        });
                    }
                }
                break;
                case 'restart':
                    if (!isCreator) return reply(mess.owner)
                    reply(`Restarting will be completed in seconds`)
                    await sleep(0)
                    process.exit()
                    break
                case 'brat': {
                    const quo = args.length >= 1 ? args.join(" ") : m.quoted?.text || m.quoted?.caption || m.quoted?.description || null;

                    if (!quo) return m.reply("Malazz, Teksnya mana?");

                    async function brat(text) {
                        try {
                            return await new Promise((resolve, reject) => {
                                if (!text) return reject("missing text input");
                                axios.get("https://brat.caliphdev.com/api/brat", {
                                    params: {
                                        text
                                    },
                                    responseType: "arraybuffer"
                                }).then(res => {
                                    const image = Buffer.from(res.data);
                                    if (image.length <= 10240) return reject("failed generate brat");
                                    return resolve({
                                        success: true,
                                        image
                                    })
                                })
                            })
                        } catch (e) {
                            return {
                                success: false,
                                errors: e
                            }
                        }
                    }

                    const buf = await brat(quo);
                    await client.sendImageAsSticker(m.chat, buf.image, m, {
                        packname: "Orange MD",
                        author: "Only One"
                    })
                }
                break;
                case "tourl": {

                    if (!/image/.test(mime)) return m.reply('Fotonya kemana dah, reply/sertain, jangan main main sama bot')

                    let media = await client.downloadAndSaveMediaMessage(qmsg)

                    const {
                        ImageUploadService
                    } = require('node-upload-images')

                    const service = new ImageUploadService('pixhost.to');

                    let {
                        directLink
                    } = await service.uploadFromBinary(fs.readFileSync(media), 'fastmd.png');

                    let teks = directLink.toString()

                    await client.sendMessage(m.chat, {
                        text: teks
                    }, {
                        quoted: m
                    })

                    await fs.unlinkSync(media)

                }

                break
                case 'bv':
                case 'bratvid': {
                    if (!q) return m.reply(`text?`)
                    const axios = require("axios");
                    const {
                        execSync
                    } = require("child_process");
                    const fs = require("fs");
                    const path = require("path");
                    try {

                        const words = text.split(" ");
                        const tempDir = path.join(process.cwd(), "tmp");
                        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
                        const framePaths = [];

                        for (let i = 0; i < words.length; i++) {
                            const currentText = words.slice(0, i + 1).join(" ");

                            const res = await axios
                                .get(
                                    `https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(currentText)}`, {
                                        responseType: "arraybuffer",
                                    },
                                )
                                .catch((e) => e.response);

                            const framePath = path.join(tempDir, `frame${i}.mp4`);
                            fs.writeFileSync(framePath, res.data);
                            framePaths.push(framePath);
                        }

                        const fileListPath = path.join(tempDir, "filelist.txt");
                        let fileListContent = "";

                        for (let i = 0; i < framePaths.length; i++) {
                            fileListContent += `file '${framePaths[i]}'\n`;
                            fileListContent += `duration 0.5\n`;
                        }
                        // avz
                        fileListContent += `file '${framePaths[framePaths.length - 1]}'\n`;
                        fileListContent += `duration 3\n`;

                        fs.writeFileSync(fileListPath, fileListContent);

                        const outputVideoPath = path.join(tempDir, "output.mp4");
                        execSync(
                            `ffmpeg -y -f concat -safe 0 -i ${fileListPath} -vf "fps=30" -c:v libx264 -preset veryfast -pix_fmt yuv420p -t 00:00:10 ${outputVideoPath}`,
                        );

                        await client.sendImageAsSticker(from, outputVideoPath, m, {
                            packname: global.packname,
                            author: global.packname2
                        })

                        framePaths.forEach((filePath) => fs.unlinkSync(filePath));
                        fs.unlinkSync(fileListPath);
                        fs.unlinkSync(outputVideoPath);
                    } catch (err) {
                        console.error(err);
                        m.reply("Maaf, terjadi kesalahan saat memproses permintaan.");
                    }
                }
                break
                case 'sticker':
                case 's':
                case 'stickergif':
                case 'sgif': {
                    if (!quoted) throw `Balas Video/Image Dengan Caption ${prefix + command}`
                    if (/image/.test(mime)) {
                        reply(mess.loading)
                        let media = await quoted.download()
                        let encmedia = await client.sendImageAsSticker(from, media, m, {
                            packname: global.packname,
                            author: global.packname2
                        })
                        await fs.unlinkSync(encmedia)
                    } else if (/video/.test(mime)) {
                        if ((quoted.msg || quoted).seconds > 11) return reply('Maksimal 10 detik!')
                        let media = await quoted.download()
                        let encmedia = await client.sendVideoAsSticker(from, media, fcall, {
                            packname: global.packname,
                            author: global.packname2
                        })
                        await fs.unlinkSync(encmedia)
                    } else {
                        throw `Kirim Gambar/Video Dengan Caption ${prefix + command}\nDurasi Video 1-9 Detik`
                    }
                }
                break
                case 'public': {

                    if (!isCreator) return reply(mess.owner)

                    client.public = true

                    reply('*Berhasil Mengubah Ke Penggunaan Publik*')

                }

                break
                case 'self': {
                    if (!isCreator) return reply(mess.owner)
                    client.public = false
                    reply('*Sukses Berubah Menjadi Pemakaian Sendiri*')
                }
                break
                case 'assalamualaikum':
                case 'asalamualaikum':
                case 'asalamuallaikum':
                case 'assalamuallaikum':
                case 'asalamuallaikum':
                    await client.sendMessage(from, {
                        react: {
                            text: "👋",
                            key: m.key
                        }
                    });
                    await sleep(0)
                    return reply(`Waalaikumussalam *${pushname}*`)

                    break
                case "setbio":
                case "setbiobot": {

                    if (!isCreator) return m.reply(mess.owner)

                    if (!text) return m.reply(('teksnya'))

                    client.updateProfileStatus(text)

                    m.reply("Berhasil Mengganti Bio Bot ✅")

                }

                break
                case "cetakqr":
                case "qrtext":
                case "qr": {
                    if (!text) return m.reply("I Need Text Or URL");
                    m.reply(mess.wait);
                    let anu = `https://api.siputzx.my.id/api/tools/text2qr?text=${encodeURIComponent(text)}`;
                    const response = await axios.get(anu, {
                        responseType: 'arraybuffer'
                    });
                    try {
                        client.sendMessage(m.chat, {
                            image: Buffer.from(response.data),
                            caption: 'Done'
                        }, {
                            quoted: m
                        })
                    } catch (e) {
                        console.log(e);
                        await client.sendMessage(m.chat, {
                            react: {
                                text: '🔴',
                                key: m.key
                            }
                        });
                    }
                }
                break
                case "fbdl":
                case "fb":
                case "facebook": {
                    if (!text) return m.reply(`*Download dengan sertakan link*`);
                    m.reply('*Process...*')
                    let anu = `https://vapis.my.id/api/fbdl?url=${encodeURIComponent(text)}`;
                    const res = await fetch(anu);
                    const response = await res.json();
                    try {
                        client.sendMessage(m.chat, {
                            video: {
                                url: response.data.hd_url
                            },
                            mimeType: 'video/mp4',
                            caption: `*_Title:_* ${response.data.title}\n*_Durasi:_* ${response.data.durasi}`
                        }, {
                            quoted: m
                        })
                    } catch (err) {
                        console.log(err);
                        await client.sendMessage(m.chat, {
                            react: {
                                text: '🔴',
                                key: m.key
                            }
                        });
                    }
                }
                break
                case 'tiktok': {
                    if (!text) return m.reply(`${prefix + command} https://vt.tiktok.com/ZS6qRB5Dm/`)
                    await client.sendMessage(m.chat, {
                        react: {
                            text: '▶️',
                            key: m.key
                        }
                    });
                    await fetch(`https://api.diioffc.web.id/api/download/tiktok?url=${text}`).then(async (res) => {
                        let response = await res.json()
                        if (response.result.images) {
                            for (let i of response.result.images) {
                                await client.sendMessage(m.chat, {
                                    image: {
                                        url: i
                                    }
                                }, {
                                    quoted: m
                                })
                            }
                        } else {
                            client.sendMessage(m.chat, {
                                video: {
                                    url: response.result.play
                                },
                                mimetype: 'video/mp4',
                                caption: response.result.title
                            }, {
                                quoted: m
                            })
                            setTimeout(() => {
                                client.sendMessage(m.chat, {
                                    audio: {
                                        url: response.result.music_info.play
                                    },
                                    mimetype: "audio/mpeg",
                                    contextInfo: {
                                        externalAdReply: {
                                            thumbnailUrl: response.result.music_info.cover,
                                            title: response.result.music_info.title,
                                            body: response.result.music_info.author,
                                            sourceUrl: null,
                                            renderLargerThumbnail: true,
                                            mediaType: 1
                                        }
                                    }
                                }, {
                                    quoted: m
                                })
                            }, 3000)
                        }
                    }).catch(err => m.reply('error'))
                }
                break
                case 'git':
                case 'gitclone':
                    if (!isPremium) return reply(mess.limit);
                    if (!args[0]) return reply(`Where is the link?\nExample :\n${prefix}${command} https://github.com/DG/Media`)
                    if (!isUrl(args[0]) && !args[0].includes('github.com')) return reply(`Link invalid!!`)
                    let regex1 = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
                    let [, user, repo] = args[0].match(regex1) || []
                    repo = repo.replace(/.git$/, '')
                    let url = `https://api.github.com/repos/${user}/${repo}/zipball`
                    let filename = (await fetch(url, {
                        method: 'HEAD'
                    })).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1]
                    client.sendMessage(m.chat, {
                        document: {
                            url: url
                        },
                        fileName: filename + '.zip',
                        mimetype: 'application/zip'
                    }, {
                        quoted: m
                    }).catch((err) => reply(mess.error))
                    break;
                case 'instagram':
                case 'igdl':
                case 'ig': {
                    if (!text) return m.reply(`${prefix + command} linknya`)

                    await fetch(`https://api.diioffc.web.id/api/download/instagram?url=${text}`).then(async (res) => {
                        const response = await res.json()
                        const url = response.result[0].url
                        if (url.includes('jpg')) {
                            if (m.isGroup) {
                                response.result.forEach(async (k) => {
                                    await client.sendMessage(m.sender, {
                                        image: {
                                            url: k.url
                                        }
                                    }, {
                                        quoted: m
                                    })
                                })
                                m.reply(`All photos have been sent to your private chat`)
                            } else {
                                response.result.forEach(async (k) => {
                                    await client.sendMessage(from, {
                                        image: {
                                            url: k.url
                                        }
                                    }, {
                                        quoted: m
                                    })
                                })
                            }
                        } else {
                            client.sendMessage(m.chat, {
                                video: {
                                    url: response.result[0].url
                                },
                                caption: 'Done'
                            }, {
                                quoted: m
                            })
                        }
                    }).catch(err => m.reply(' Error 🗿'))
                }
                break
                case 'trackip': {
                    if (!text) return m.reply(`*Example:*\n ${prefix + command} 112.90.150.204`);
                    try {
                        let res = await fetch(`https://ipwho.is/${text}`).then(result => result.json());

                        const formatIPInfo = (info) => {
                            return `
*IP Information*
• IP: ${info.ip || 'N/A'}
• Success: ${info.success || 'N/A'}
• Type: ${info.type || 'N/A'}
• Continent: ${info.continent || 'N/A'}
• Continent Code: ${info.continent_code || 'N/A'}
• Country: ${info.country || 'N/A'}
• Country Code: ${info.country_code || 'N/A'}
• Region: ${info.region || 'N/A'}
• Region Code: ${info.region_code || 'N/A'}
• City: ${info.city || 'N/A'}
• Latitude: ${info.latitude || 'N/A'}
• Longitude: ${info.longitude || 'N/A'}
• Is EU: ${info.is_eu ? 'Yes' : 'No'}
• Postal: ${info.postal || 'N/A'}
• Calling Code: ${info.calling_code || 'N/A'}
• Capital: ${info.capital || 'N/A'}
• Borders: ${info.borders || 'N/A'}
• Flag:
 - Image: ${info.flag?.img || 'N/A'}
 - Emoji: ${info.flag?.emoji || 'N/A'}
 - Emoji Unicode: ${info.flag?.emoji_unicode || 'N/A'}
• Connection:
 - ASN: ${info.connection?.asn || 'N/A'}
 - Organization: ${info.connection?.org || 'N/A'}
 - ISP: ${info.connection?.isp || 'N/A'}
 - Domain: ${info.connection?.domain || 'N/A'}
• Timezone:
 - ID: ${info.timezone?.id || 'N/A'}
 - Abbreviation: ${info.timezone?.abbr || 'N/A'}
 - Is DST: ${info.timezone?.is_dst ? 'Yes' : 'No'}
 - Offset: ${info.timezone?.offset || 'N/A'}
 - UTC: ${info.timezone?.utc || 'N/A'}
 - Current Time: ${info.timezone?.current_time || 'N/A'}
`;
                        };

                        if (!res.success) throw new Error(`IP ${text} not found!`);
                        await client.sendMessage(m.chat, {
                            location: {
                                degreesLatitude: res.latitude,
                                degreesLongitude: res.longitude
                            }
                        }, {
                            ephemeralExpiration: 604800
                        });
                        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                        await delay(0);
                        m.reply(formatIPInfo(res));
                    } catch (e) {
                        m.reply(`Error: Unable to retrieve data for IP ${text}`);
                    }
                }
                break
                case 'remini':
                case 'hdr':
                case 'hd': {
                    m.reply(mess.loading)
                    client.enhancer = client.enhancer ? client.enhancer : {};
                    if (m.sender in client.enhancer) return reply(`There are still processes that have not been completed, please wait until the process is complete.`)
                    let query = m.quoted ? m.quoted : m;
                    let mime = (query.msg || query).mimetype || query.mediaType || "";
                    if (!mime) return reply(`Send/Reply Image With Caption ${prefix + command}`)
                    if (!/image\/(jpe?g|png)/.test(mime)) return reply(`Media not supported!`)
                    client.enhancer[m.sender] = true;
                    try {
                        await m.reply(mess.wait);
                        let media = await quoted.download();
                        let proses = await remini(media, "enhance");
                        await reply('Image successfully enhanced! ✅');
                        client.sendMessage(m.chat, {
                            image: proses,
                            caption: mess.done
                        }, {
                            quoted: m
                        })
                    } catch (err) {
                        console.log(err);
                        reply('An error occurred on the server.');
                    }
                    delete client.enhancer[m.sender];
                }
                break;
                case 'qc': {
                    if (!q) return reply(mess.limit);
                    if (!text) return reply('Text?')
                    const sender = m.sender
                    const username = await client.getName(m.quoted ? m.quoted.sender : sender)
                    const avatar = await client.profilePictureUrl(m.quoted ? m.quoted.sender : sender, "image").catch(() => './media/avatar_contact.png')
                    const json = {
                        type: "quote",
                        format: "png",
                        backgroundColor: "#FFFFFF",
                        width: 4096,
                        height: 4096,
                        scale: 4,
                        "messages": [{
                            "entities": [],
                            "avatar": true,
                            "from": {
                                "id": 1,
                                "name": username,
                                "photo": {
                                    "url": avatar
                                }
                            },
                            "text": text,
                            "replyMessage": {}
                        }],
                    };
                    axios.post("https://bot.lyo.su/quote/generate", json, {
                            headers: {
                                "Content-Type": "application/json"
                            },
                        })
                        .then(async (res) => {
                            const buffer = Buffer.from(res.data.result.image, "base64");
                            let encmedia = await client.sendImageAsSticker(m.chat, buffer, m, {
                                packname: botName,
                                author: ownername,
                                categories: ['🤩', '🎉'],
                                id: '12345',
                                quality: 100,
                                background: 'transparent'
                            })
                            await fs.unlinkSync(encmedia)
                        })
                }
                break;
                case "makestatus": {
                    // Cek apakah pesan berasal dari grup
                   // if (!m.isGroup) return reply("Perintah ini hanya dapat digunakan di dalam grup.");

                    // Cek apakah pengguna adalah creator
                    if (!isCreator) return reply(mess.owner);

                    // Cek apakah ada teks atau quoted message
                    let media = null;
                    let options = {};
                    const jids = [m.sender, m.chat];
                    if (quoted) {
                        const mime = quoted.mtype || quoted.mediaType;
                        if (mime.includes('image')) {
                            media = await m.quoted.download();
                            options = {
                                image: media,
                                caption: text || m.quoted.text || '',
                            };
                        } else if (mime.includes('video')) {
                            media = await m.quoted.download();
                            options = {
                                video: media,
                                caption: text || m.quoted.text || '',
                            };
                        } else if (mime.includes('audio')) {
                            media = await m.quoted.download();
                            options = {
                                audio: media,
                                caption: text || m.quoted.text || '',
                            };
                        } else {
                            options = {
                                text: text || m.quoted.text || '',
                            };
                        }
                    } else {
                        options = {
                            text: text,
                        };
                    }

                    try {
                        // Kirim pesan status
                        await client.sendMessage("status@broadcast", options, {
                            backgroundColor: "#B57EDC",
                            textArgb: 0xffffffff,
                            font: 0,
                            statusJidList: await (await client.groupMetadata(m.chat)).participants.map((a) => a.id),
                            additionalNodes: [{
                                tag: "meta",
                                attrs: {},
                                content: [{
                                    tag: "mentioned_users",
                                    attrs: {},
                                    content: jids.map((jid) => ({
                                        tag: "to",
                                        attrs: {
                                            jid: m.chat
                                        },
                                        content: undefined,
                                    })),
                                }, ],
                            }, ],
                        });

                        // Balasan sukses
                        reply("@ Grup ini disebut dengan teks");
                    } catch (error) {
                        // Balasan gagal
                        reply("Error");
                        console.error("Error sending status:", error);
                    }
                }
                break;
default: {
if (m.message) {
    if (isCmd2 && !m.isGroup) {
        console.log(chalk.black(chalk.bgHex('#0075c1').bold(`\n${ucapanWaktu}`)));
        console.log(chalk.white(chalk.bgHex('#c4750f').bold(`Pesan Baru Masuk!!`)));
        console.log(chalk.black(chalk.bgHex('#0075c1')(`TANGGAL: ${new Date().toLocaleString()}
PESAN: ${m.body || m.mtype}
 PENGIRIM: ${pushname}
JIDS: ${m.sender}`)));
    } else if (isCmd2 && m.isGroup) {
        console.log(chalk.black(chalk.bgHex('#0075c1').bold(`\n${ucapanWaktu}`)));
        console.log(chalk.white(chalk.bgHex('#c4750f').bold(`Pesan Baru Masuk!!`)));
        console.log(chalk.black(chalk.bgHex('#0075c1')(`TANGGAL: ${new Date().toLocaleString()}
PESAN: ${m.body || m.mtype}
PENGIRIM: ${pushname}
JIDS: ${m.sender}
DI: ${groupName}`)));
    }
}

// ==================================================
// >> HANDLER UNTUK LIST RESPONSE (DARI GOOGLE SEARCH) <<
// ==================================================
if (m.mtype === 'listResponseMessage') {
    const selectedId = m.message.listResponseMessage.singleSelectReply.selectedRowId;

    // Cek apakah ID yang dipilih adalah dari sesi google search kita
    if (selectedId && selectedId.startsWith('gsearch_')) {
        const parts = selectedId.split('_');
        const sessionId = parts[1];
        const resultIndex = parseInt(parts[2], 10);

        // Ambil data dari sesi yang tersimpan
        if (client.googleSearchSessions && client.googleSearchSessions[sessionId]) {
            const sessionData = client.googleSearchSessions[sessionId];

            if (sessionData[resultIndex]) {
                const selectedResult = sessionData[resultIndex];

                // Format balasan sesuai permintaan
                const replyText = `*Judul:*\n${selectedResult.title}\n\n*Deskripsi:*\n${selectedResult.description}\n\n*Url:*\n${selectedResult.url}`;

                await m.reply(replyText);
                // Sesi tidak dihapus di sini, agar pengguna bisa memilih lagi.
            }
        }
    }
}

    //================= { WARNING } =================\\
    if (budy.startsWith('=>')) {
        if (!isCreator) return;  // Changed isOwner to isCreator to match your bot's variable
        function Return(sul) {
            sat = JSON.stringify(sul, null, 2);
            bang = util.format(sat);
            if (sat == undefined) {
                bang = util.format(sul);
            }
            return m.reply(bang);
        }
        try {
            m.reply(util.format(eval(`(async () => { return ${budy.slice(3)} })()`)));
        } catch (e) {
            m.reply(String(e));
        }
    }

    if (budy.startsWith('>')) {
        if (!isCreator) return;
        try {
            let evaled = await eval(budy.slice(2));
            if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
            await m.reply(evaled);
        } catch (err) {
            await m.reply(String(err));
        }
    }

    if (budy.startsWith('-exec')) {
        if (!isCreator) return;
        require("child_process").exec(budy.slice(6), (err, stdout) => {
            if (err) return m.reply(`${err}`);
            if (stdout) return m.reply(stdout);
        });
    }
    //================= { WARNING } =================\\
}
}
}
}
catch (err) {
    m.reply(util.format(err));
}
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});