const ngrok = require('ngrok');

// Thay thế token ngrok của bạn vào đây
const NGROK_AUTH_TOKEN = "3KjBxb1xw4765cEawJKN5DbQnjk_83uNZTASh6zibJGgbv3Fo";

server.listen(PORT, async () => {
    try {
        if (NGROK_AUTH_TOKEN.trim()) {
            await ngrok.authtoken(NGROK_AUTH_TOKEN.trim());
        }
        const publicUrl = await ngrok.connect(PORT);
        const websocketUrl = publicUrl.replace("http://", "ws://").replace("https://", "wss://");
        
        console.log("\n" + "=".repeat(60));
        console.log(`🌐 [TUNNEL] Máy chủ của bạn đã được đưa ra Internet thành công!`);
        console.log(`🔗 Đường dẫn kết nối WebSocket Client: ${websocketUrl}/ws/vietsub`);
        console.log("=".repeat(60) + "\n");
    } catch (err) {
        console.error("Không thể khởi tạo Ngrok tunnel:", err);
    }
});
