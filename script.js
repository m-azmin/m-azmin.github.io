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

const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.getAttribute('data-filter');

    // Toggle active button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Show/hide cards
    projectCards.forEach(card => {
      const categories = card.getAttribute('data-category').split(' ');

      if (filter === 'all' || categories.includes(filter)) {
        card.style.display = 'flex'; // or block, depending on your layout
      } else {
        card.style.display = 'none';
      }
    });
  });
});

const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});
