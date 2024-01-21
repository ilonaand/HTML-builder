const { createWriteStream } = require('fs');
const path = require('path');
const readline = require('readline/promises');
const os = require('os');

const write = () => {

  const fileName = path.join(__dirname, 'text.txt');
  const writable = createWriteStream(fileName, { flags: 'a+' } );

  const stdin = process.stdin;
  const stdout = process.stdout;

  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
    prompt: 'Input text> ',
  })
  
  rl.prompt();

  rl.on('line', async (line)  => {
    if (line === 'exit') { 
      rl.close();
    }
    writable.write(line + os.EOL);
  })
  
  rl.on('close', () => {
    console.log(
      'GoodBye, come again!'
      );
    process.exit(0);
  });

  process.on('SIGINT', () => {
      rl.close();
  });

  
};

write();

