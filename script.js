// ===== المتغيرات العامة =====
let gamesData = [];
let currentLang = localStorage.getItem('fnaf_lang') || 'ar';
let currentTheme = localStorage.getItem('fnaf_theme') || 'dark';
let currentGameId = null;

// ===== رابط الصورة الاحتياطية =====
const FALLBACK_IMAGE = 'https://raw.githubusercontent.com/ydwx/fnaf-game-storge/refs/heads/main/files/98ad0a1411be3725701fc34c5d84b664.jpg';

// ===== تطبيق الإعدادات المحفوظة =====
function applySavedSettings() {
  // بما أننا نستخدم ثيم FNAF داكن كأساس، نضيف كلاس light لتفتيح بسيط
  if (currentTheme === 'light') {
    document.body.classList.add('light');
    document.getElementById('themeToggle').textContent = '🔦';
  } else {
    document.body.classList.remove('light');
    document.getElementById('themeToggle').textContent = '💡';
  }
  const langBtn = document.getElementById('langToggle');
  langBtn.textContent = currentLang === 'ar' ? '🇬🇧 English' : '🇸🇦 العربية';
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;
}

// ===== تحميل البيانات =====
fetch('data.json')
  .then(res => {
    if (!res.ok) throw new Error('فشل تحميل data.json');
    return res.json();
  })
  .then(data => {
    gamesData = data;
    checkRoute();
    renderGames();
  })
  .catch(() => {
    document.getElementById('gamesContainer').innerHTML =
      '<p style="text-align:center; color:#e74c3c; font-family:Courier New;">⚠️ تعذر تحميل البيانات، تأكد من وجود ملف data.json</p>';
  });

// ===== عرض الألعاب =====
function renderGames() {
  const container = document.getElementById('gamesContainer');
  if (!gamesData.length) {
    container.innerHTML = '<p style="text-align:center; color:#888;">لا توجد ألعاب حالياً</p>';
    return;
  }

  container.innerHTML = '';
  gamesData.forEach(game => {
    const name = game.name;
    const story = currentLang === 'ar' ? game.story_ar : game.story;
    const btnText = currentLang === 'ar' ? '⬇️ تحميل' : '⬇️ Download';

    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <img src="${game.image}" alt="${name}" loading="lazy" onerror="this.src='${FALLBACK_IMAGE}'; this.classList.add('error');" />
      <h2>${name}</h2>
      <p>${story}</p>
      <button class="download-btn-card" data-id="${game.id}">${btnText}</button>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.download-btn-card').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      handleDownload(id);
    });
  });

  container.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', function () {
      const btn = this.querySelector('.download-btn-card');
      if (btn) {
        const id = parseInt(btn.dataset.id);
        handleDownload(id);
      }
    });
  });
}

// ===== معالج التحميل الذكي =====
function handleDownload(id) {
  const game = gamesData.find(g => g.id === id);
  if (!game) return;

  const links = [];
  
  links.push({
    type: 'original',
    label: currentLang === 'ar' ? '📥 تحميل عادي' : '📥 Original',
    url: game.download
  });

  if (game.download_mod && game.download_mod.trim() !== '') {
    links.push({
      type: 'mod',
      label: currentLang === 'ar' ? '⚡ تحميل MOD' : '⚡ MOD',
      url: game.download_mod
    });
  }

  if (game.download_obb && game.download_obb.trim() !== '') {
    links.push({
      type: 'obb',
      label: currentLang === 'ar' ? '📦 تحميل OBB' : '📦 OBB',
      url: game.download_obb
    });
  }

  if (links.length === 1) {
    window.open(links[0].url, '_blank');
    return;
  }

  showDownloadModal(game.name, links);
}

// ===== نافذة اختيار التحميل =====
function showDownloadModal(gameName, links) {
  const modal = document.getElementById('downloadModal');
  const title = document.getElementById('modalTitle');
  const container = document.getElementById('modalButtons');

  title.textContent = currentLang === 'ar' 
    ? `🎮 اختر النسخة لـ ${gameName}`
    : `🎮 Choose version for ${gameName}`;

  container.innerHTML = '';
  links.forEach(link => {
    const btn = document.createElement('a');
    btn.className = `modal-btn ${link.type}`;
    btn.href = link.url;
    btn.target = '_blank';
    btn.textContent = link.label;
    container.appendChild(btn);
  });

  modal.style.display = 'flex';
}

