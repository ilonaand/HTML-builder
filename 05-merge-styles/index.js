const { 
  readdir, 
  stat,
  readFile, 
  writeFile, 
  access,
  appendFile,
  unlink } = require('fs/promises');

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

const getFiles = async () => {
  const folder = path.resolve(__dirname, './styles');
  try {
    const files = (await readdir(folder))
    .reduce(async (prev, cur) => {
      let accum = await prev;
      const info = await stat(path.resolve(folder, cur));
      const ext = path.extname(cur).slice(1);

      if (info.isFile() && ext.toLowerCase() === 'css') {
        const content = await readFile(path.resolve(folder, cur));
        accum = [...accum, content.toString()];
      }

      return accum;
    }, Promise.resolve([])) 

    return files;
  } catch (err) {
    throw new Error(`FS operation failed: ${err}`);
  }
}

( async () => {
  const distFolder = path.resolve(__dirname, './project-dist');
  const bundle = path.resolve(distFolder, 'bundle.css')
  try {
    const filesContent = await getFiles();
    const isExist = await checkFileExists(bundle);
    if (isExist) { 
      await unlink(bundle);
    }

    for( chunk of filesContent ) {
      await writeFile(bundle, chunk, { flag: 'a+'});
    }
  } catch (err) {
    throw new Error(`FS operation failed1: ${err}`);
  }
})();