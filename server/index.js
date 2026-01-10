import app from "./src/server.js";

const PORT = process.env.PORT || 3055;

// Bind to 0.0.0.0 specifically for Render/Docker environments
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`WSV eCommerce start with ${PORT}`);
});

// Xử lý khi ấn Ctrl+C (Graceful Shutdown)
process.on("SIGINT", () => {
  server.close(() => console.log(`Exit Server Express`));
});
