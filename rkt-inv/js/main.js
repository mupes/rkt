/* ─────────────────────────────────────────────────
  RAKOTE COFFEE Re-Opening
   ───────────────────────────────────────────────── */

// ═════════════════════════════════════════════════
// 1. GUEST NAME FROM URL (Nama Tamu dari Link)
// ═════════════════════════════════════════════════

(function readGuestFromURL() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('to') || params.get('nama');
  if (name) {
    const decodedName = decodeURIComponent(name);
    const elements = document.querySelectorAll('.guest-name');
    elements.forEach(el => {
      el.textContent = decodedName; 
    });
  }
})();


// ═════════════════════════════════════════════════
// 2. PETAL ANIMATION (Animasi Kelopak Bunga)
// ═════════════════════════════════════════════════
(function createPetals() {
  const container = document.getElementById('petals');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${6 + Math.random() * 8}px;
      height: ${8 + Math.random() * 10}px;
      animation-duration: ${5 + Math.random() * 8}s;
      animation-delay: ${Math.random() * 6}s;
      opacity: ${0.3 + Math.random() * 0.5};
      border-radius: ${Math.random() > 0.5 ? '0 100% 0 100%' : '100% 0 100% 0'};
    `;
    container.appendChild(p);
  }
})();


// ═════════════════════════════════════════════════
// 3. OPEN INVITATION (Tombol Buka Undangan)
// ═════════════════════════════════════════════════
document.getElementById('openBtn')?.addEventListener('click', function () {
  const cover = document.getElementById('cover');
  const main  = document.getElementById('mainContent');
  cover.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  cover.style.opacity = '0';
  cover.style.transform = 'scale(0.96)';
  setTimeout(() => {
    cover.style.display = 'none';  
    main.classList.remove('hidden'); 
    main.classList.add('visible');
    bgMusic.play().catch(() => {});
    startCountdown();
    initObserver();
    initGallery();
    renderStoredRSVP();
  }, 800);
});


// ═════════════════════════════════════════════════
// 4. COUNTDOWN TIMER (Hitung Mundur Acara)
// ═════════════════════════════════════════════════

const WEDDING_DATE = new Date('2026-05-02T14:00:00');
function startCountdown() {
  function tick() {
    const diff = WEDDING_DATE - new Date();
    if (diff <= 0) {
      document.getElementById('countdown').innerHTML = 
        '<p style="color:var(--gold);font-family:var(--ff-serif);font-size:1.5rem;font-style:italic">Hari Bahagia Telah Tiba! 🎉</p>';
      return; 
    }
    
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const secs  = Math.floor((diff % 60000) / 1000);
    document.getElementById('cd-days').textContent  = String(days).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-mins').textContent  = String(mins).padStart(2, '0');
    document.getElementById('cd-secs').textContent  = String(secs).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);
}

// ═════════════════════════════════════════════════
// 5. ADD TO CALENDAR (Tambah ke Google Calendar)
// ═════════════════════════════════════════════════
document.getElementById('calendarBtn')?.addEventListener('click', function () {
  const title = encodeURIComponent('ST18 for Rakote Coffee');
  const start = '20250614T080000';
  const end   = '20250614T140000'; 
  const loc   = encodeURIComponent('Jakarta, Indonesia');
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${loc}`;
  window.open(url, '_blank');
});


// ═════════════════════════════════════════════════
// 6. SCROLL ANIMATION OBSERVER (Animasi Saat Scroll)
// ═════════════════════════════════════════════════
function initObserver() {
  const els = document.querySelectorAll('.fade-up, .fade-left, .fade-right');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { 
    threshold: 0.15
  });
  els.forEach(el => obs.observe(el));
}


