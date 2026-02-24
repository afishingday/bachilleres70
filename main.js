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

  function setActiveGrupo(grupo) {
    var grupoValue = grupo === null || grupo === undefined ? '' : String(grupo);
    tabs.forEach(function (tab) {
      var tabGrupo = tab.getAttribute('data-grupo') || '';
      if (tabGrupo === grupoValue) {
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('is-active');
        tab.setAttribute('aria-selected', 'false');
      }
    });
    studentCards.forEach(function (card) {
      var cardGrupo = card.getAttribute('data-grupo') || '';
      if (grupoValue === '' || cardGrupo === grupoValue) {
        card.classList.remove('filter-hidden');
      } else {
        card.classList.add('filter-hidden');
      }
    });
    wishCards.forEach(function (card) {
      var cardGrupo = card.getAttribute('data-grupo') || '';
      if (grupoValue === '' || cardGrupo === grupoValue) {
        card.classList.remove('filter-hidden');
      } else {
        card.classList.add('filter-hidden');
      }
    });
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
})();
