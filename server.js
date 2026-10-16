const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const { translate } = require('@vitalets/google-translate-api');
const ngrok = require('ngrok');

// Cấu hình Token Ngrok của bạn (Thay token của bạn vào đây)
const NGROK_AUTH_TOKEN = "3KjBxb1xw4765cEawJKN5DbQnjk_83uNZTASh6zibJGgbv3Fo";
const PORT = 8000;

// 1. Khởi tạo Express App & HTTP Server chung
const app = express();
const server = http.createServer(app);

// Route HTTP cơ bản kiểm tra trạng thái server
app.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('AI Vietsub Realtime WebSocket Server đang hoạt động!');
});

// 2. Gắn WebSocket Server vào chung HTTP Server
const wss = new WebSocketServer({ server });

// 3. Xử lý sự kiện kết nối WebSocket
wss.on('connection', (ws, req) => {
    const urlParams = new URL(req.url, `http://${req.headers.host}`);
    
    // Kiểm tra đúng endpoint /ws/vietsub
    if (urlParams.pathname === '/ws/vietsub') {
        console.log("🔌 [SERVER] Client mới đã kết nối qua WebSocket (/ws/vietsub)!");

        // Lắng nghe dữ liệu gửi lên từ Client
        ws.on('message', async (message) => {
            try {
                const payload = JSON.parse(message.toString());

                const textToTranslate = payload.text || "";
                const srcLang = payload.source_lang || "auto";
                const tgtLang = payload.target_lang || "vi";

                console.log(`📩 [RECEIVE] Nhận yêu cầu dịch: '${textToTranslate}' (${srcLang} -> ${tgtLang})`);

                let translatedLine = textToTranslate;

                // Thực hiện dịch thuật qua Google Translate API
                if (textToTranslate.trim()) {
                    try {
                        const resTranslate = await translate(textToTranslate, { 
                            from: srcLang === "auto" ? undefined : srcLang, 
                            to: tgtLang 
                        });
                        translatedLine = resTranslate.text;
                    } catch (err) {
                        console.error("⚠️ [TRANSLATE ERROR]:", err.message);
                    }
                }

                // Đóng gói kết quả trả về
                const responseData = {
                    status: "success",
                    original: textToTranslate,
                    translated: translatedLine,
                    source_lang: srcLang,
                    target_lang: tgtLang
                };

                if (ws.readyState === ws.OPEN) {
                    ws.send(JSON.stringify(responseData));
                    console.log(`📤 [SEND] Đã gửi bản dịch: '${translatedLine}'`);
                }

            } catch (e) {
                console.error("❌ [ERROR] Lỗi xử lý thông điệp JSON:", e.message);
                if (ws.readyState === ws.OPEN) {
                    ws.send(JSON.stringify({ status: "error", message: "Định dạng JSON không hợp lệ" }));
                }
            }
        });

        ws.on('close', () => {
            console.log("🔌 [SERVER] Client đã ngắt kết nối.");
        });

        ws.on('error', (err) => {
            console.error(`❌ [ERROR] Lỗi WebSocket: ${err.message}`);
        });

    } else {
        // Từ chối kết nối nếu sai route
        ws.close();
    }
});

// 4. Khởi chạy HTTP/WebSocket Server kết hợp Ngrok Tunnel
server.listen(PORT, async () => {
    console.log(`\n🚀 [LOCAL] Máy chủ đang chạy tại http://localhost:${PORT}`);
    
    try {
        if (NGROK_AUTH_TOKEN && NGROK_AUTH_TOKEN.trim()) {
            await ngrok.authtoken(NGROK_AUTH_TOKEN.trim());
        }
        
        // Tạo đường hầm public ra Internet
        const publicUrl = await ngrok.connect(PORT);
        const websocketUrl = publicUrl.replace("http://", "ws://").replace("https://", "wss://");
        
        console.log("="*60);
        console.log(`🌐 [TUNNEL] Máy chủ của bạn đã được đưa ra Internet thành công!`);
        console.log(`🔗 Đường dẫn kết nối WebSocket Client: ${websocketUrl}/ws/vietsub`);
        console.log("="*60 + "\n");

    } catch (err) {
        console.error("⚠️ Không thể khởi tạo Ngrok Tunnel (vẫn có thể chạy nội bộ trên localhost):", err.message);
    }
});
