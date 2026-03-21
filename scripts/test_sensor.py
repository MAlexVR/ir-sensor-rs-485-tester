import serial
import time

PORT    = "COM7"
BAUD    = 9600
ADDR    = 0x01
TIMEOUT = 2.0

def checksum(data):
    return sum(data) & 0xFF

def build_read_cmd(addr):
    payload = [0x54, 0x50, addr & 0xFF, 0xF1]
    return bytes(payload + [checksum(payload)])

def parse_response(data):
    if len(data) < 7:
        return "INCOMPLETO: {} bytes".format(len(data))
    if data[0] != 0x54 or data[1] != 0x50:
        return "HEADER INVALIDO: {}".format(data[:2].hex(' '))
    if data[3] != 0xF1:
        return "CMD INESPERADO: 0x{:02X}".format(data[3])
    expected_chk = checksum(list(data[:6]))
    if data[6] != expected_chk:
        return "CHECKSUM FAIL: recibido 0x{:02X}, calculado 0x{:02X}".format(data[6], expected_chk)
    temp = (data[4] * 256 + data[5]) / 10
    return "OK TEMPERATURA: {:.1f} C  (DH=0x{:02X} DL=0x{:02X})".format(temp, data[4], data[5])

def test(rts_mode, label):
    print("\n" + "-"*50)
    print("  Modo: " + label)
    print("-"*50)
    try:
        ser = serial.Serial(
            port=PORT, baudrate=BAUD,
            bytesize=serial.EIGHTBITS, parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            timeout=TIMEOUT,
            inter_byte_timeout=0.020,  # 20ms entre bytes — captura rafaga completa
            rtscts=False, dsrdtr=False,
        )
    except serial.SerialException as e:
        print("  ERROR abriendo {}: {}".format(PORT, e))
        return

    cmd = build_read_cmd(ADDR)
    print("  TX: " + cmd.hex(' ').upper())
    try:
        ser.reset_input_buffer()
        if rts_mode == "high":
            ser.rts = True
        elif rts_mode == "low":
            ser.rts = False

        ser.write(cmd)

        if rts_mode in ("high", "low"):
            time.sleep(0.010)
            ser.rts = not (rts_mode == "high")

        raw = ser.read(32)
        if raw:
            print("  RX: {}  ({} bytes)".format(raw.hex(' ').upper(), len(raw)))
            print("  ->  " + parse_response(raw))
        else:
            print("  RX: (sin respuesta en {}s)".format(TIMEOUT))
    finally:
        ser.close()

def loopback_test():
    print("\n" + "="*50)
    print("  LOOPBACK TEST (cortocircuita A-B en el adaptador)")
    print("="*50)
    try:
        ser = serial.Serial(PORT, BAUD, timeout=1.0)
        cmd = build_read_cmd(ADDR)
        print("  TX: " + cmd.hex(' ').upper())
        ser.write(cmd)
        time.sleep(0.020)
        raw = ser.read(32)
        if raw:
            print("  RX: {}  <- adaptador RX funciona".format(raw.hex(' ').upper()))
        else:
            print("  RX: (sin eco) <- problema en adaptador o cableado")
        ser.close()
    except serial.SerialException as e:
        print("  ERROR: " + str(e))

print("\n" + "="*50)
print("  Diagnostico sensor IR RS-485")
print("  Puerto: {}  |  {} baud 8N1  |  Addr: 0x{:02X}".format(PORT, BAUD, ADDR))
print("="*50)

loopback_test()
test("none", "Sin control RTS (auto-switching)")
test("high", "RTS alto en TX, bajo en RX")
test("low",  "RTS bajo en TX, alto en RX")

print("\n" + "="*50 + "\n")
