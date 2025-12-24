import app from "./src/server.js";

const PORT = process.env.PORT || 3055;

const server = app.listen(PORT, () => {
  console.log(`WSV eCommerce start with ${PORT}`);
});

// Xử lý khi ấn Ctrl+C (Graceful Shutdown)
process.on("SIGINT", () => {
  server.close(() => console.log(`Exit Server Express`));
});
