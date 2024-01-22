const { readdir, stat } = require('fs/promises');

const path = require('path');
const BYTES_PER_KB = 1024;

const getFiles = async () => {
  const folder = path.resolve(__dirname, './secret-folder');
  const files = (await readdir(folder))
   .reduce(async (prev, cur) => {
    let accum = await prev;
     const info = await stat(path.resolve(folder, cur));
     if (info.isFile()) {
      const name = path.basename(cur, path.extname(cur));
      const ext = path.extname(cur).slice(1);
      const size = info.size/BYTES_PER_KB;
      const line = `${name} - ${ext} - ${size}kb`
      accum = [...accum, line];
     }
     return accum;
   }, Promise.resolve([])) 
   
  return files;
}

( async () => {
  const filesInfo = await getFiles();
  filesInfo.map( i => console.log(i));
})();


