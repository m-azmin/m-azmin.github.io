// Fade-in animation
const faders = document.querySelectorAll('.fade-in');
const options = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

const fadeObserver = new IntersectionObserver(function(entries, observer) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('show');
    observer.unobserve(entry.target);
  });
}, options);

faders.forEach(el => fadeObserver.observe(el));

const langBtn = document.getElementById('langBtn');
const langMenu = document.getElementById('langMenu');
const currentLang = document.getElementById('currentLang');

langBtn.addEventListener('click', () => {
  langMenu.style.display = langMenu.style.display === 'block' ? 'none' : 'block';
});

document.querySelectorAll('.lang-menu li').forEach(item => {
  item.addEventListener('click', () => {
    const selectedLang = item.getAttribute('data-lang');
    currentLang.textContent = selectedLang.toUpperCase();
    langMenu.style.display = 'none';

    // load translation
    fetch(`lang/${selectedLang}.json`)
      .then(res => res.json())
      .then(translations => {
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const keys = el.getAttribute('data-i18n').split('.');
          let value = translations;
          keys.forEach(k => value = value[k]);
          if (value) el.innerHTML = value;
        });
      });
  });
});

// Hide on outside click
document.addEventListener('click', (e) => {
  if (!langBtn.contains(e.target) && !langMenu.contains(e.target)) {
    langMenu.style.display = 'none';
  }
});
