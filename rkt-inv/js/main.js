/* ─────────────────────────────────────────────────
   main.js — Wedding Invitation Logic
   Tema: RAKOTE COFFEE Re-Opening
   ───────────────────────────────────────────────── */

// ═════════════════════════════════════════════════
// 1. GUEST NAME FROM URL (Nama Tamu dari Link)
// ═════════════════════════════════════════════════
// IIFE (Immediately Invoked Function Expression)
// Fungsi langsung jalan saat file JS dimuat, tanpa perlu dipanggil manual
(function readGuestFromURL() {
  // URLSearchParams: API bawaan browser untuk baca parameter URL
  // Contoh URL: https://rakote.com/?to=Budi → params.get('to') = "Budi"
  const params = new URLSearchParams(window.location.search);
  // window.location.search = bagian URL setelah "?" (?to=Budi&nama=Siti)
  
  // Ambil nilai parameter 'to' ATAU 'nama' (support 2 format)
  // Operator || = "jika kiri kosong/null, pakai yang kanan"
  const name = params.get('to') || params.get('nama');
  
  // Jika nama ditemukan (tidak null/undefined)
  if (name) {
    // Cari elemen HTML dengan id="guest-name"
    const el = document.getElementById('guest-name');
    
    // Jika elemen ditemukan (tidak null)
    if (el) {
      // decodeURIComponent: mengubah %20 jadi spasi, %C3%A9 jadi é, dll
      // Penting agar nama dengan spasi/karakter khusus tampil benar
      el.textContent = decodeURIComponent(name);
      // textContent = mengganti teks dalam elemen (lebih aman dari XSS daripada innerHTML)
    }
  }
  // Fungsi langsung selesai eksekusi di sini
})();
// Akhir IIFE - tanda () di akhir = "jalankan fungsi ini sekarang"


// ═════════════════════════════════════════════════
// 2. PETAL ANIMATION (Animasi Kelopak Bunga)
// ═════════════════════════════════════════════════
// IIFE: Buat kelopak bunga jatuh secara dinamis
(function createPetals() {
  // Cari container untuk menampung kelopak
  const container = document.getElementById('petals');
  
  // Guard clause: jika container tidak ada, berhenti (mencegah error)
  if (!container) return;
  
  // Loop 20 kali = buat 20 kelopak
  for (let i = 0; i < 20; i++) {
    // document.createElement: buat elemen HTML baru via JavaScript
    const p = document.createElement('div');
    
    // Tambahkan class "petal" untuk styling CSS
    p.className = 'petal';
    
    // style.cssText = set multiple CSS properties sekaligus dalam satu string
    p.style.cssText = `
      /* Posisi horizontal acak: 0% - 100% dari lebar layar */
      left: ${Math.random() * 100}%;
      
      /* Ukuran kelopak acak: lebar 6-14px, tinggi 8-18px */
      width: ${6 + Math.random() * 8}px;
      height: ${8 + Math.random() * 10}px;
      
      /* Durasi animasi jatuh acak: 5-13 detik */
      animation-duration: ${5 + Math.random() * 8}s;
      
      /* Delay mulai animasi acak: 0-6 detik (agar tidak jatuh bersamaan) */
      animation-delay: ${Math.random() * 6}s;
      
      /* Opacity acak: 0.3 - 0.8 (transparansi berbeda-beda) */
      opacity: ${0.3 + Math.random() * 0.5};
      
      /* Bentuk kelopak acak: 2 variasi border-radius */
      /* Math.random() > 0.5 = 50% chance pilih bentuk A atau B */
      border-radius: ${Math.random() > 0.5 ? '0 100% 0 100%' : '100% 0 100% 0'};
    `;
    // Template literal (`...`) = string multi-line dengan ${variable} untuk interpolasi
    
    // Masukkan elemen kelopak ke dalam container
    container.appendChild(p);
    // appendChild = tambah elemen sebagai child terakhir dari parent
  }
})();


