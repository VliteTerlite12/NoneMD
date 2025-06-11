const fs = require('fs')
const chalk = require('chalk')
const Styles = (text, style = 1) => {
  var xStr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
  var yStr = {
    1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890'
  };
  var replacer = [];
  xStr.map((v, i) =>
    replacer.push({
      original: v,
      convert: yStr[style].split('')[i]
    })
  );
  var str = text.toLowerCase().split('');
  var output = [];
  str.map((v) => {
    const find = replacer.find((x) => x.original == v);
    find ? output.push(find.convert) : output.push(v);
  });
  return output.join('');
};
// SETTINGS IS BAILEYS \\
global.baileys = require('baileys') // Biarin Ae Jir
global.pairing_code = true
global.link ='https://chat.whatsapp.com/'
global.text = 'FastByte'
global.channel = 'https://whatsapp.com/channel/'
// SETTING IN OWNER NAME AND NUMBER OWNER \\
global.ownername = 'fastbyte' // Owner Name
global.owner = ['6283151623214'] // Nomor Owner
global.premium = ['6283151623214']
global.botName = 'FastByte' // Nama Bot
global.packname = 'Fast-MD' // Name Sticker
global.packname2 = 'FastByte' // Name Sticker
//=======================//
global.system = `Fastbyte-System`
global.mess = {
    ban: Styles('Kamu ga bisa mengakses semua command, karena kamu di banned!'),
    badm: Styles('Fast-MD Harus jadi admin!'),
    regis: Styles(`Kamu belum terdaftar, daftar dengan ketik .daftar`),
    premium: Styles('Khusus Premium'),
    search: Styles('Mencari...'),
    done: Styles('Selesai'),
    success: Styles('Sukses'),
    admin: Styles('Hanya untuk admin!'),
    owner: Styles('Hanya untuk owner!'),
    group: Styles('Hanya bisa di grup, kamu pm bot?'),
    private: Styles('Hanya bisa di private, pm bot?'),
    bot: Styles('Hanya bot'),
    wait: Styles('Memuat'),
    getdata: Styles('Memuat'),
    fail: Styles('*Gagal!'),
    error: Styles('Sedang Maintenance'),
    errorF: Styles('error'),
}
let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update'${__filename}'`))
	delete require.cache[file]
	require(file)
})