// ===== إغلاق النافذة =====
document.querySelector('.close-modal').addEventListener('click', () => {
  document.getElementById('downloadModal').style.display = 'none';
});

document.getElementById('downloadModal').addEventListener('click', function(e) {
  if (e.target === this) {
    this.style.display = 'none';
  }
});

// ===== عرض صفحة التفاصيل =====
function showDetail(id) {
  const game = gamesData.find(g => g.id === id);
  if (!game) {
    showHome();
    return;
  }

  document.getElementById('homePage').style.display = 'none';
  document.getElementById('detailPage').style.display = 'block';
  document.getElementById('mainTitle').style.display = 'none';

  const name = game.name;
  const story = currentLang === 'ar' ? game.story_ar : game.story;
  const downloadText = currentLang === 'ar' ? '⬇️ تحميل عادي' : '⬇️ Original';

  let warningHtml = '';
  if (game.warning && game.warning.trim() !== '') {
    warningHtml = `<div class="warning-box"><p>${game.warning}</p></div>`;
  }

  let downloadButtons = `<a href="${game.download}" target="_blank" class="download-btn">${downloadText}</a>`;
  if (game.download_mod && game.download_mod.trim() !== '') {
    downloadButtons += `
      <a href="${game.download_mod}" target="_blank" class="download-btn mod">
        ⚡ MOD
        <span class="badge">${currentLang === 'ar' ? 'مهكرة' : 'Hacked'}</span>
      </a>
    `;
  }
  if (game.download_obb && game.download_obb.trim() !== '') {
    downloadButtons += `
      <a href="${game.download_obb}" target="_blank" class="download-btn obb">
        📦 OBB
        <span class="badge">${currentLang === 'ar' ? 'ملف بيانات' : 'Data'}</span>
      </a>
    `;
  }

  document.getElementById('detailContent').innerHTML = `
    <div class="detail-card">
      <img src="${game.image}" alt="${name}" onerror="this.src='${FALLBACK_IMAGE}'; this.classList.add('error');" />
      <h2>${name}</h2>
      <div class="story">${story}</div>
      ${warningHtml}
      <div class="download-section">
        ${downloadButtons}
      </div>
    </div>
  `;
}

// ===== التوجيه =====
function showHome() {
  document.getElementById('homePage').style.display = 'block';
  document.getElementById('detailPage').style.display = 'none';
  document.getElementById('mainTitle').style.display = 'block';
  renderGames();
}

function navigateHome() {
  history.pushState({}, '', window.location.pathname);
  showHome();
}

function checkRoute() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id && gamesData.length) {
    showDetail(parseInt(id));
  } else if (gamesData.length) {
    showHome();
  }
}

window.addEventListener('popstate', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id && gamesData.length) {
    showDetail(parseInt(id));
  } else {
    showHome();
  }
});

// ===== أزرار التحكم =====
document.getElementById('backBtn').addEventListener('click', navigateHome);

document.getElementById('langToggle').addEventListener('click', function () {
  currentLang = currentLang === 'ar' ? 'en' : 'ar';
  localStorage.setItem('fnaf_lang', currentLang);
  this.textContent = currentLang === 'ar' ? '🇬🇧 English' : '🇸🇦 العربية';
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;
  document.getElementById('mainTitle').textContent =
    currentLang === 'ar' ? 'مركز ألعاب فناف' : 'FNAF Games Hub';

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    showDetail(parseInt(id));
  } else {
    renderGames();
  }
});

document.getElementById('themeToggle').addEventListener('click', function () {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  localStorage.setItem('fnaf_theme', isLight ? 'light' : 'dark');
  this.textContent = isLight ? '🔦' : '💡';
});

// ===== التشغيل =====
applySavedSettings();

window.addEventListener('DOMContentLoaded', () => {
  if (gamesData.length) checkRoute();
});