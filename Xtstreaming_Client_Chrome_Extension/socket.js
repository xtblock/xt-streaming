var socket = io.connect('http://13.127.204.104');
socket.on('connect', function() {
console.log('Client connected');
})
