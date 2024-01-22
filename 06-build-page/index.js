const {
  access,
  copyFile,
  stat,
  readdir,
  mkdir,
  rm,
  unlink,
  writeFile,
  chmod,
} = require('fs/promises');

const { constants, createReadStream, createWriteStream } = require('fs');

//const promisify = require('util');

const path = require('path');

const checkFileExists = async (path) => {
  try {
    await access(path, constants.R_OK | constants.W_OK);
    return true;
  } catch {
    return false;
  }
};

const createDir = async (dirname) => {
  const folder = path.resolve(__dirname, dirname);

  try {
    const exists = await checkFileExists(folder);
    
    if (exists) {
      await rm(folder, {recursive: true});
    }
    return await mkdir(folder, { recursive: true });

  } catch (err) {
    throw new Error(`FS operation failed: ${err}`);
  }
};

const _readDir = async (pathDir)  => {
  const folder = path.resolve(__dirname, pathDir);

  try {
    const exists = await checkFileExists(folder);
    
    if (!exists) {
      throw new Error(`FS operation failed: ${folder} files not exists`);
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

const _readFile = async (fileName) => {

  const check = await checkFileExists(fileName);
  if (!check) {
    throw new Error(`FS operation failed: file ${fileName} not exists`);
  }

  try {
    const readStream = createReadStream(fileName);

    let data = [];
    for await (const chunk of readStream) {
      data = [...data, chunk];
    }
    return data.join('').toString();
  } catch (err) {
    console.log(`FS operation failed: can't read file ${fileName} - ${err}`);
  }
};

const writeIterableToFile = async (filePath, data, options) => {
  const writable = createWriteStream(filePath, options);
  
  for await (const chunk of data) {
    if (!writable.write(chunk)) {
      await once(writable, 'drain');
    }
  }
  writable.end();
 // await promisify(writable);
};

const createIndexFile = async (dist, componentsPath) => {
  const tempFile = path.resolve(__dirname, 'template.html');
  const compDir = path.resolve(__dirname, componentsPath);
  const comFiles = await (_readDir(compDir));
 
  const tempText = await _readFile(tempFile);
  let indexContent = tempText;
  for await (htmlFile of comFiles) {
    const str = `{{${path.basename(htmlFile, '.html')}}}`;
    const content = await _readFile(path.resolve(compDir, htmlFile));
    indexContent = indexContent.replace(str, content)
  }
  await writeIterableToFile(path.resolve(dist, 'index.html'), indexContent, {
      encoding: 'utf8',
      flag: 'w',
    });
}

const megreCSS = async (dist, stylePath) => {
  const distFolder = path.resolve(__dirname, dist);
  const bundle = path.resolve(distFolder, 'style.css')
  try {
    const files = await _readDir(stylePath);
    const isExist = await checkFileExists(bundle);
    if (isExist) { 
      await unlink(bundle);
    }

    for( chunk of files ) {
      const ext = path.extname(chunk).slice(1);
     
      if ( ext.toLowerCase() === 'css') {
        const content =  await _readFile(path.resolve(__dirname, stylePath, chunk));
        await writeFile(bundle, content.toString(), { flag: 'a+'});
      }
      
    }
  } catch (err) {
    throw new Error(`FS operation failed1: ${err}`);
  }
}

const _copyDir = async (src, dest) => {
  const folder = path.resolve(__dirname, src);
  const folderCopy = path.resolve(__dirname, dest);

  try {
      const dirs = await readdir(folder);
     
      await Promise.all(
        dirs.map(async (dir) => {
          const res = path.join(folder, dir);
        
          const isDir = (await stat(res)).isDirectory();
          if (isDir)  {
            const newDir = await mkdir( path.join(folderCopy, dir), { recursive: true });
            await _copyDir(res, newDir) 
          } 
          else {
            await copyFile(res, path.resolve(folderCopy, path.basename(res)));
          } 
        }),
      );
      
    } catch (err) {
      console.log(`Robust-protocol.errorDirectory: Ошибка чтения директории - ${err}`);
      return [];
    }

}

const copyDir = async (src, dest) => {
  const folder = path.resolve(__dirname, src);
  const folderCopy = path.resolve(__dirname, dest);

  const exists = await checkFileExists(folderCopy);
  
  if (exists) {
    await rm(folderCopy, {recursive: true});
  }
  const d = await mkdir(folderCopy, { recursive: true });

  await _copyDir(folder, d);
}

const build = async () => {
  const dist = await createDir('project-dist');

  await createIndexFile(dist, 'components');
  await megreCSS (dist, 'styles');
  await copyDir(path.resolve(__dirname, 'assets'), path.resolve(__dirname, dist, 'assets'));
}

(async () => {
  await build();
})();