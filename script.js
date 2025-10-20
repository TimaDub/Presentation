// Basic slide navigation: dots, keyboard, and active state sync
(function() {
  const slidesContainer = document.getElementById('slides');
  const dots = Array.from(document.querySelectorAll('.dot'));
  const sections = Array.from(document.querySelectorAll('.slide'));
  const backTopBtn = document.getElementById('backToTop');
  // summary elements removed

  function goTo(hash) {
    const el = document.querySelector(hash);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setActiveDot(idHash) {
    dots.forEach(d => d.setAttribute('aria-current', String(d.dataset.target === idHash)));
  }

  // Dot clicks
  dots.forEach(btn => btn.addEventListener('click', () => goTo(btn.dataset.target)));

  // Keyboard arrows/PageUp/PageDown/Home/End
  window.addEventListener('keydown', (e) => {
    const keysNext = ['ArrowDown', 'PageDown', ' '];
    const keysPrev = ['ArrowUp', 'PageUp', 'Shift '];
    const keysHome = ['Home'];
    const keysEnd = ['End'];

    const ids = sections.map(s => `#${s.id}`);
    const current = ids.indexOf(location.hash || `#${sections[0].id}`);

    if (keysNext.includes(e.key)) {
      e.preventDefault();
      const next = Math.min(current + 1, ids.length - 1);
      goTo(ids[next]);
    } else if (keysPrev.includes(e.key)) {
      e.preventDefault();
      const prev = Math.max(current - 1, 0);
      goTo(ids[prev]);
    } else if (keysHome.includes(e.key)) {
      e.preventDefault();
      goTo(ids[0]);
    } else if (keysEnd.includes(e.key)) {
      e.preventDefault();
      goTo(ids[ids.length - 1]);
    }
  });

  // Sync active section using IntersectionObserver for reliable hash updates
  const observer = new IntersectionObserver((entries) => {
    // choose the entry with largest intersection ratio
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) {
      visible.target.classList.add('visible');
      const idHash = `#${visible.target.id}`;
      if (location.hash !== idHash) {
        history.replaceState({}, '', idHash);
        setActiveDot(idHash);
      }
    }
  }, { root: slidesContainer, threshold: [0.51, 0.75, 0.98] });
  sections.forEach(sec => observer.observe(sec));

  // On load: jump to hash or first slide and set active
  window.addEventListener('load', () => {
    if (location.hash) goTo(location.hash); else goTo(`#${sections[0].id}`);
    setActiveDot(location.hash || `#${sections[0].id}`);
    initPhotosCarousel();
  });
  // Show back-to-top on last slide visible
  if (backTopBtn) {
    const lastId = `#${sections[sections.length - 1].id}`;
    const lastEl = sections[sections.length - 1];
    const lastObs = new IntersectionObserver((entries) => {
      const e = entries[0];
      const visible = e.isIntersecting && e.intersectionRatio > 0.6;
      backTopBtn.hidden = !visible;
      // only back to top toggles
    }, { root: slidesContainer, threshold: [0.2, 0.6, 0.95] });
    lastObs.observe(lastEl);
    backTopBtn.addEventListener('click', () => goTo(`#${sections[0].id}`));
  }
  // Ensure hidden by default
  if (backTopBtn) backTopBtn.hidden = true;

  // no summary modal
})();

// Playground removed
// Fullscreen Photos carousel
function initPhotosCarousel() {
  const stage = document.querySelector('#photos .photo-stage');
  if (!stage) return;
  const track = stage.querySelector('.photo-track');
  const images = Array.from(track.querySelectorAll('img'));
  const prev = stage.querySelector('.ph-btn.prev');
  const next = stage.querySelector('.ph-btn.next');
  let idx = 0;

  function render() {
    track.style.transform = `translateX(${-idx * 100}%)`;
  }

  function go(delta) {
    idx = (idx + delta + images.length) % images.length;
    render();
  }

  prev?.addEventListener('click', () => go(-1));
  next?.addEventListener('click', () => go(1));

  // Keyboard navigation when slide focused
  const slide = document.getElementById('photos');
  slide.setAttribute('tabindex', '0');
  slide.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });

  render();
}

// Hover grid effect (like hypr.land)
function initHoverGrid() {
  const hoverGrid = document.querySelector('.hover-grid');
  const slide = document.querySelector('#about');
  if (!hoverGrid || !slide) return;

  const cells = hoverGrid.querySelectorAll('.grid-cell');
  console.log(`Found ${cells.length} grid cells`);

  // Add hover effect
  let rafId = null;
  
  slide.addEventListener('mousemove', (e) => {
    if (rafId) return;
    
    rafId = requestAnimationFrame(() => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      cells.forEach((cell) => {
        const rect = cell.getBoundingClientRect();
        const cellCenterX = rect.left + rect.width / 2;
        const cellCenterY = rect.top + rect.height / 2;
        
        const distance = Math.sqrt(
          Math.pow(mouseX - cellCenterX, 2) + Math.pow(mouseY - cellCenterY, 2)
        );
        
        // Activate cells within radius
        if (distance < 300) {
          if (!cell.classList.contains('active')) {
            cell.classList.add('active');
            setTimeout(() => {
              cell.classList.remove('active');
            }, 1000);
          }
        }
      });
      
      rafId = null;
    });
  });
}

// Initialize hover grid after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initHoverGrid();
});


