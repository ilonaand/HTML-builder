const { createWriteStream } = require('fs');
const path = require('path');
const os = require('os');

const write = () => {

  const fileName = path.join(__dirname, 'text.txt');
  const writable = createWriteStream(fileName, { flags: 'w' } );
  const readable = process.stdin;

  process.stdout.write('Input text please:' + os.EOL);
  process.stdin.resume();

  process.on('SIGINT', () => {
      console.log(
          'GoodBye, come again!'
      );
      process.exit(0);
  });

  readable.pipe(writable, { end: true });
};

write();

