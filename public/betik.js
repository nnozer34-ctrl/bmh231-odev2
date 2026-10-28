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
let seciliTur = "tumu";
let aramaMetni = "";

function listeyiGuncelle() {
    const sonuc = etkinlikler.filter(e => {
        const turUygun = seciliTur === "tumu" || e.tur === seciliTur;
        const aramaUygun = e.baslik.toLocaleLowerCase("tr-TR").includes(aramaMetni);
        return turUygun && aramaUygun;
    });

    kartlariCiz(sonuc);
    const durum = document.getElementById("durum");
    if (sonuc.length === 0) {
        durum.textContent = "Aramanıza uygun etkinlik yok.";
    } else {
        durum.textContent = "";
    }
}

const filtreDugmeleri = document.querySelectorAll(".filtre");

filtreDugmeleri.forEach(dugme => {
    dugme.addEventListener("click", () => {
        filtreDugmeleri.forEach(d => d.classList.remove("secili"));
        dugme.classList.add("secili");

        seciliTur = dugme.dataset.tur;
        listeyiGuncelle();
    });
});

const aramaKutusu = document.getElementById("arama");

aramaKutusu.addEventListener("input", () => {
    aramaMetni = aramaKutusu.value.trim().toLocaleLowerCase("tr-TR");
    listeyiGuncelle();
});

// ===== C1: Tek bir etkinlikten kart oluşturur =====
function kartOlustur(etkinlik) {
    const kart = document.createElement("article");
    kart.className = "kart";

    const etiket = document.createElement("span");
    etiket.className = "etiket";
    etiket.textContent = turAdlari[etkinlik.tur];

    const baslik = document.createElement("h2");
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

const form = document.getElementById("oneri-formu");
const formIleti = document.getElementById("form-ileti");

form.addEventListener("submit", (olay) => {
    olay.preventDefault();
    const ad = form.ad.value.trim();
    const tarih = form.tarih.value;
    const eposta = form.eposta.value.trim();
    const hatalar = [];

    if (ad.length < 5) {
        hatalar.push("Etkinlik adı en az 5 karakter olmalıdır.");
    }
    if (tarih === "") {
        hatalar.push("Lütfen bir tarih seçin.");
    } else {
        const secilenGun = new Date(tarih + "T00:00");
        const bugun = new Date();
        bugun.setHours(0, 0, 0, 0);

        if (secilenGun < bugun) {
            hatalar.push("Tarih geçmiş bir gün olamaz.");
        }

    }
    const epostaKalibi = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!epostaKalibi.test(eposta)) {
        hatalar.push("Lütfen geçerli bir e-posta adresi girin.");
    }
    if (hatalar.length > 0) {
        formIleti.className = "hata";
        formIleti.textContent = hatalar.join("\n");
    } else {
        formIleti.className = "basarili";
        formIleti.textContent = "Teşekkürler! Etkinlik öneriniz alındı.";
        form.reset();
    }
});