// ═════════════════════════════════════════════════
// 3. OPEN INVITATION (Tombol Buka Undangan)
// ═════════════════════════════════════════════════
// Optional chaining (?.) = aman jika elemen tidak ada (tidak error)
document.getElementById('openBtn')?.addEventListener('click', function () {
  // Cari elemen cover dan main content
  const cover = document.getElementById('cover');
  const main  = document.getElementById('mainContent');

  // ── ANIMASI TUTUP COVER ──
  // Set transition CSS via JS untuk animasi halus
  cover.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  // opacity 0.8s ease = memudar selama 0.8 detik dengan easing halus
  // transform 0.8s ease = scale animasi dengan durasi sama
  
  // Ubah opacity jadi 0 (transparan) → efek fade out
  cover.style.opacity = '0';
  // Scale 0.96 = mengecil sedikit → efek zoom out halus
  cover.style.transform = 'scale(0.96)';

  // ── TUNDA EKSEKUSI DENGAN setTimeout ──
  // setTimeout(func, delay) = jalankan func setelah delay milidetik
  setTimeout(() => {
    // Setelah 800ms (0.8 detik), sembunyikan cover sepenuhnya
    cover.style.display = 'none';  // Hapus dari layout (tidak bisa diklik)
    
    // Tampilkan main content
    main.classList.remove('hidden');  // Hapus class "hidden" (display:none)
    main.classList.add('visible');    // Tambah class "visible" untuk animasi masuk
    
    // ── INISIALISASI FITUR SETELAH COVER TERBUKA ──
    
    // Coba mainkan musik background
    // bgMusic.play() return Promise, .catch() handle jika autoplay diblokir browser
    bgMusic.play().catch(() => {});  // Error diabaikan agar tidak muncul di console
    
    // Mulai hitung mundur countdown
    startCountdown();
    
    // Aktifkan animasi scroll (fade-up saat elemen masuk viewport)
    initObserver();
    
    // Aktifkan fitur gallery lightbox (klik foto → popup full size)
    initGallery();
    
    // Tampilkan daftar RSVP yang tersimpan di localStorage
    renderStoredRSVP();
    
  }, 800);  // Delay 800ms = sinkron dengan durasi animasi CSS transition
});


// ═════════════════════════════════════════════════
// 4. COUNTDOWN TIMER (Hitung Mundur Acara)
// ═════════════════════════════════════════════════
// Konstanta: Tanggal acara dalam format ISO 8601
// Format: 'YYYY-MM-DDTHH:mm:ss' (T = pemisah tanggal & waktu)
const WEDDING_DATE = new Date('2025-06-14T08:00:00');
// new Date() = objek JavaScript untuk manipulasi tanggal/waktu

// Fungsi utama countdown
function startCountdown() {
  // ── FUNGSI INNER: tick() ──
  // Fungsi dalam fungsi = closure, bisa akses variabel luar (WEDDING_DATE)
  function tick() {
    // Hitung selisih waktu: tanggal acara - waktu sekarang (dalam milidetik)
    const diff = WEDDING_DATE - new Date();
    
    // ── CEK: Jika waktu sudah lewat ──
    if (diff <= 0) {
      // Ganti seluruh konten countdown dengan pesan "Hari Bahagia"
      document.getElementById('countdown').innerHTML = 
        '<p style="color:var(--gold);font-family:var(--ff-serif);font-size:1.5rem;font-style:italic">Hari Bahagia Telah Tiba! 🎉</p>';
      // innerHTML = inject HTML string (hati-hati dengan XSS, tapi di sini aman karena string hardcoded)
      return;  // Berhenti, tidak lanjut hitung
    }
    
    // ── KONVERSI MILIDETIK KE HARI/JAM/MENIT/DETIK ──
    
    // 1 hari = 24 jam × 60 menit × 60 detik × 1000 ms = 86.400.000 ms
    const days  = Math.floor(diff / 86400000);
    // Math.floor = bulatkan ke bawah (1.9 hari → 1 hari)
    
    // Sisa setelah bagi hari, lalu konversi ke jam
    // % = modulus (sisa bagi), 3.600.000 ms = 1 jam
    const hours = Math.floor((diff % 86400000) / 3600000);
    
    // Sisa setelah bagi jam, konversi ke menit (60.000 ms = 1 menit)
    const mins  = Math.floor((diff % 3600000) / 60000);
    
    // Sisa setelah bagi menit, konversi ke detik (1000 ms = 1 detik)
    const secs  = Math.floor((diff % 60000) / 1000);

    // ── UPDATE TAMPILAN DI HTML ──
    // padStart(2, '0') = tambahkan "0" di depan jika angka < 10
    // Contoh: 5 → "05", 12 → "12" (agar selalu 2 digit)
    document.getElementById('cd-days').textContent  = String(days).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-mins').textContent  = String(mins).padStart(2, '0');
    document.getElementById('cd-secs').textContent  = String(secs).padStart(2, '0');
  }
  
  // ── JALANKAN PERTAMA KALI ──
  // Agar tidak ada delay 1 detik saat pertama load
  tick();
  
  // ── UPDATE SETIAP 1 DETIK ──
  // setInterval(func, interval) = jalankan func berulang tiap interval ms
  setInterval(tick, 1000);  // 1000 ms = 1 detik
}


