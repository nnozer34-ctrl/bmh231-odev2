const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

const sunucu = http.createServer((istek, yanit) => {
    console.log(istek.method, istek.url);

    yanit.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    yanit.end("Sunucu çalışıyor!");
});

sunucu.listen(PORT, () => {
    console.log("Sunucu http://localhost:" + PORT + " adresinde çalışıyor");
});