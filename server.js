const { WebSocketServer } = require('ws');
const http = require('http');

// 1. Tạo HTTP Server cơ bản
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('WebSocket Server đang hoạt động!');
});

// 2. Khởi tạo WebSocket Server gắn với HTTP Server
const wss = new WebSocketServer({ server });

// 3. Xử lý sự kiện khi Client kết nối
wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`[+] Client mới kết nối từ IP: ${clientIp}`);

    // Gửi tin nhắn chào mừng cho client vừa kết nối
    ws.send(JSON.stringify({ type: 'WELCOME', message: 'Chào mừng bạn đã kết nối WebSocket Server!' }));

    // Lắng nghe tin nhắn từ Client gửi lên
    ws.on('message', (message) => {
        console.log(`[Recv]: ${message}`);

        // Broadcast (phát tin nhắn) tới TẤT CẢ các Client đang kết nối
        wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
                client.send(message.toString());
            }
        });
    });

    // Lắng nghe khi Client ngắt kết nối
    ws.on('close', () => {
        console.log('[-] Client đã ngắt kết nối');
    });

    // Lắng nghe lỗi
    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
});

// 4. Lắng nghe ở Cổng 8080
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`🚀 WebSocket Server đang chạy tại http://localhost:${PORT}`);
    console.log(`📡 WebSocket URL: ws://localhost:${PORT}`);
});