// ═════════════════════════════════════════════════
// 5. ADD TO CALENDAR (Tambah ke Google Calendar)
// ═════════════════════════════════════════════════
document.getElementById('calendarBtn')?.addEventListener('click', function () {
  // encodeURIComponent = encode teks agar aman untuk URL
  // Spasi jadi %20, & jadi %26, dll
  const title = encodeURIComponent('Pernikahan Arjuna & Sinta');
  
  // Format tanggal Google Calendar: YYYYMMDDTHHMMSS
  // 2025-06-14 08:00 → 20250614T080000
  const start = '20250614T080000';
  const end   = '20250614T140000';  // Acara selesai 14:00
  
  // Lokasi acara (diencode agar spesial karakter aman)
  const loc   = encodeURIComponent('Jakarta, Indonesia');
  
  // ── BURL URL GOOGLE CALENDAR ──
  // Template literal untuk gabungkan parameter query
  // action=TEMPLATE = buat event baru
  // text = judul event, dates = waktu, location = tempat
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${loc}`;
  
  // Buka URL di tab/window baru
  // '_blank' = target window baru (seperti target="_blank" di HTML)
  window.open(url, '_blank');
});


// ═════════════════════════════════════════════════
// 6. SCROLL ANIMATION OBSERVER (Animasi Saat Scroll)
// ═════════════════════════════════════════════════
function initObserver() {
  // Pilih semua elemen dengan class animasi
  // querySelectorAll = seperti CSS selector, return NodeList (array-like)
  const els = document.querySelectorAll('.fade-up, .fade-left, .fade-right');
  
  // ── INTERSECTION OBSERVER API ──
  // Fitur modern browser untuk deteksi elemen masuk/keluar viewport
  const obs = new IntersectionObserver((entries) => {
    // entries = array objek info elemen yang berubah visibilitasnya
    entries.forEach((e, i) => {
      // e.isIntersecting = true jika elemen terlihat di layar (minimal threshold)
      if (e.isIntersecting) {
        // ── STAGGERED ANIMATION (Efek berurutan) ──
        // setTimeout dengan delay berdasarkan index (i * 80ms)
        // Elemen ke-0: 0ms, ke-1: 80ms, ke-2: 160ms, dst → efek cascade
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        
        // Unobserve = berhenti memantau elemen ini (hemat resource, cukup animasi 1x)
        obs.unobserve(e.target);
      }
    });
  }, { 
    threshold: 0.15  // Trigger saat 15% elemen terlihat di viewport
    // threshold 0 = trigger saat sedikit saja terlihat
    // threshold 1 = trigger saat 100% elemen terlihat
  });
  
  // ── MULAI OBSERVE SETIAP ELEMEN ──
  // Loop tiap elemen, mulai pantau dengan observer
  els.forEach(el => obs.observe(el));
  // observe(el) = mulai pantau elemen tersebut
}


// ═════════════════════════════════════════════════
// 7. GALLERY LIGHTBOX (Popup Foto Full Size)
// ═════════════════════════════════════════════════
function initGallery() {
  // Pilih semua item galeri
  const items    = document.querySelectorAll('.gallery-item');
  // Pilih elemen lightbox (popup) dan img di dalamnya
  const lightbox = document.getElementById('lightbox');
  const img      = document.getElementById('lightboxImg');

  // ── EVENT LISTENER: KLIK FOTO THUMBNAIL ──
  items.forEach(item => {
    item.addEventListener('click', () => {
      // ── AMBIL URL GAMBAR FULL SIZE ──
      // Prioritas: ambil dari data-src attribute
      // Fallback: parse dari style.backgroundImage (jika data-src tidak ada)
      const src = item.dataset.src || item.style.backgroundImage.replace(/url\(["']?|["']?\)/g, '');
      // dataset.src = akses data-* attribute (HTML5 custom data)
      // replace dengan regex = hapus 'url("' dan '")' dari string background-image
      
      // Set src gambar lightbox ke URL full size
      img.src = src;
      
      // Tampilkan lightbox dengan tambah class "active"
      lightbox.classList.add('active');
      
      // Cegah scroll body saat lightbox terbuka (pengalaman user lebih baik)
      document.body.style.overflow = 'hidden';  // Disable scroll
    });
  });

  // ── EVENT LISTENER: TOMBOL CLOSE (X) ──
  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  
  // ── EVENT LISTENER: KLIK OUTSIDE GAMBAR (Background) ──
  lightbox?.addEventListener('click', function (e) {
    // e.target = elemen yang diklik
    // Jika yang diklik adalah lightbox itu sendiri (bukan img di dalamnya)
    if (e.target === lightbox) closeLightbox();
  });

  // ── EVENT LISTENER: TOMBOL ESCAPE KEYBOARD ──
  document.addEventListener('keydown', e => {
    // e.key = nama tombol yang ditekan
    if (e.key === 'Escape') closeLightbox();  // Tutup saat tekan Esc
  });

  // ── FUNGSI CLOSE LIGHTBOX ──
  function closeLightbox() {
    // Sembunyikan lightbox
    lightbox.classList.remove('active');
    // Aktifkan kembali scroll body
    document.body.style.overflow = '';  // Kosong = kembali ke default CSS
  }
}


// ═════════════════════════════════════════════════
// 8. RSVP FORM (Form Konfirmasi Kehadiran)
// ═════════════════════════════════════════════════
// Konstanta: Key untuk localStorage (penyimpanan browser)
const STORAGE_KEY = 'wedding_rsvp_v1';
// localStorage = database sederhana di browser, data tetap ada meski refresh

// ── FUNGSI: RENDER DAFTAR RSVP DARI STORAGE ──
function renderStoredRSVP() {
  // Ambil data dari localStorage, parse dari JSON string ke array
  // || '[]' = jika null/undefined, pakai array kosong (mencegah error JSON.parse)
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  // Cari container untuk menampilkan daftar pesan
  const container = document.getElementById('rsvpMessages');
  if (!container) return;  // Guard clause
  
  // Kosongkan container (reset sebelum render ulang)
  container.innerHTML = '';
  
  // ── RENDER SETIAP ITEM ──
  // slice() = copy array (agar tidak mutasi data asli)
  // reverse() = balik urutan (yang terbaru di atas)
  stored.slice().reverse().forEach(item => appendMessage(item));
  // forEach = loop array, panggil appendMessage untuk tiap item
}

// ── FUNGSI: TAMBAH 1 PESAN KE DAFTAR ──
function appendMessage(item) {
  const container = document.getElementById('rsvpMessages');
  if (!container) return;
  
  // Buat elemen div baru untuk pesan ini
  const div = document.createElement('div');
  div.className = 'rsvp-message-item';  // Class untuk styling
  
  // ── TEMPLATE LITERAL DENGAN CONDITIONAL ──
  div.innerHTML = `
    <div class="rsvp-msg-name">${escapeHtml(item.name)}</div>
    <!-- escapeHtml = cegah XSS, ubah < > & " jadi entity HTML -->
    
    <div class="rsvp-msg-attend">
      ${item.attend === 'hadir' ? '✅ Insya Allah Hadir' : '❌ Berhalangan Hadir'} 
      · ${item.guests} orang
    </div>
    <!-- Ternary operator: kondisi ? nilaiJikaTrue : nilaiJikaFalse -->
    
    ${item.message ? `<div class="rsvp-msg-text">"${escapeHtml(item.message)}"</div>` : ''}
    <!-- Render div pesan HANYA jika item.message tidak kosong -->
  `;
  
  // prepend = tambah di awal container (urutan terbalik: terbaru di atas)
  container.prepend(div);
}

// ── EVENT LISTENER: SUBMIT FORM RSVP ──
document.getElementById('rsvpSubmit')?.addEventListener('click', function () {
  // ── AMBIL NILAI DARI INPUT FORM ──
  // .value = ambil nilai input
  // .trim() = hapus spasi di awal/akhir (mencegah input "   Budi   ")
  const name    = document.getElementById('rsvpName').value.trim();
  const phone   = document.getElementById('rsvpPhone').value.trim();
  const message = document.getElementById('rsvpMessage').value.trim();
  
  // Radio button: querySelector dengan :checked = ambil yang terpilih
  const attend  = document.querySelector('input[name="attend"]:checked')?.value;
  // ?.value = aman jika tidak ada yang terpilih (return undefined, bukan error)
  
  const guests  = document.getElementById('rsvpGuests').value;

  // ── VALIDASI: CEK DATA WAJIB ──
  if (!name || !phone || !attend) {
    // Jika ada yang kosong, tampilkan toast warning
    showToast('⚠️ Mohon lengkapi data yang wajib diisi.');
    return;  // Hentikan eksekusi, jangan submit
  }

  // ── BUAT OBJEK DATA ──
  const data = { 
    name,           // ES6 shorthand: name: name → cukup name
    phone, 
    message, 
    attend, 
    guests, 
    time: new Date().toISOString()  // Timestamp ISO: "2024-01-15T10:30:00.000Z"
  };
  
  // ── SIMPAN KE localStorage ──
  // Ambil data lama, parse JSON, atau array kosong jika belum ada
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  stored.push(data);  // Tambah data baru ke array
  // JSON.stringify = konversi array/object jadi string untuk disimpan
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

  // ── UPDATE TAMPILAN ──
  // Tambahkan pesan baru ke daftar (tanpa refresh halaman)
  appendMessage(data);
  
  // Tampilkan toast sukses
  showToast('🎉 Terima kasih! Konfirmasi berhasil dikirim.');

  // ── RESET FORM ──
  // Kosongkan semua input field
  document.getElementById('rsvpName').value = '';
  document.getElementById('rsvpPhone').value = '';
  document.getElementById('rsvpMessage').value = '';
  
  // Uncheck radio button (cara aman: loop semua radio dengan name sama)
  document.querySelectorAll('input[name="attend"]').forEach(r => r.checked = false);
  
  // Reset select jumlah tamu ke default "1"
  document.getElementById('rsvpGuests').value = '1';
});


// ═════════════════════════════════════════════════
// 9. COPY TO CLIPBOARD (Salin Nomor Rekening)
// ═════════════════════════════════════════════════
// Fungsi global (window.copyText) agar bisa dipanggil dari HTML onclick
window.copyText = function (text, btn) {
  // Clipboard API modern: navigator.clipboard.writeText()
  // Return Promise → gunakan .then() untuk handle sukses
  navigator.clipboard.writeText(text).then(() => {
    // ── FEEDBACK VISUAL KE USER ──
    // Ubah teks tombol jadi "✓ Tersalin!"
    btn.textContent = '✓ Tersalin!';
    // Tambah class "copied" untuk styling khusus (misal: background hijau)
    btn.classList.add('copied');
    
    // Tampilkan toast notifikasi
    showToast('📋 Nomor rekening tersalin!');
    
    // ── KEMBALIKAN TOMBOL KE STATE SEMULA ──
    // setTimeout untuk tunda 2 detik sebelum reset
    setTimeout(() => {
      btn.textContent = 'Salin Nomor';
      btn.classList.remove('copied');
    }, 2000);  // 2000 ms = 2 detik
  });
  // Catatan: Tidak ada .catch() → error clipboard diabaikan (jarang terjadi)
};


// ═════════════════════════════════════════════════
// 10. MUSIC CONTROL (Play/Pause Background Music)
// ═════════════════════════════════════════════════
// Cache elemen audio dan toggle button di variabel global
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');

// State: lacak apakah musik sedang bermain
let isPlaying = false;

// Set volume awal: 0.35 = 35% (tidak terlalu keras)
// Range: 0.0 (mute) - 1.0 (maksimal)
bgMusic.volume = 0.35;

// Event listener untuk tombol toggle musik
musicToggle?.addEventListener('click', () => {
  // ── JIKA SEDANG BERMAIN → PAUSE ──
  if (isPlaying) {
    bgMusic.pause();  // Hentikan musik
    
    // Update UI: hapus class "playing", tambah class "paused"
    musicToggle.classList.remove('playing');
    musicToggle.classList.add('paused');
    
    // Update state
    isPlaying = false;
    
  // ── JIKA SEDANG PAUSE → PLAY ──
  } else {
    // bgMusic.play() return Promise (karena mungkin butuh user interaction)
    bgMusic.play().then(() => {
      // Update UI: tambah class "playing", hapus "paused"
      musicToggle.classList.add('playing');
      musicToggle.classList.remove('paused');
      
      // Update state
      isPlaying = true;
    });
    // Jika play gagal (misal: autoplay blocked), error diabaikan
  }
});


// ═════════════════════════════════════════════════
// 11. SHARE FEATURES (Bagikan ke WhatsApp & Copy Link)
// ═════════════════════════════════════════════════

// ── SHARE KE WHATSAPP ──
window.shareWA = function () {
  // Encode URL halaman saat ini agar aman untuk query parameter
  const url = encodeURIComponent(window.location.href);
  
  // Encode teks pesan WhatsApp
  const text = encodeURIComponent('Anda diundang ke Pernikahan Arjuna & Sinta 🌸\nSabtu, 14 Juni 2025\n\nBuka undangan di sini:');
  // \n = newline (ganti baris) di WhatsApp
  
  // ── BUILD WA API URL ──
  // Format: https://wa.me/?text=PESAN%20URL
  // %20 = spasi yang di-encode
  window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  // '_blank' = buka di tab baru
};

// ── COPY LINK UNDANGAN ──
window.shareCopy = function () {
  // Clipboard API: salin URL halaman ke clipboard
  navigator.clipboard.writeText(window.location.href).then(() => {
    // Tampilkan toast konfirmasi
    showToast('🔗 Link undangan tersalin!');
  });
};


// ═════════════════════════════════════════════════
// 12. TOAST NOTIFICATION (Popup Pesan Singkat)
// ═════════════════════════════════════════════════
// Variabel global untuk timer toast (agar bisa di-clear)
let toastTimer;

function showToast(msg) {
  // Cari elemen toast
  const toast = document.getElementById('toast');
  if (!toast) return;  // Guard clause
  
  // Set teks pesan
  toast.textContent = msg;
  
  // Tampilkan toast dengan tambah class "show"
  // Class ini trigger CSS transition: opacity + transform
  toast.classList.add('show');
  
  // ── AUTO HIDE SETELAH 3 DETIK ──
  // Clear timer sebelumnya (mencegah multiple toast bertumpuk)
  clearTimeout(toastTimer);
  
  // Set timer baru: setelah 3000ms, hapus class "show" → toast menghilang
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}


// ═════════════════════════════════════════════════
// 13. ESCAPE HTML (Security: Cegah XSS Attack)
// ═════════════════════════════════════════════════
function escapeHtml(str) {
  // Ganti karakter spesial HTML jadi entity agar tidak dieksekusi sebagai kode
  return str
    .replace(/&/g, '&amp;')   // & → &amp; (harus pertama, agar & lain tidak double-encode)
    .replace(/</g, '&lt;')    // < → &lt; (mencegah tag HTML dibuka)
    .replace(/>/g, '&gt;')    // > → &gt; (mencegah tag HTML ditutup)
    .replace(/"/g, '&quot;'); // " → &quot; (mencegah break attribute)
  
  // Regex /char/g = global flag: ganti SEMUA kemunculan, bukan hanya pertama
  // Penting untuk security: user jahat bisa inject <script>alert('hack')</script>
  // Setelah escape: &lt;script&gt;alert('hack')&lt;/script&gt; → tampil sebagai teks, tidak jalan
}
