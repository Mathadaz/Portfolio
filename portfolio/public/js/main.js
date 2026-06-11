// Animate skill bars when they scroll into view
function animateSkillBars() {
  const bars = document.querySelectorAll('.skill-bar');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const level = bar.dataset.level;
        setTimeout(() => {
          bar.style.transition = 'width 1s cubic-bezier(0.4, 0, 0.2, 1)';
          bar.style.width = level + '%';
        }, 100);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.1 });

  bars.forEach(bar => observer.observe(bar));
}

// Smooth active nav link highlighting
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a[href^="/#"]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('text-zinc-100');
          link.classList.add('text-zinc-400');
          if (link.getAttribute('href') === '/#' + entry.target.id) {
            link.classList.add('text-zinc-100');
            link.classList.remove('text-zinc-400');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));
}

// Stagger-in page content on load
function staggerIn() {
  const hero = document.querySelector('section');
  if (hero) {
    hero.style.opacity = '0';
    hero.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => {
      setTimeout(() => {
        hero.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        hero.style.opacity = '1';
        hero.style.transform = 'translateY(0)';
      }, 50);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  animateSkillBars();
  updateActiveNav();
  staggerIn();
});