// ═════════════════════════════════════════════════
// 7. GALLERY LIGHTBOX (Popup Foto Full Size)
// ═════════════════════════════════════════════════
function initGallery() {
  const items    = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const img      = document.getElementById('lightboxImg');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.src || item.style.backgroundImage.replace(/url\(["']?|["']?\)/g, '');
      img.src = src;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; 
  }
}


// ═════════════════════════════════════════════════
// 8. RSVP FORM (Form Konfirmasi Kehadiran)
// ═════════════════════════════════════════════════
const STORAGE_KEY = 'wedding_rsvp_v1';
function renderStoredRSVP() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const container = document.getElementById('rsvpMessages');
  if (!container) return;
  container.innerHTML = '';
  stored.slice().reverse().forEach(item => appendMessage(item));
}

function appendMessage(item) {
  const container = document.getElementById('rsvpMessages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'rsvp-message-item'; 
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
  
  container.prepend(div);
}

document.getElementById('rsvpSubmit')?.addEventListener('click', function () {
  const name    = document.getElementById('rsvpName').value.trim();
  const phone   = document.getElementById('rsvpPhone').value.trim();
  const message = document.getElementById('rsvpMessage').value.trim();
  const attend  = document.querySelector('input[name="attend"]:checked')?.value;
  const guests  = document.getElementById('rsvpGuests').value;
  if (!name || !phone || !attend) {
    showToast('⚠️ Mohon lengkapi data yang wajib diisi.');
    return; 
  }
  const data = { 
    name,           
    phone, 
    message, 
    attend, 
    guests, 
    time: new Date().toISOString()
  };
  
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  stored.push(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  appendMessage(data);
  showToast('🎉 Terima kasih! Konfirmasi berhasil dikirim.');
  document.getElementById('rsvpName').value = '';
  document.getElementById('rsvpPhone').value = '';
  document.getElementById('rsvpMessage').value = '';
  document.querySelectorAll('input[name="attend"]').forEach(r => r.checked = false);
  document.getElementById('rsvpGuests').value = '1';
});


// ═════════════════════════════════════════════════
// 9. COPY TO CLIPBOARD (Salin Nomor Rekening)
// ═════════════════════════════════════════════════
window.copyText = function (text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✓ Tersalin!';
    btn.classList.add('copied');
    showToast('📋 Nomor rekening tersalin!');
    setTimeout(() => {
      btn.textContent = 'Salin Nomor';
      btn.classList.remove('copied');
    }, 2000); 
  });
};


// ═════════════════════════════════════════════════
// 10. MUSIC CONTROL (Play/Pause Background Music)
// ═════════════════════════════════════════════════
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
let isPlaying = false;
bgMusic.volume = 0.35;
musicToggle?.addEventListener('click', () => {
  if (isPlaying) {
    bgMusic.pause(); 
    musicToggle.classList.remove('playing');
    musicToggle.classList.add('paused');
    isPlaying = false;
  } else {
    bgMusic.play().then(() => {
      musicToggle.classList.add('playing');
      musicToggle.classList.remove('paused');
      isPlaying = true;
    });
  }
});


// ═════════════════════════════════════════════════
// 11. SHARE FEATURES (Bagikan ke WhatsApp & Copy Link)
// ═════════════════════════════════════════════════
window.shareWA = function () {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent('Anda diundang ke Re-Opening Rakote Coffee\nSabtu, 2 Mei 2026\n\nBuka undangan di sini:');
  window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
};

window.shareCopy = function () {
  navigator.clipboard.writeText(window.location.href).then(() => {
    showToast('🔗 Link undangan tersalin!');
  });
};


// ═════════════════════════════════════════════════
// 12. TOAST NOTIFICATION (Popup Pesan Singkat)
// ═════════════════════════════════════════════════
let toastTimer;

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return; 
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}


// ═════════════════════════════════════════════════
// 13. ESCAPE HTML (Security: Cegah XSS Attack)
// ═════════════════════════════════════════════════
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')  
    .replace(/</g, '&lt;')    
    .replace(/>/g, '&gt;')   
    .replace(/"/g, '&quot;');
}
