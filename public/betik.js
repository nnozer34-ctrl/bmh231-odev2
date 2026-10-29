let etkinlikler = [];

const turAdlari = {
    atolye: "Atölye",
    soylesi: "Söyleşi",
    topluluk: "Topluluk"
};

const kartlarKutusu = document.getElementById("kartlar");

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

function kartlariCiz(liste) {
    kartlarKutusu.replaceChildren();

    liste.forEach(etkinlik => {
        kartlarKutusu.append(kartOlustur(etkinlik));
    });
}

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

async function etkinlikleriYukle() {
    const durum = document.getElementById("durum");
    durum.textContent = "Yükleniyor...";

    try {
        const yanit = await fetch("/api/etkinlikler");

        if (!yanit.ok) {
            throw new Error("Sunucu hatası: " + yanit.status);
        }

        etkinlikler = await yanit.json();
        listeyiGuncelle();
    } catch (hata) {
        durum.textContent = "Etkinlikler yüklenemedi. Sunucunun çalıştığından emin olup sayfayı yenileyin.";
        console.error(hata);
    }
}

etkinlikleriYukle();

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