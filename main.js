(function () {
  'use strict';

  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.nav-menu');
  var links = document.querySelectorAll('.nav-menu a');

  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', function () {
    if (menu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  links.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });
})();

(function () {
  'use strict';

  var cards = document.querySelectorAll('.wish-card');
  cards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      card.classList.toggle('flipped');
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });
})();

(function () {
  'use strict';

  var studentCards = document.querySelectorAll('.student-card');
  if (!studentCards.length) return;

  studentCards.forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.toggle('is-flipped');
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('is-flipped');
      }
    });
  });
})();

(function () {
  'use strict';

  var pins = document.querySelectorAll('.mapa-pin');
  pins.forEach(function (pin) {
    pin.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = pin.classList.contains('is-open');
      pins.forEach(function (p) { p.classList.remove('is-open'); });
      if (!isOpen) pin.classList.add('is-open');
    });
    pin.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        var isOpen = pin.classList.contains('is-open');
        pins.forEach(function (p) { p.classList.remove('is-open'); });
        if (!isOpen) pin.classList.add('is-open');
      }
    });
  });

  document.addEventListener('click', function () {
    pins.forEach(function (p) { p.classList.remove('is-open'); });
  });
})();

(function () {
  'use strict';

  var tabs = document.querySelectorAll('.group-filter-tab');
  var studentCards = document.querySelectorAll('.student-card');
  var wishCards = document.querySelectorAll('.wish-card');
  var searchInput = document.querySelector('#student-search');

  if (!tabs.length && !searchInput) return;

  var currentGrupo = '';
  var currentSearch = '';

  function normalize(text) {
    return (text || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function cardMatchesFilters(card) {
    var grupo = card.getAttribute('data-grupo') || '';
    var matchesGrupo = !currentGrupo || grupo === currentGrupo;
    if (!matchesGrupo) return false;

    if (!currentSearch) return true;

    var nameEl = card.querySelector('.student-card-name, .wish-card-name');
    var name = nameEl ? normalize(nameEl.textContent) : '';
    return name.indexOf(currentSearch) !== -1;
  }

  function applyFilters() {
    studentCards.forEach(function (card) {
      card.classList.toggle('filter-hidden', !cardMatchesFilters(card));
    });
    wishCards.forEach(function (card) {
      card.classList.toggle('filter-hidden', !cardMatchesFilters(card));
    });
  }

  function setActiveGrupo(grupo) {
    currentGrupo = grupo === null || grupo === undefined ? '' : String(grupo);
    tabs.forEach(function (tab) {
      var tabGrupo = tab.getAttribute('data-grupo') || '';
      if (tabGrupo === currentGrupo) {
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('is-active');
        tab.setAttribute('aria-selected', 'false');
      }
    });
    applyFilters();
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      setActiveGrupo(tab.getAttribute('data-grupo'));
    });
    tab.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActiveGrupo(tab.getAttribute('data-grupo'));
      }
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      currentSearch = normalize(searchInput.value.trim());
      applyFilters();
    });
  }

  // Estado inicial: todos los grupos y sin búsqueda
  setActiveGrupo('');
})();
