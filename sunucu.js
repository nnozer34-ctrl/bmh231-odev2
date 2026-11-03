// Sunucuyu harici paket kurmadan Node'un kendi http, fs ve path modülleriyle yazdım; 3000 portunda çalışıyor.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const PUBLIC_KLASORU = path.join(__dirname, "public");

// İçerik türleri, dosya uzantısına göre tarayıcıya hangi türün gönderileceğini tutar.
const icerikTurleri = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8"
};

// 404 ve 405'in cevaplarını düz metin (text/plain) türüyle gönderir.
function metinGonder(yanit, durumKodu, metin) {
    yanit.writeHead(durumKodu, { "Content-Type": "text/plain; charset=utf-8" });
    yanit.end(metin);
}

// Veriyi stringify ile metne çevirip application/json türüyle gönderir.
function jsonGonder(yanit, durumKodu, veri) {
    yanit.writeHead(durumKodu, { "Content-Type": "application/json; charset=utf-8" });
    yanit.end(JSON.stringify(veri));
}

// etkinlikler.json dosyasını readFile ile okur, okuduğu metni parse ile diziye çevirir.
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

// Güvenlik için public klasörü dışından bir dosya (mesela /sunucu.js) istenirse
// ya da dosya bulunamazsa direkt 404 veriyor.
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
    // Gelen her isteğin yöntemini ve yolunu terminale yazdırıyor.
    console.log(istek.method, istek.url);

    // Sayfa sadece veri okumaya yaradığı için GET dışındaki isteklere
    // Allow: GET başlığıyla birlikte 405 hatası döndürüyor.
    if (istek.method !== "GET") {
        yanit.writeHead(405, { "Content-Type": "text/plain; charset=utf-8", "Allow": "GET" });
        yanit.end("Bu yönteme izin verilmiyor");
        return;
    }

    const adres = new URL(istek.url, "http://localhost:" + PORT);
    // URL yolunun /api/etkinlikler/<sayı> biçimine uyup uymadığını düzenli ifadeyle kontrol eder;
    // /api/etkinlikler/abc gelirse eşleşme olmaz ve null döner.
    const idEslesmesi = adres.pathname.match(/^\/api\/etkinlikler\/(\d+)$/);

    if (adres.pathname === "/api/etkinlikler" || idEslesmesi) {
        etkinlikleriOku((hata, etkinlikler) => {
            if (hata) {
                jsonGonder(yanit, 500, { hata: "Veriler okunamadı" });
                return;
            }

            if (idEslesmesi) {
                // Yakalanan değer metin ("3") olduğu için sayıya (3) dönüştürür;
                // === tür kontrolü de yaptığı için "3" === 3 false çıkmasın diye.
                const id = Number(idEslesmesi[1]);
                // id değeri aradığımız sayıya eşit olan ilk etkinliği bulur; yoksa undefined döner.
                const etkinlik = etkinlikler.find(e => e.id === id);
                // Etkinlik bulunamadıysa 404 ve "Etkinlik bulunamadı" mesajını JSON olarak gönderir.
                if (!etkinlik) {
                    jsonGonder(yanit, 404, { hata: "Etkinlik bulunamadı" });
                    return;
                }
                jsonGonder(yanit, 200, etkinlik);
                return;
            }

            // Adresteki ?tur=atolye gibi sorguları URL sınıfındaki searchParams ile çekiyorum.
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