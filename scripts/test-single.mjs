import { SerialPort } from 'serialport';

const PORT = process.argv[2] || 'COM9';

const port = new SerialPort({
  path: PORT,
  baudRate: 9600,
  autoOpen: false,
});

port.on('data', (d) => {
    console.log('RX:', d.toString('hex').toUpperCase());
});

port.open((err) => {
  if (err) {
      console.error('Error opening', PORT, err);
      process.exit(1);
  }
  console.log('Abierto', PORT);
  
  // 54 50 01 F1 96
  const cmd = Buffer.from([0x54, 0x50, 0x01, 0xF1, 0x96]);
  
  let i = 0;
  const timer = setInterval(() => {
      console.log('TX:', cmd.toString('hex').toUpperCase());
      port.write(cmd, (err) => {
        if(err) console.error('Write error', err);
      });
      i++;
      if(i >= 5) {
          clearInterval(timer);
          setTimeout(() => port.close(), 500);
      }
  }, 1000);
});
