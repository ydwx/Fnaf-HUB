// ===== المتغيرات العامة =====
let gamesData = [];
let currentLang = localStorage.getItem('fnaf_lang') || 'ar';
let currentTheme = localStorage.getItem('fnaf_theme') || 'light';
let currentFilter = 'all';
let currentSearch = '';

// ===== رابط الصورة الاحتياطية (دائم) =====
const FALLBACK_IMAGE = 'https://raw.githubusercontent.com/ydwx/fnaf-game-storge/refs/heads/main/files/98ad0a1411be3725701fc34c5d84b664.jpg';

// ===== دالة استخراج الـ Tags =====
function getGameTags(game) {
  const tags = [];
  if (game.tags && game.tags.length > 0) {
    return game.tags;
  }
  if (game.download_mod && game.download_mod.trim() !== '') {
    tags.push('MOD');
  }
  if (game.download_obb && game.download_obb.trim() !== '') {
    tags.push('PORT');
  }
  if (tags.length === 0) {
    tags.push('ORIGINAL');
  }
  return tags;
}

// ===== دالة عرض الـ Tags (بصيغة HTML) =====
function renderTags(tags) {
  return tags.map(tag => {
    const className = `tag tag-${tag.toLowerCase()}`;
    return `<span class="${className}">${tag}</span>`;
  }).join('');
}

// ===== تطبيق الإعدادات المحفوظة =====
function applySavedSettings() {
  if (currentTheme === 'dark') {
    document.body.classList.add('dark');
    document.getElementById('themeToggle').textContent = '☀️';
  } else {
    document.body.classList.remove('dark');
    document.getElementById('themeToggle').textContent = '🌙';
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
    applyFilters();
  })
  .catch(() => {
    document.getElementById('gamesContainer').innerHTML =
      '<p style="text-align:center; color:#e74c3c;">⚠️ تعذر تحميل البيانات، تأكد من وجود ملف data.json</p>';
  });

// ===== دالة التصفية والبحث =====
function applyFilters() {
  const container = document.getElementById('gamesContainer');
  if (!gamesData.length) {
    container.innerHTML = '<p style="text-align:center;">لا توجد ألعاب حالياً</p>';
    return;
  }

  const searchTerm = currentSearch.toLowerCase().trim();
  const filtered = gamesData.filter(game => {
    const tags = getGameTags(game);
    if (currentFilter !== 'all' && !tags.includes(currentFilter)) {
      return false;
    }
    if (searchTerm !== '') {
      const nameEn = game.name.toLowerCase();
      const nameAr = game.name_ar ? game.name_ar.toLowerCase() : '';
      return nameEn.includes(searchTerm) || nameAr.includes(searchTerm);
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="no-results">❌ لا توجد ألعاب تطابق البحث</div>';
    return;
  }

  container.innerHTML = '';
  filtered.forEach(game => {
    const name = game.name;
    const story = currentLang === 'ar' ? game.story_ar : game.story;
    const btnText = currentLang === 'ar' ? '📖 تفاصيل' : '📖 Details';
    const tags = getGameTags(game);
    const tagsHtml = renderTags(tags);

    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <img src="${game.image}" alt="${name}" loading="lazy" onerror="this.src='${FALLBACK_IMAGE}'; this.classList.add('error');" />
      <h2>${name}</h2>
      <div class="game-tags">${tagsHtml}</div>
      <p>${story}</p>
      <button class="card-btn" data-id="${game.id}">${btnText}</button>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.card-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      navigateToGame(parseInt(btn.dataset.id));
    });
  });
  container.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', function () {
      const btn = this.querySelector('.card-btn');
      if (btn) navigateToGame(parseInt(btn.dataset.id));
    });
  });
}

// ===== عرض الصفحة الرئيسية =====
function showHome() {
  document.getElementById('homePage').style.display = 'block';
  document.getElementById('detailPage').style.display = 'none';
  document.getElementById('mainTitle').style.display = 'block';
  applyFilters();
}

// ===== عرض صفحة التفاصيل =====
function showGameDetail(id) {
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
  const downloadText = currentLang === 'ar' ? '📥 تحميل عادي' : '📥 Original';
  const modText = currentLang === 'ar' ? '⚡ تحميل MOD (مهكرة)' : '⚡ MOD (Hacked)';
  const modBadge = currentLang === 'ar' ? 'نسخة مهكرة' : 'MOD Version';
  const obbText = currentLang === 'ar' ? '📦 تحميل بيانات اللعبة (OBB)' : '📦 Download Game Data (OBB)';

  const tags = getGameTags(game);
  const tagsHtml = renderTags(tags);

  let warningHtml = '';
  if (game.warning && game.warning.trim() !== '') {
    warningHtml = `<div class="warning-box"><p>${game.warning}</p></div>`;
  }

  let downloadButtons = `<a href="${game.download}" target="_blank" class="download-btn">${downloadText}</a>`;
  if (game.download_mod && game.download_mod.trim() !== '') {
    downloadButtons += `
      <a href="${game.download_mod}" target="_blank" class="download-btn mod">
        ${modText}
        <span class="badge">${modBadge}</span>
      </a>
    `;
  }
  if (game.download_obb && game.download_obb.trim() !== '') {
    downloadButtons += `
      <a href="${game.download_obb}" target="_blank" class="download-btn obb">
        ${obbText}
        <span class="badge">${currentLang === 'ar' ? 'ملف بيانات' : 'Data File'}</span>
      </a>
    `;
  }

  document.getElementById('detailContent').innerHTML = `
    <div class="detail-card">
      <img src="${game.image}" alt="${name}" onerror="this.src='${FALLBACK_IMAGE}'; this.classList.add('error');" />
      <h2>${name}</h2>
      <div class="detail-tags">${tagsHtml}</div>
      <div class="story">${story}</div>
      ${warningHtml}
      <div class="download-section">
        ${downloadButtons}
      </div>
    </div>
  `;
}

// ===== التوجيه =====
function navigateToGame(id) {
  history.pushState({ gameId: id }, '', `?id=${id}`);
  showGameDetail(id);
}

function navigateHome() {
  history.pushState({}, '', window.location.pathname);
  showHome();
}

function checkRoute() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id && gamesData.length) {
    showGameDetail(parseInt(id));
  } else if (gamesData.length) {
    showHome();
  }
}

window.addEventListener('popstate', event => {
  if (event.state && event.state.gameId) {
    showGameDetail(event.state.gameId);
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
    showGameDetail(parseInt(id));
  } else {
    showHome();
  }
});

document.getElementById('themeToggle').addEventListener('click', function () {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('fnaf_theme', isDark ? 'dark' : 'light');
  this.textContent = isDark ? '☀️' : '🌙';
});

// ===== أحداث البحث والتصفية =====
document.getElementById('searchInput').addEventListener('input', function () {
  currentSearch = this.value;
  applyFilters();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentFilter = this.dataset.filter;
    applyFilters();
  });
});

// ===== التشغيل =====
applySavedSettings();

window.addEventListener('DOMContentLoaded', () => {
  if (gamesData.length) checkRoute();
});