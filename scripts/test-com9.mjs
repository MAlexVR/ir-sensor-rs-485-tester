import { SerialPort } from 'serialport';

const PORT = process.argv[2] || 'COM8';

// Calculo del checksum: sumar bytes y quedarse con el byte bajo
function buildCommand(addr) {
  const buf = [0x54, 0x50, addr, 0xF1];
  const chk = buf.reduce((a, b) => a + b, 0) & 0xFF;
  buf.push(chk);
  return Buffer.from(buf);
}

async function scanAddress(port, addr) {
  return new Promise((resolve) => {
    const cmd = buildCommand(addr);
    
    let rxData = Buffer.alloc(0);
    const onData = (data) => {
      rxData = Buffer.concat([rxData, data]);
    };
    
    port.on('data', onData);
    port.write(cmd);

    setTimeout(() => {
      port.off('data', onData);
      resolve({ addr, rxData });
    }, 150); // El sensor dice responder en 100ms
  });
}

async function main() {
  console.log(`Abriendo ${PORT} a 9600 baudios...`);
  const port = new SerialPort({
    path: PORT,
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    autoOpen: false,
  });

  port.open(async (err) => {
    if (err) {
      console.error(`Error abriendo puerto: ${err.message}`);
      process.exit(1);
    }
    
    console.log(`Puerto abierto. Escaneando direcciones del 1 al 255...`);
    
    for (let i = 1; i <= 255; i++) {
      const { addr, rxData } = await scanAddress(port, i);
      if (rxData.length > 0) {
        console.log(`Dir 0x${addr.toString(16).padStart(2, '0')}: Recibido -> ${rxData.length} bytes -> ${rxData.toString('hex').toUpperCase()}`);
        if (rxData.length >= 7 && rxData[0] === 0x54 && rxData[1] === 0x50) {
            console.log(`!!! TRAMA VALIDA ENCONTRADA EN DIRECCION 0x${addr.toString(16).padStart(2, '0')} !!!`);
            break;
        }
      }
    }
    
    console.log('Escaneo finalizado.');
    port.close();
  });
}

main();
