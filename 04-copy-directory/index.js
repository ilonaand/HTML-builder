const {
  access,
  copyFile,
  stat,
  readdir,
  mkdir,
  rm
} = require('fs/promises');

const { constants } = require('fs');

const path = require('path');

const checkFileExists = async (path) => {
  try {
    await access(path, constants.R_OK | constants.W_OK);
    return true;
  } catch {
    return false;
  }
};

const copyFiles = async () => {
  const folder = path.resolve(__dirname, './files');

  try {
    const exists = await checkFileExists(folder);
    
    if (!exists) {
      throw new Error('FS operation failed: folder files not exists');
    }

    const files = (await readdir(folder))
      .reduce(async (prev, cur) => {
        let accum = await prev;
        const info = await stat(path.resolve(folder, cur));
  
        if (info.isFile()) {
          accum = [...accum, cur];
        }
        return accum;
      }, Promise.resolve([]));
    return files;

  } catch (err) {
    throw new Error(`FS operation failed: ${err}`);
  }
}

( async () => {
  const files = await copyFiles();
  const folder = path.resolve(__dirname, './files');
  const folderCopy = path.resolve(__dirname, './files-copy');

  const exists = await checkFileExists(folderCopy);
  
  if (exists) {
    await rm(folderCopy, {recursive: true});
  }
  await mkdir(folderCopy, { recursive: true });

  for( chunk of files ) {
    const src =  path.resolve(folder, chunk);
    const dest =  path.resolve(folderCopy, chunk);
    await copyFile(src, dest);
  }

})();
