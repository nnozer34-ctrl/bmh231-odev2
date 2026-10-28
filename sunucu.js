const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const PUBLIC_KLASORU = path.join(__dirname, "public");

const icerikTurleri = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8"
};

function metinGonder(yanit, durumKodu, metin) {
    yanit.writeHead(durumKodu, { "Content-Type": "text/plain; charset=utf-8" });
    yanit.end(metin);
}
function jsonGonder(yanit, durumKodu, veri) {
    yanit.writeHead(durumKodu, { "Content-Type": "application/json; charset=utf-8" });
    yanit.end(JSON.stringify(veri));
}

function etkinlikleriOku(geriCagirma) {
    const dosya = path.join(__dirname, "etkinlikler.json");
    fs.readFile(dosya, "utf-8", (hata, metin) => {
        if (hata) {
            geriCagirma(hata, null);
            return;
        }
        geriCagirma(null, JSON.parse(metin));
    });
}

function dosyaGonder(yanit, yol) {
    const istenen = yol === "/" ? "index.html" : yol;
    const dosyaYolu = path.join(PUBLIC_KLASORU, istenen);

    if (!dosyaYolu.startsWith(PUBLIC_KLASORU + path.sep)) {
        metinGonder(yanit, 404, "Sayfa bulunamadı");
        return;
    }

    fs.readFile(dosyaYolu, (hata, icerik) => {
        if (hata) {
            metinGonder(yanit, 404, "Sayfa bulunamadı");
            return;
        }
        const uzanti = path.extname(dosyaYolu);
        const tur = icerikTurleri[uzanti] || "application/octet-stream";
        yanit.writeHead(200, { "Content-Type": tur });
        yanit.end(icerik);
    });
}

const sunucu = http.createServer((istek, yanit) => {
    console.log(istek.method, istek.url);

    if (istek.method !== "GET") {
        yanit.writeHead(405, { "Content-Type": "text/plain; charset=utf-8", "Allow": "GET" });
        yanit.end("Bu yönteme izin verilmiyor");
        return;
    }

    const adres = new URL(istek.url, "http://localhost:" + PORT);
    const idEslesmesi = adres.pathname.match(/^\/api\/etkinlikler\/(\d+)$/);

    if (adres.pathname === "/api/etkinlikler" || idEslesmesi) {
        etkinlikleriOku((hata, etkinlikler) => {
            if (hata) {
                jsonGonder(yanit, 500, { hata: "Veriler okunamadı" });
                return;
            }

            if (idEslesmesi) {
                const id = Number(idEslesmesi[1]);
                const etkinlik = etkinlikler.find(e => e.id === id);
                if (!etkinlik) {
                    jsonGonder(yanit, 404, { hata: "Etkinlik bulunamadı" });
                    return;
                }
                jsonGonder(yanit, 200, etkinlik);
                return;
            }

            const tur = adres.searchParams.get("tur");
            const sonuc = tur ? etkinlikler.filter(e => e.tur === tur) : etkinlikler;
            jsonGonder(yanit, 200, sonuc);
        });
        return;
    }

    dosyaGonder(yanit, adres.pathname);
});

sunucu.listen(PORT, () => {
    console.log("Sunucu http://localhost:" + PORT + " adresinde çalışıyor");
});