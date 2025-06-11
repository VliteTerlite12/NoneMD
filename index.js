const donet = "https://saweria.co/";
const {
  default: fastbyteConnect,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  jidDecode,
  jidNormalizedUser,
  downloadContentFromMessage,
  PHONENUMBER_MCC,
  proto,
  getContentType,
  Browsers, 
  fetchLatestWaWebVersion
} = require("baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const axios = require("axios");
const chalk = require("chalk");
const yargs = require('yargs/yargs');
const readline = require('readline');
const FileType = require('file-type');
const { exec } = require('child_process');
const NodeCache = require('node-cache');
const figlet = require("figlet");
const _ = require("lodash");
const PhoneNumber = require("awesome-phonenumber");
var low;
try {
  low = require('lowdb');
} catch (e) {
  low = require('./lib/lowdb');
}

const { Low, JSONFile } = low;

// Initialize group metadata cache
const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false });

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.db = new Low(
  /https?:\/\//.test(opts['db'] || '') ?
    new cloudDBAdapter(opts['db']) : /mongodb/.test(opts['db']) ?
      new mongoDB(opts['db']) :
      new JSONFile(`src/database.json`)
);
global.DATABASE = global.db; // Backwards Compatibility
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000));
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read();
  global.db.READ = false;
  global.db.data = {
    users: {},
    group: {},
    chats: {},
    database: {},
    game: {},
    settings: {},
    donate: {},
    others: {},
    sticker: {},
    anonymous: {},
    ...(global.db.data || {})
  };
  global.db.chain = _.chain(global.db.data);
};
loadDatabase();

// Save database every 30 seconds
if (global.db) setInterval(async () => {
  if (global.db.data) await global.db.write();
}, 30 * 1000);

const { GroupUpdate, GroupParticipantsUpdate, MessagesUpsert, Solving } = require('./src/message');
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('./lib/myfunc');
const { imageToWebp, imageToWebp3, videoToWebp, writeExifImg, writeExifImgAV, writeExifVid } = require('./lib/exif');

const pairingCode = global.pairing_code || process.argv.includes('--pairing-code');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// Define a secret key (can be any string or dynamically generated)
const SECRET_KEY = '6283151623214'; // Change this to your desired key

