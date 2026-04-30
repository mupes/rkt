/* ─────────────────────────────────────────────────
   main.js — with Supabase real-time RSVP
   ───────────────────────────────────────────────── */

// ══════════════════════════════════════════════════
// KONFIGURASI SUPABASE — ganti dengan milikmu!
// ══════════════════════════════════════════════════
const SUPABASE_URL = 'https://yykvenjzqxbhwjooddee.supabase.co';   // ← ganti ini
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5a3Zlbmp6cXhiaHdqb29kZGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDE4NjYsImV4cCI6MjA5MzExNzg2Nn0.AuDxGCB0mnoaJkwhvtvznmFVZ0R956PASnuUFSG7rrM'; // ← ganti ini

// Helper: fetch wrapper untuk Supabase REST API
const sb = {
  async insert(data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rsvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getAll() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rsvp?order=created_at.desc&limit=50`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    return res.json();
  }
};


// ══════════════════════════════════════════════════
// 1. GUEST NAME FROM URL
// ══════════════════════════════════════════════════
(function readGuestFromURL() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('to') || params.get('nama');
  if (name) {
    const decoded = decodeURIComponent(name);
    document.querySelectorAll('.guest-name').forEach(el => {
      el.textContent = decoded;
    });
  }
})();


// ══════════════════════════════════════════════════
// 2. PETAL ANIMATION
// ══════════════════════════════════════════════════
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


// ══════════════════════════════════════════════════
// 3. OPEN INVITATION
// ══════════════════════════════════════════════════
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
    loadRSVP(); // ← load dari Supabase
  }, 800);
});


// ══════════════════════════════════════════════════
// 4. COUNTDOWN TIMER
// ══════════════════════════════════════════════════
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


// ══════════════════════════════════════════════════
// 5. ADD TO CALENDAR
// ══════════════════════════════════════════════════
document.getElementById('calendarBtn')?.addEventListener('click', function () {
  const title = encodeURIComponent('Re-Opening Rakote Coffee');
  const start = '20260502T140000';
  const end   = '20260502T220000';
  const loc   = encodeURIComponent('Jakarta, Indonesia');
  const url   = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${loc}`;
  window.open(url, '_blank');
});


// ══════════════════════════════════════════════════
// 6. SCROLL ANIMATION OBSERVER
// ══════════════════════════════════════════════════
function initObserver() {
  const els = document.querySelectorAll('.fade-up, .fade-left, .fade-right');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => obs.observe(el));
}


// ══════════════════════════════════════════════════
// 7. GALLERY LIGHTBOX
// ══════════════════════════════════════════════════
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


// ══════════════════════════════════════════════════
// 8. RSVP — SUPABASE (Load & Submit)
// ══════════════════════════════════════════════════

// Render satu item ucapan ke DOM
function renderMessage(item) {
  const container = document.getElementById('rsvpMessages');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'rsvp-message-item';

  const time = item.created_at
    ? new Date(item.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })
    : '';

  div.innerHTML = `
    <div class="rsvp-msg-header">
      <span class="rsvp-msg-name">${escapeHtml(item.name)}</span>
      <span class="rsvp-msg-time">${time}</span>
    </div>
    <div class="rsvp-msg-attend">
      ${item.attend === 'hadir' ? '✅ Insya Allah Hadir' : '❌ Berhalangan Hadir'}
      · ${item.guests} orang
    </div>
    ${item.message ? `<div class="rsvp-msg-text">"${escapeHtml(item.message)}"</div>` : ''}
  `;
  container.appendChild(div);
}

// Load semua ucapan dari Supabase
async function loadRSVP() {
  const container = document.getElementById('rsvpMessages');
  if (!container) return;

  container.innerHTML = '<p class="rsvp-loading">Memuat ucapan... 💌</p>';

  try {
    const data = await sb.getAll();
    container.innerHTML = '';

    if (!data || data.length === 0) {
      container.innerHTML = '<p class="rsvp-empty">Belum ada ucapan. Jadilah yang pertama! 🌸</p>';
      return;
    }

    data.forEach(item => renderMessage(item));
  } catch (err) {
    container.innerHTML = '<p class="rsvp-empty">Gagal memuat ucapan. Cek koneksi internet.</p>';
    console.error('Supabase load error:', err);
  }
}

// Submit RSVP baru ke Supabase
document.getElementById('rsvpSubmit')?.addEventListener('click', async function () {
  const btn     = this;
  const name    = document.getElementById('rsvpName').value.trim();
  const phone   = document.getElementById('rsvpPhone').value.trim();
  const message = document.getElementById('rsvpMessage').value.trim();
  const attend  = document.querySelector('input[name="attend"]:checked')?.value;
  const guests  = document.getElementById('rsvpGuests').value;

  if (!name || !phone || !attend) {
    showToast('⚠️ Mohon lengkapi data yang wajib diisi.');
    return;
  }

  // Disable tombol saat proses
  btn.disabled = true;
  btn.textContent = 'Mengirim...';

  try {
    const result = await sb.insert({ name, phone, message, attend, guests });

    if (result && result[0]) {
      // Tampilkan ucapan baru di paling atas
      const container = document.getElementById('rsvpMessages');
      const emptyMsg  = container.querySelector('.rsvp-empty');
      if (emptyMsg) emptyMsg.remove();

      const newItem = document.createElement('div');
      newItem.className = 'rsvp-message-item';
      container.prepend(newItem);
      newItem.outerHTML; // trigger reflow
      renderMessage(result[0]);
      container.prepend(container.firstChild);

      showToast('🎉 Terima kasih! Ucapan berhasil dikirim.');

      // Reset form
      document.getElementById('rsvpName').value = '';
      document.getElementById('rsvpPhone').value = '';
      document.getElementById('rsvpMessage').value = '';
      document.querySelectorAll('input[name="attend"]').forEach(r => r.checked = false);
      document.getElementById('rsvpGuests').value = '1';

      // Reload untuk tampilkan urutan terbaru
      await loadRSVP();
    } else {
      throw new Error('Insert failed');
    }
  } catch (err) {
    showToast('❌ Gagal mengirim. Coba lagi.');
    console.error('Supabase insert error:', err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Kirim Konfirmasi';
  }
});


// ══════════════════════════════════════════════════
// 9. COPY TO CLIPBOARD
// ══════════════════════════════════════════════════
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


// ══════════════════════════════════════════════════
// 10. MUSIC CONTROL
// ══════════════════════════════════════════════════
const bgMusic     = document.getElementById('bgMusic');
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


// ══════════════════════════════════════════════════
// 11. SHARE FEATURES
// ══════════════════════════════════════════════════
window.shareWA = function () {
  const url  = encodeURIComponent(window.location.href);
  const text = encodeURIComponent('Anda diundang ke Re-Opening Rakote Coffee\nSabtu, 2 Mei 2026\n\nBuka undangan di sini:');
  window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
};

window.shareCopy = function () {
  navigator.clipboard.writeText(window.location.href).then(() => {
    showToast('🔗 Link undangan tersalin!');
  });
};


// ══════════════════════════════════════════════════
// 12. TOAST NOTIFICATION
// ══════════════════════════════════════════════════
let toastTimer;

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}


// ══════════════════════════════════════════════════
// 13. ESCAPE HTML (Security)
// ══════════════════════════════════════════════════
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
