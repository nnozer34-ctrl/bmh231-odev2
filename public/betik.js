// ===== Etkinlik verisi (D2'de API'den gelecek) =====
const etkinlikler = [
    { id: 1, baslik: "BozokChain Bootcamp", tur: "atolye", tarih: "2027-04-23", yer: "Mühendislik Mimarlık Fakültesi Bilgisayar Laboratuvarı", kontenjan: 60 },
    { id: 2, baslik: "Git ve GitHub ile Sürüm Kontrolü Atölyesi", tur: "atolye", tarih: "2026-11-12", yer: "MMF Bilgisayar Laboratuvarı 2", kontenjan: 25 },
    { id: 3, baslik: "Yapay Zekâ ve Veri Bilimi Kariyer Söyleşisi", tur: "soylesi", tarih: "2026-11-19", yer: "MMF Konferans Salonu", kontenjan: 150 },
    { id: 4, baslik: "Web Güvenliği ve XSS Söyleşisi", tur: "soylesi", tarih: "2026-12-03", yer: "Merkez Kütüphane Etkinlik Salonu", kontenjan: 80 },
    { id: 5, baslik: "Bilgisayar Mühendisliği Tanışma Toplantısı", tur: "topluluk", tarih: "2026-11-06", yer: "MMF Fuaye Alanı", kontenjan: 120 },
    { id: 6, baslik: "Fotoğrafçılık Kulübü Kampüs Yürüyüşü", tur: "topluluk", tarih: "2026-11-28", yer: "Kampüs Ana Giriş", kontenjan: 40 }
];

// Verideki tür kodlarını ekranda görünecek adlara çevirir
const turAdlari = {
    atolye: "Atölye",
    soylesi: "Söyleşi",
    topluluk: "Topluluk"
};

// Sayfadaki kartlar kutusu
const kartlarKutusu = document.getElementById("kartlar");

// ===== C1: Tek bir etkinlikten kart oluşturur =====
function kartOlustur(etkinlik) {
    const kart = document.createElement("article");
    kart.className = "kart";

    const etiket = document.createElement("span");
    etiket.className = "etiket";
    etiket.textContent = turAdlari[etkinlik.tur];

    const baslik = document.createElement("h3");
    baslik.textContent = etkinlik.baslik;

    const tarih = document.createElement("p");
    tarih.textContent = "Tarih: " + new Date(etkinlik.tarih).toLocaleDateString("tr-TR");

    const yer = document.createElement("p");
    yer.textContent = "Yer: " + etkinlik.yer;

    const kontenjan = document.createElement("p");
    kontenjan.textContent = "Kontenjan: " + etkinlik.kontenjan + " kişi";

    kart.append(etiket, baslik, tarih, yer, kontenjan);
    return kart;
}

// ===== C1: Verilen listedeki tüm etkinlikleri sayfaya çizer =====
function kartlariCiz(liste) {
    kartlarKutusu.replaceChildren();

    liste.forEach(etkinlik => {
        kartlarKutusu.append(kartOlustur(etkinlik));
    });
}

kartlariCiz(etkinlikler);