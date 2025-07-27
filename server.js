const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { maxHttpBufferSize: 1e8 });
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const usedColors = new Set();
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color;
  do {
    color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
  } while (usedColors.has(color));
  usedColors.add(color);
  return color;
}

io.on('connection', (socket) => {
  const color = getRandomColor();
  socket.color = color;
  socket.emit('init', { color });

  socket.on('chat message', (msg) => {
    io.emit('chat message', { text: msg, color: socket.color });
  });

  socket.on('upload', (arrayBuffer, meta) => {
    io.emit('file', {
      buffer: arrayBuffer,
      filename: meta.filename,
      type: meta.type,
      color: socket.color
    });
  });

  socket.on('disconnect', () => {
    usedColors.delete(socket.color);
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