async function startHisoka() {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const { version, isLatest } = await fetchLatestWaWebVersion().catch(() => fetchLatestBaileysVersion());

  // Cek apakah sesi sudah terdaftar
  if (!state.creds.registered) {
    let quest = `\n${chalk.red.bold('╭──────────────────────────────────────────────────────╮')}\n${chalk.red.bold('│')} ${chalk.bold('❗️ Anda belum memiliki session ❗️')}\n\n${chalk.bold('Developer By fastbyteDev')} ${chalk.red.bold('│')}\n${chalk.red.bold('╰──────────────────────────────────────────────────────╯')}\n            \n${chalk.green('🏷 Pilih salah satu dari opsi berikut untuk menautkan perangkat:')}\n${chalk.blue('▪︎ qr')}\n${chalk.blue('▪︎ pairing')}\n\n${chalk.yellow('Masukan Kode Login Anda Di Akhir Saat Anda Memilih type Kode Login Anda: ')}\n\n${chalk.yellow('* Ketik salah satu dari opsi di atas, contoh:')} ${chalk.blue.bold('pairing')}\n\n${chalk.yellow('Please type here: ')}`;

    await sleep(0);
    const opsi = await question(quest);
    if (opsi === "pairing") {
      global.pairingCode = true;
    } else if (opsi === "qr") {
      global.pairingCode = false;
    } else {
      console.log(`Pilihan opsi tidak tersedia!`);
    }
  } else {
    global.pairingCode = false;
  }

  const fastbyte = fastbyteConnect({
    cachedGroupMetadata: async (jid) => groupCache.get(jid),
    auth: state,
    printQRInTerminal: !global.pairingCode,
    version: [2, 3000, 1019441105],
    browser: Browsers.ubuntu("Firefox"),
  });

  // Proses pairing hanya dijalankan jika pairingCode true dan sesi belum terdaftar
  if (global.pairingCode && !fastbyte.authState.creds.registered) {
    let phoneNumber;
    let enteredKey;

    // Function to prompt for key
    async function getKey() {
      enteredKey = await question(chalk.black(chalk.green.bold(`Masukkan Key Anda: `)));
      if (enteredKey !== SECRET_KEY) {
        console.log(chalk.red.bold('Key Salah! Silakan coba lagi.'));
        await getKey();
      } else {
        console.log(chalk.green.bold('Key Valid!'));
        await getPhoneNumber(); // Proceed with phone number input after key is validated
      }
    }

    // Function to prompt for phone number
    async function getPhoneNumber() {
      phoneNumber = await question(chalk.black(chalk.green.bold(`Silakan Masukkan Nomor WhatsApp Anda (misalnya 62xx): `)));
      phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

      if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v)) || phoneNumber.length < 6) {
        console.log(chalk.redBright('Kode Negara Nomor Telepon Tidak Valid! Contoh: 6287874137196'));
        await getPhoneNumber();
      } else {
        await exec('rm -rf ./session/*'); // Remove old session if exists
        let code = await fastbyte.requestPairingCode(phoneNumber); // Request pairing code
        console.log(chalk.cyan.bold(`Kode Pairing Anda: `), chalk.white.bold(code)); // Display pairing code
      }
    }

    // Start the key entry process
    await getKey();
  }

  store.bind(fastbyte.ev);

  fastbyte.ev.on("messages.upsert", async (chatUpdate) => {
    try {
      mek = chatUpdate.messages[0];
      if (!mek.message) return;
      mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;
      if (mek.key && mek.key.remoteJid === "status@broadcast") return;
      if (!fastbyte.public && !mek.key.fromMe && chatUpdate.type === "notify") return;
      if (mek.key.id.startsWith("BAE5") && mek.key.id.length === 16) return;
      m = smsg(fastbyte, mek, store);
      require("./fastbyte")(fastbyte, m, chatUpdate, store);
    } catch (err) {
      console.log(err);
    }
  });

  // Cache group metadata on group updates
  fastbyte.ev.on('groups.update', async ([event]) => {
    try {
      const metadata = await fastbyte.groupMetadata(event.id);
      groupCache.set(event.id, metadata);
    } catch (err) {
      console.error('Error caching group metadata on groups.update:', err);
    }
  });

  // Cache group metadata on group participants updates
  fastbyte.ev.on('group-participants.update', async (event) => {
    try {
      const metadata = await fastbyte.groupMetadata(event.id);
      groupCache.set(event.id, metadata);
    } catch (err) {
      console.error('Error caching group metadata on group-participants.update:', err);
    }
  });

  // Handle error
  const unhandledRejections = new Map();
  process.on("unhandledRejection", (reason, promise) => {
    unhandledRejections.set(promise, reason);
    console.log("Unhandled Rejection at:", promise, "reason:", reason);
  });
  process.on("rejectionHandled", (promise) => {
    unhandledRejections.delete(promise);
  });
  process.on("Something went wrong", function (err) {
    console.log("Caught exception: ", err);
  });

  fastbyte.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };

  fastbyte.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options);
    } else {
      buffer = await imageToWebp(buff);
    }
    await fastbyte.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
  };

  fastbyte.sendImageAsStickerAV = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImgAV(buff, options);
    } else {
      buffer = await imageToWebp2(buff);
    }
    await fastbyte.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
  };

  fastbyte.sendImageAsStickerAvatar = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options);
    } else {
      buffer = await imageToWebp3(buff);
    }
    await fastbyte.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
  };

  fastbyte.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifVid(buff, options);
    } else {
      buffer = await videoToWebp(buff);
    }
    await fastbyte.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
  };

  fastbyte.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  };

  fastbyte.cMod = (jid, copy, text = '', sender = fastbyte.user.id, options = {}) => {
    let mtype = Object.keys(copy.message)[0];
    let isEphemeral = mtype === 'ephemeralMessage';
    if (isEphemeral) {
      mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
    }
    let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
    let content = msg[mtype];
    if (typeof content === 'string') msg[mtype] = text || content;
    else if (content.caption) content.caption = text || content.caption;
    else if (content.text) content.text = text || content.text;
    if (typeof content !== 'string') msg[mtype] = { ...content, ...options };
    if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
    else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
    if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid;
    else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid;
    copy.key.remoteJid = jid;
    copy.key.fromMe = sender === fastbyte.user.id;
    return proto.WebMessageInfo.fromObject(copy);
  };

  fastbyte.sendFile = async (jid, PATH, fileName, quoted = {}, options = {}) => {
    let types = await fastbyte.getFile(PATH, true);
    let { filename, size, ext, mime, data } = types;
    let type = '', mimetype = mime, pathFile = filename;
    if (options.asDocument) type = 'document';
    if (options.asSticker || /webp/.test(mime)) {
      let { writeExif } = require('./lib/sticker.js');
      let media = { mimetype: mime, data };
      pathFile = await writeExif(media, { packname: global.packname, author: global.packname2, categories: options.categories ? options.categories : [] });
      await fs.promises.unlink(filename);
      type = 'sticker';
      mimetype = 'image/webp';
    } else if (/image/.test(mime)) type = 'image';
    else if (/video/.test(mime)) type = 'video';
    else if (/audio/.test(mime)) type = 'audio';
    else type = 'document';
    await fastbyte.sendMessage(jid, { [type]: { url: pathFile }, mimetype, fileName, ...options }, { quoted, ...options });
    return fs.promises.unlink(pathFile);
  };

  fastbyte.parseMention = async (text) => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
  };

  fastbyte.copyNForward = async (jid, message, forceForward = false, options = {}) => {
    let vtype;
    if (options.readViewOnce) {
      message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined);
      vtype = Object.keys(message.message.viewOnceMessage.message)[0];
      delete (message.message && message.message.ignore ? message.message.ignore : (message.message || undefined));
      delete message.message.viewOnceMessage.message[vtype].viewOnce;
      message.message = { ...message.message.viewOnceMessage.message };
    }
    let mtype = Object.keys(message.message)[0];
    let content = await generateForwardMessageContent(message, forceForward);
    let ctype = Object.keys(content)[0];
    let context = {};
    if (mtype != "conversation") context = message.message[mtype].contextInfo;
    content[ctype].contextInfo = { ...context, ...content[ctype].contextInfo };
    const waMessage = await generateWAMessageFromContent(jid, content, options ? { ...content[ctype], ...options, ...(options.contextInfo ? { contextInfo: { ...content[ctype].contextInfo, ...options.contextInfo } } : {}) } : {});
    await fastbyte.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
    return waMessage;
  };

  fastbyte.sendReact = async (jid, emoticon, keys = {}) => {
    let reactionMessage = { react: { text: emoticon, key: keys } };
    return await fastbyte.sendMessage(jid, reactionMessage);
  };

  // Setting
  fastbyte.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    } else return jid;
  };

  fastbyte.ev.on("contacts.update", (update) => {
    for (let contact of update) {
      let id = fastbyte.decodeJid(contact.id);
      if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
    }
  });

  fastbyte.getName = (jid, withoutContact = false) => {
    id = fastbyte.decodeJid(jid);
    withoutContact = fastbyte.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) v = groupCache.get(id) || await fastbyte.groupMetadata(id) || {};
        resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
      });
    else
      v = id === "0@s.whatsapp.net" ? { id, name: "WhatsApp" } : id === fastbyte.decodeJid(fastbyte.user.id) ? fastbyte.user : store.contacts[id] || {};
    return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
  };

  fastbyte.public = true;

  fastbyte.serializeM = (m) => smsg(fastbyte, m, store);

  const { spawn } = require('child_process');

  fastbyte.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === "close") {
      let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      
      // Handler untuk bad session
      if (reason === DisconnectReason.badSession) {
        console.log(chalk.red.bold("🔄 Bad Session Terdeteksi, Merestart..."));
        
        try {
          // 2. Restart aplikasi
          console.log(chalk.yellow("🚀 Memulai proses restart..."));
          const child = spawn(process.argv[0], process.argv.slice(1), {
            detached: true,
            stdio: 'ignore',
            windowsHide: true,
            env: process.env
          });
          child.unref();

          // 3. Exit proses lama
          process.nextTick(() => process.exit(0));
          
        } catch (err) {
          console.error(chalk.red("❌ Gagal restart:", err));
          process.exit(1);
        }
      }
      // Handler untuk disconnect reason lainnya
      else if (reason === DisconnectReason.connectionClosed) {
        console.log("Connection closed, reconnecting....");
        startHisoka();
      } 
      else if (reason === DisconnectReason.connectionLost) {
        console.log("Connection Lost from Server, reconnecting...");
        startHisoka();
      } 
      else if (reason === DisconnectReason.connectionReplaced) {
        console.log("Connection Replaced, Another New Session Opened, Please Restart Bot");
        process.exit();
      } 
      else if (reason === DisconnectReason.loggedOut) {
        console.log(`Device Logged Out, Please Delete Folder Session and Scan Again.`);
        process.exit();
      } 
      else if (reason === DisconnectReason.restartRequired) {
        console.log("Restart Required, Restarting...");
        startHisoka();
      } 
      else if (reason === DisconnectReason.timedOut) {
        console.log("Connection TimedOut, Reconnecting...");
        startHisoka();
      } 
      else {
        console.log(`Unknown DisconnectReason: ${reason}|${connection}`);
        startHisoka();
      }
    } 
    // Handler saat koneksi terbuka
    else if (connection === "open") {
      console.log(chalk.green("✅ BOT TERSAMBUNG DENGAN WHATSAPP"));
      const botNumber = await fastbyte.decodeJid(fastbyte.user.id);
      fastbyte.sendMessage("6283151623214@s.whatsapp.net", { 
        text: `*BOT TERSAMBUNG ✅*\n\n` +
              `• Waktu: ${new Date().toLocaleString()}\n`
      });
    }
  });

  fastbyte.ev.on("creds.update", saveCreds);
  const getBuffer = async (url, options) => {
    try {
      options ? options : {};
      const res = await axios({
        method: "get",
        url,
        headers: {
          DNT: 1,
          "Upgrade-Insecure-Request": 1,
        },
        ...options,
        responseType: "arraybuffer",
      });
      return res.data;
    } catch (err) {
      return err;
    }
  };

  fastbyte.sendImage = async (jid, path, caption = "", quoted = "", options) => {
    let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], "base64") : /^https?:\/\//.test(path) ? await await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    return await fastbyte.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted });
  };

  fastbyte.sendText = (jid, text, quoted = "", options) => fastbyte.sendMessage(jid, { text: text, ...options }, { quoted });

  return fastbyte;
}

startHisoka();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});