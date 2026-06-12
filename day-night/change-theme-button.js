const toggle = document.querySelector('.toggle');
const borderGlow = document.querySelector('.btn-border-glow');
let theme = 'dark';

const applyTheme = () => {
  document.documentElement.dataset.theme = theme;
  toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
};

applyTheme();

toggle.addEventListener('click', () => {
  theme = theme === 'light' ? 'dark' : 'light';

  // Trigger border glow rotation
  borderGlow.classList.remove('is-glowing');
  void borderGlow.offsetWidth; // force reflow to restart animation
  borderGlow.classList.add('is-glowing');
  borderGlow.addEventListener('animationend', () => borderGlow.classList.remove('is-glowing'), { once: true });

  // Get button center position for ripple origin
  const rect = toggle.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  // Create ripple element
  const ripple = document.createElement('div');
  ripple.className = 'theme-ripple';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.dataset.theme = theme;
  document.body.appendChild(ripple);

  // Apply theme when ripple covers screen
  setTimeout(() => applyTheme(), 700);

  // Remove ripple after animation
  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
});
