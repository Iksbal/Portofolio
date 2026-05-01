/* ═══════════════════════════════════════════════════════
   IKSBAL PORTFOLIO — script.js
   Features:
   - Sticky navbar + scroll state
   - Active nav link on scroll
   - Hamburger menu
   - Smooth scroll
   - Scroll-triggered fade-in animations
   - Portfolio filter
   - Back to top button
   - Testimonial slider (mobile)
   - Contact form feedback
   - Staggered animation delays
═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     1. NAVBAR — Scroll state + active links
  ───────────────────────────────────────── */
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const updateNavbar = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Highlight active nav link based on scroll position
    let current = '';
    sections.forEach(section => {
      const sectionTop    = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar(); // run once on load


  /* ─────────────────────────────────────────
     2. HAMBURGER MENU
  ───────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  let   menuOpen  = false;

  // Overlay to close menu on outside click
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed; inset:0; z-index:998;
    background:rgba(0,0,0,0.35);
    opacity:0; pointer-events:none;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(2px);
  `;
  document.body.appendChild(overlay);

  const openMenu = () => {
    menuOpen = true;
    hamburger.classList.add('open');
    navMenu.classList.add('open');
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menuOpen = false;
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    menuOpen ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });


  /* ─────────────────────────────────────────
     3. SMOOTH SCROLL for anchor links
  ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 16;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ─────────────────────────────────────────
     4. SCROLL FADE-IN ANIMATIONS
        Uses IntersectionObserver for performance
  ───────────────────────────────────────── */
  const animElems = document.querySelectorAll('.fade-in, .fade-up');

  // Apply staggered delays for grid children
  document.querySelectorAll('.services-grid .service-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 80}ms`;
  });
  document.querySelectorAll('.portfolio-grid .portfolio-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 70}ms`;
  });
  document.querySelectorAll('.testi-track .testi-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 100}ms`;
  });

  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve once animated so it doesn't re-trigger
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animElems.forEach(el => observer.observe(el));


  /* ─────────────────────────────────────────
     5. PORTFOLIO FILTER
  ───────────────────────────────────────── */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      portfolioCards.forEach((card, i) => {
        const category = card.getAttribute('data-category');
        const show     = filter === 'all' || category === filter;

        if (show) {
          card.classList.remove('hidden');
          // Small delay cascade for visual effect
          setTimeout(() => {
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0)';
          }, i * 50);
        } else {
          card.style.opacity   = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => card.classList.add('hidden'), 300);
        }
      });
    });
  });


  /* ─────────────────────────────────────────
     6. BACK TO TOP BUTTON
  ───────────────────────────────────────── */
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  /* ─────────────────────────────────────────
     7. TESTIMONIAL — Mobile slider
  ───────────────────────────────────────── */
  const testiTrack = document.getElementById('testiTrack');
  const dots       = document.querySelectorAll('.dot');
  let   currentSlide  = 0;
  let   autoSlideTimer = null;
  let   isMobile = false;

  const getCardCount = () => document.querySelectorAll('.testi-card').length;

  const goToSlide = (idx) => {
    if (!isMobile) return;
    const cards = document.querySelectorAll('.testi-card');
    currentSlide = (idx + getCardCount()) % getCardCount();

    testiTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  };

  const setupSlider = () => {
    const mobile = window.innerWidth < 900;
    if (mobile === isMobile) return;
    isMobile = mobile;

    if (mobile) {
      testiTrack.style.display = 'flex';
      testiTrack.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
      document.querySelectorAll('.testi-card').forEach(c => {
        c.style.minWidth = '100%';
        c.style.flexShrink = '0';
      });
      goToSlide(0);
      startAutoSlide();
    } else {
      testiTrack.style.display = 'grid';
      testiTrack.style.transform = '';
      document.querySelectorAll('.testi-card').forEach(c => {
        c.style.minWidth = '';
      });
      stopAutoSlide();
    }
  };

  const startAutoSlide = () => {
    stopAutoSlide();
    autoSlideTimer = setInterval(() => goToSlide(currentSlide + 1), 4000);
  };
  const stopAutoSlide = () => {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
  };

  // Dot navigation
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.getAttribute('data-idx')));
      startAutoSlide(); // reset auto timer
    });
  });

  // Swipe support for mobile testimonials
  let touchStartX = 0;
  testiTrack.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
    stopAutoSlide();
  }, { passive: true });

  testiTrack.addEventListener('touchend', e => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 40) {
      goToSlide(currentSlide + (deltaX < 0 ? 1 : -1));
    }
    startAutoSlide();
  }, { passive: true });

  setupSlider();
  window.addEventListener('resize', setupSlider);


  /* ─────────────────────────────────────────
     8. CONTACT FORM — Feedback & Validation
  ───────────────────────────────────────── */
  const sendBtn = document.getElementById('sendBtn');

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      // Gather form inputs
      const form    = sendBtn.closest('.contact-form');
      const inputs  = form.querySelectorAll('.form-input');
      let   valid   = true;

      inputs.forEach(input => {
        if (!input.value.trim()) {
          valid = false;
          // Flash border red
          input.style.borderColor = '#E76F51';
          input.addEventListener('input', () => {
            input.style.borderColor = '';
          }, { once: true });
        }
      });

      if (!valid) {
        // Shake animation
        sendBtn.style.animation = 'none';
        sendBtn.offsetHeight; // reflow
        sendBtn.style.animation = 'shake 0.4s ease';
        setTimeout(() => sendBtn.style.animation = '', 400);
        return;
      }

      // Success state
      const originalHTML = sendBtn.innerHTML;
      sendBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Pesan Terkirim!</span>
      `;
      sendBtn.style.background = '#27AE60';
      sendBtn.disabled = true;

      // Reset after 3.5 seconds
      setTimeout(() => {
        sendBtn.innerHTML = originalHTML;
        sendBtn.style.background = '';
        sendBtn.disabled = false;
        inputs.forEach(inp => inp.value = '');
      }, 3500);
    });
  }

  // Add shake keyframe dynamically
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(shakeStyle);


  /* ─────────────────────────────────────────
     9. NAV LINK ACTIVE on CLICK (immediate)
  ───────────────────────────────────────── */
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });


  /* ─────────────────────────────────────────
     10. HERO — Immediate visibility
  ───────────────────────────────────────── */
  // Hero elements animate in on page load
  setTimeout(() => {
    document.querySelectorAll('.hero .fade-in').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 150);
    });
  }, 100);


  /* ─────────────────────────────────────────
     11. CURSOR GLOW (subtle, desktop only)
  ───────────────────────────────────────── */
  if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed;
      width: 300px; height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(47,111,79,0.06) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
      transform: translate(-50%,-50%);
      transition: transform 0.08s linear;
      will-change: transform;
    `;
    document.body.appendChild(glow);

    document.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    }, { passive: true });
  }


  /* ─────────────────────────────────────────
     12. SERVICE CARDS — Icon color transition fix
         (CSS handles it but we ensure SVG paths work)
  ───────────────────────────────────────── */
  document.querySelectorAll('.service-card').forEach(card => {
    const icon = card.querySelector('.service-icon');
    card.addEventListener('mouseenter', () => {
      icon.querySelectorAll('path, circle, rect, ellipse').forEach(el => {
        if (el.getAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
          el.setAttribute('data-orig-stroke', el.getAttribute('stroke'));
          el.setAttribute('stroke', 'white');
        }
        if (el.getAttribute('fill') && !['none','white','#FDDCB5'].includes(el.getAttribute('fill'))) {
          el.setAttribute('data-orig-fill', el.getAttribute('fill'));
          el.setAttribute('fill', 'rgba(255,255,255,0.7)');
        }
      });
    });
    card.addEventListener('mouseleave', () => {
      icon.querySelectorAll('path, circle, rect, ellipse').forEach(el => {
        if (el.getAttribute('data-orig-stroke')) {
          el.setAttribute('stroke', el.getAttribute('data-orig-stroke'));
        }
        if (el.getAttribute('data-orig-fill')) {
          el.setAttribute('fill', el.getAttribute('data-orig-fill'));
        }
      });
    });
  });

  console.log('%c✦ Iksbal Portfolio — Loaded Successfully', 'color:#2F6F4F;font-weight:bold;font-size:14px;');
});
