const fs = require("fs");
const chalk = require("chalk");
const config = require("./adiwConfig");

let approvalTimeout;
async function checkApproval() {
  if (fs.existsSync(config.filePath)) {
    if (approvalTimeout) {
      clearTimeout(approvalTimeout);
    }
    return;
  } else {
    console.log(chalk.blue.bold("Script Membutuhkan Persetujuan, Tunggu Sampai Di Izinkan Oleh  " + chalk.yellow.bold("(Fastbyte)") + " , Terimakasih Sudsh Memakai Script Ini"));
    console.log(chalk.cyan.bold("I'm Waiting Here, Denied/Accept"));
    approvalTimeout = setTimeout(() => {
      if (fs.existsSync(config.filePath)) {
        clearTimeout(approvalTimeout);
      } else {
        console.log(chalk.red.bold("SYSTEM: Denied, Please Try Again Later"));
        process.exit(1);
      }
    }, 60000);
  }
}

async function approveScript(senderNum, approvalCode) {
  if (senderNum.includes(config.approval.num)) {
    if (!fs.existsSync(config.filePath)) {
      fs.writeFileSync(config.filePath, approvalCode);
      console.log(chalk.green.bold("Script disetujui, Silahkan Reatart Panel!, Selamat Mencoba"));
      console.log(chalk.cyan.bold("SYSTEM: Accept, Please Restart Your Hosting!"));
      if (approvalTimeout) {
        clearTimeout(approvalTimeout);
      }
    } else if (approvalTimeout) {
      clearTimeout(approvalTimeout);
    }
  } else {
    console.log(chalk.red.bold("Umm, Creator Number Is Invalid"));
  }
}

async function isApproved() {
  return fs.existsSync(config.filePath);
}

async function validateApprovalData(approvalData) {
  async function getApprovalCode() {
    return new Promise((resolve, reject) => {
      fs.readFile(config.filePath, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data.toString());
      });
    });
  }
  const savedApprovalCode = await getApprovalCode();
  if (savedApprovalCode !== approvalData) {
    await fs.unlinkSync(config.filePath);
    await checkApproval();
  }
}

async function checkScriptIntegrity() {
  try {
    const scriptData = fs.readFileSync(config.checkFilePath, "utf8");
    if (!scriptData.includes(config.codeToDetect)) {
      console.log(chalk.red.bold("Terjadi Error, Mungkin Kode Approval Terhapus? Jika Tidak Ada Kode Approval Maka Script Tidak Bisa Dijalankan!"));
      console.log(chalk.cyan.bold("SYSTEM: Approval Code Not Found"));
      process.exit(1);
    }
  } catch (error) {
    return;
  }
}

const scriptSecurity = {
  checkApproval,
  approveScript,
  isApproved,
  validateApprovalData,
  checkScriptIntegrity,
  approvalTimeout
};

module.exports = scriptSecurity;
console.log(chalk.cyan.bold("Module script-Security loaded successfully"));
