/* ==========================================================================
   PORTAL PROF. JOÃO PAULO - INTERACTIVE JAVASCRIPT ENGINE
   Features: Live Search & Filtering, Dark/Light Theme Engine, Favorites system,
             Dynamic Stats Counter, Toast Notifications, Grid/List view toggle.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  initMobileMenu();
  initStatsCounter();
  initMaterialsHub();
  initBookmarks();
});

/* --- 1. THEME ENGINE --- */
function initThemeEngine() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  
  // Check saved theme preference or default to dark
  const savedTheme = localStorage.getItem('prof_jp_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('prof_jp_theme', newTheme);
      updateThemeIcon(newTheme);
      
      showToast(newTheme === 'dark' ? 'Modo Escuro ativado' : 'Modo Claro ativado', 'fa-moon');
    });
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'dark') {
      themeIcon.className = 'fas fa-sun';
    } else {
      themeIcon.className = 'fas fa-moon';
    }
  }
}

/* --- 2. MOBILE MENU TOGGLE --- */
function initMobileMenu() {
  const mobileToggleBtn = document.getElementById('mobileToggleBtn');
  const navLinks = document.getElementById('navLinks');

  if (mobileToggleBtn && navLinks) {
    mobileToggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-active');
      const isOpen = navLinks.classList.contains('mobile-active');
      mobileToggleBtn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    // Close mobile menu when clicking outside or link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-active');
        mobileToggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }
}

/* --- 3. ANIMATED STATS COUNTER --- */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  if (statNumbers.length === 0) return;

  const observerOptions = { threshold: 0.5 };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetCount = parseInt(el.getAttribute('data-count'), 10);
        animateValue(el, 0, targetCount, 1500);
        observer.unobserve(el);
      }
    });
  }, observerOptions);

  statNumbers.forEach(el => observer.observe(el));

  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerText = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.innerText = end;
      }
    };
    window.requestAnimationFrame(step);
  }
}

/* --- 4. MATERIALS HUB (LIVE SEARCH, CATEGORY TABS, VIEW MODES) --- */
function initMaterialsHub() {
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const categoryTabs = document.querySelectorAll('.tab-btn');
  const materialCards = document.querySelectorAll('.material-card');
  const resultsCount = document.getElementById('resultsCount');
  const noResultsEl = document.getElementById('noResults');
  const viewGridBtn = document.getElementById('viewGridBtn');
  const viewListBtn = document.getElementById('viewListBtn');
  const materialsGrid = document.getElementById('materialsGrid');

  if (!materialsGrid) return; // Exit if not on materiais page

  let activeCategory = 'all';
  let searchQuery = '';

  // Category Tab Filter
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-category');
      filterMaterials();
    });
  });

  // Live Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle('active', searchQuery.length > 0);
      }
      filterMaterials();
    });
  }

  // Clear Search
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.remove('active');
      filterMaterials();
    });
  }

  // View Mode Switcher
  if (viewGridBtn && viewListBtn) {
    viewGridBtn.addEventListener('click', () => {
      viewGridBtn.classList.add('active');
      viewListBtn.classList.remove('active');
      materialsGrid.classList.remove('list-view');
    });

    viewListBtn.addEventListener('click', () => {
      viewListBtn.classList.add('active');
      viewGridBtn.classList.remove('active');
      materialsGrid.classList.add('list-view');
    });
  }

  // Main Filter Algorithm
  function filterMaterials() {
    let visibleCount = 0;

    materialCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardTitle = card.querySelector('.material-title')?.innerText.toLowerCase() || '';
      const cardDesc = card.querySelector('.material-meta')?.innerText.toLowerCase() || '';
      
      const matchesCategory = activeCategory === 'all' || cardCategory === activeCategory;
      const matchesSearch = searchQuery === '' || cardTitle.includes(searchQuery) || cardDesc.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update Counter & Empty State
    if (resultsCount) resultsCount.innerText = visibleCount;
    if (noResultsEl) {
      noResultsEl.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // Handle Download Click Feedback
  document.querySelectorAll('.btn-download-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const fileName = btn.getAttribute('data-filename') || 'Material de Aula';
      showToast(`Iniciando download: ${fileName}`, 'fa-file-download');
    });
  });
}

/* --- 5. BOOKMARKS / FAVORITES SYSTEM --- */
function initBookmarks() {
  const bookmarkBtns = document.querySelectorAll('.btn-bookmark');
  let savedBookmarks = JSON.parse(localStorage.getItem('prof_jp_bookmarks') || '[]');

  bookmarkBtns.forEach(btn => {
    const cardId = btn.getAttribute('data-id');
    
    // Set initial state
    if (savedBookmarks.includes(cardId)) {
      btn.classList.add('bookmarked');
      btn.innerHTML = '<i class="fas fa-bookmark"></i>';
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isBookmarked = btn.classList.contains('bookmarked');
      
      if (isBookmarked) {
        btn.classList.remove('bookmarked');
        btn.innerHTML = '<i class="far fa-bookmark"></i>';
        savedBookmarks = savedBookmarks.filter(id => id !== cardId);
        showToast('Removido dos favoritos', 'fa-bookmark');
      } else {
        btn.classList.add('bookmarked');
        btn.innerHTML = '<i class="fas fa-bookmark"></i>';
        savedBookmarks.push(cardId);
        showToast('Salvo nos favoritos!', 'fa-bookmark');
      }

      localStorage.setItem('prof_jp_bookmarks', JSON.stringify(savedBookmarks));
    });
  });
}

/* --- 6. TOAST NOTIFICATION UTILITY --- */
function showToast(message, iconClass = 'fa-info-circle') {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas ${iconClass}"></i> <span>${message}</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
