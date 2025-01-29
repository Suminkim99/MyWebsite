const BluetoothSerialPort = require('bluetooth-serial-port').BluetoothSerialPort;
const btSerial = new BluetoothSerialPort();

btSerial.inquire();

btSerial.on('found', function (address, name) {
    console.log(`Found: ${name} (${address})`);
    btSerial.findSerialPortChannel(address, function (channel) {
        console.log(`Connecting to ${name} on channel ${channel}...`);
        btSerial.connect(address, channel, function () {
            console.log('Connected successfully!');
            btSerial.write(Buffer.from('Hello from Node.js!\n', 'utf-8'), function (err) {
                if (err) console.error('Error writing:', err);
                else console.log('Message sent!');
            });
        }, function () {
            console.error('Cannot connect to', name);
        });
    });
});

btSerial.on('finished', function () {
    console.log('Bluetooth scan finished.');
});

btSerial.on('failure', function (err) {
    console.error('Bluetooth error:', err);
});
