
var crypto = require("crypto");
var stream_1 = require("stream");
var algorithm = 'aes-256-cbc';
var password;
function checkPassword() {
    if (!password) {
        throw new Error('You should set password first.');
    }
}
function generatePassword() {
    return crypto.randomBytes(32);
}
exports.generatePassword = generatePassword;

function setPassword(p) {
    if (!Buffer.isBuffer(p) || p.length !== 32) {
        throw new Error('password should be 32 length buffer');
    }
    password = p;
}
exports.setPassword = setPassword;
function createEncryptStream(input) {
    checkPassword();
    var passwordLocal = password;
    var iv = crypto.randomBytes(16);
    var encryptStream = crypto.createCipheriv(algorithm, passwordLocal, iv);
    var inited = false;
    return input.pipe(encryptStream).pipe(new stream_1.Transform({
        transform: function (chunk, encoding, callback) {
            if (!inited) {
                inited = true;
                this.push(Buffer.concat([iv, chunk]));
            }
            else {
                this.push(chunk);
            }
            callback();
        }
    }));
}
exports.createEncryptStream = createEncryptStream;
function createDecryptStream(output) {
    checkPassword();
    var passwordLocal = password;
    var iv;
    return new stream_1.Transform({
        transform: function (chunk, encoding, callback) {
            if (!iv) {
                iv = chunk.slice(0, 16);
                var decryptStream = crypto.createDecipheriv(algorithm, passwordLocal, iv);
                this.pipe(decryptStream).pipe(output);
                this.push(chunk.slice(16));
            }
            else {
                this.push(chunk);
            }
            callback();
        }
    });
}
exports.createDecryptStream = createDecryptStream;
