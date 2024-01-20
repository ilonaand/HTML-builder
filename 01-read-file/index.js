const path = require('path');
const { constants, createReadStream } = require('fs');
const { access } = require('fs/promises');
const checkFileExists = async (path) => {
  try {
    await access(path, constants.R_OK | constants.W_OK);
    return true;
  } catch {
    return false;
  }
};
const read = async () => {
  const fileName = path.join(__dirname, 'text.txt');

  const check = await checkFileExists(fileName);
  if (!check) {
    throw new Error('FS operation failed: file text.txt not exists');
  }

  try {
    const readStream = createReadStream(fileName);
    readStream.pipe(process.stdout);
  
  } catch (err) {
    console.log(`FS operation failed: can't read file text.txt - ${err}`);
  }
};

(async () => {
  await read();
})();