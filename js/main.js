/* =====================================================
   PORTFÓLIO — VITOR GABRIEL VIDO
   Arquivo: js/main.js
   Descrição: Todos os comportamentos interativos da página
   ===================================================== */

/* -------------------------------------------------------
   Aguarda o DOM carregar completamente antes de executar
------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {


  /* =====================================================
     1. CURSOR CUSTOMIZADO (apenas desktop)
     Ponto âmbar que segue o mouse instantaneamente +
     anel com movimento suavizado via lerp (interpolação)
     ===================================================== */

  const cursorDot  = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  // Só ativa cursor customizado em dispositivos com hover real
  // (evita comportamento estranho em touch screens)
  const hasHover = window.matchMedia('(hover: hover)').matches;

  if (hasHover && cursorDot && cursorRing) {

    let mouseX = 0, mouseY = 0; // posição atual do mouse
    let ringX  = 0, ringY  = 0; // posição atual do anel (atrasada)

    // Atualiza posição do mouse e move o ponto instantaneamente
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top  = mouseY + 'px';
    });

    // Loop de animação: move o anel com lerp (suavidade)
    // Lerp: posição atual + (destino - atual) * fator
    // Quanto menor o fator (0.15), mais lento e suave
    function animateRing() {
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;

      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top  = ringY + 'px';

      requestAnimationFrame(animateRing); // repete a cada frame
    }
    animateRing();

    // Expande o anel ao passar sobre elementos clicáveis
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorRing.style.width       = '48px';
        cursorRing.style.height      = '48px';
        cursorRing.style.borderColor = 'rgba(240, 165, 0, 0.75)';
      });
      el.addEventListener('mouseleave', () => {
        cursorRing.style.width       = '30px';
        cursorRing.style.height      = '30px';
        cursorRing.style.borderColor = 'rgba(240, 165, 0, 0.45)';
      });
    });
  }


  /* =====================================================
     2. HEADER — efeito vidro fosco ao scroll
     Adiciona a classe .scrolled quando passa de 60px
     ===================================================== */

  const header = document.getElementById('header');

  if (header) {
    // passive: true melhora performance de scroll no mobile
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }


  /* =====================================================
     3. MENU MOBILE — abertura e fechamento
     Controla o slide do painel lateral e o overlay
     ===================================================== */

  const hamburger    = document.getElementById('hamburger');
  const mobileNav    = document.getElementById('mobileNav');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileNavClose = document.getElementById('mobileNavClose');
  const mobileLinks  = document.querySelectorAll('.mobile-link');

  // Abre o menu mobile
  function openMenu() {
    mobileNav.classList.add('open');
    mobileOverlay.classList.add('active');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // trava scroll do body
  }

  // Fecha o menu mobile
  function closeMenu() {
    mobileNav.classList.remove('open');
    mobileOverlay.classList.remove('active');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = ''; // restaura scroll
  }

  if (hamburger) hamburger.addEventListener('click', openMenu);
  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);

  // Fecha menu ao clicar em qualquer link interno
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Fecha menu ao pressionar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });


  /* =====================================================
     4. REVEAL AO SCROLL — IntersectionObserver
     Elementos com classe .reveal aparecem ao entrar
     na viewport com um efeito de fade + slide para cima
     ===================================================== */

  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Delay escalonado: cada elemento atrasa um pouco mais
        // Cria efeito de "cascata" quando vários entram juntos
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 75);

        // Para de observar depois de animar (anima só uma vez)
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,               // 10% do elemento visível já dispara
    rootMargin: '0px 0px -40px 0px' // antecipa um pouco o trigger
  });

  revealEls.forEach(el => revealObserver.observe(el));


  /* =====================================================
     5. TABS DE SERVIÇOS — navegação por categoria
     Troca o conteúdo exibido conforme a aba ativa
     ===================================================== */

  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab; // ex: "estaticos", "lojas"

      // Remove .active de todos os botões e painéis
      tabBtns.forEach(b   => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      // Ativa o botão clicado e o painel correspondente
      btn.classList.add('active');

      const targetPanel = document.getElementById('tab-' + targetTab);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });


  /* =====================================================
     6. SMOOTH SCROLL — links de âncora internos
     Compensa a altura do header fixo para não cobrir
     o início da seção ao rolar
     ===================================================== */

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetSelector = link.getAttribute('href');
      if (!targetSelector || targetSelector === '#') return;

      const target = document.querySelector(targetSelector);
      if (!target) return;

      e.preventDefault();

      // Calcula posição descontando a altura do header
      const headerH  = header ? header.offsetHeight : 70;
      const targetTop = target.getBoundingClientRect().top
                        + window.scrollY
                        - headerH
                        - 16; // pequena margem extra

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });


  /* =====================================================
     7. NAV ATIVA — destaca o link da seção atual
     Adiciona a classe .active ao link correspondente
     à seção visível durante o scroll
     ===================================================== */

  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.desktop-nav a');

  function highlightNav() {
    const scrollPos = window.scrollY + 100; // offset do header

    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < bottom) {
        // Remove active de todos, adiciona no link atual
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.desktop-nav a[href="#${id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });

  // Estilo do link ativo — injetado dinamicamente
  // (evita adicionar regra no CSS que poderia conflitar)
  const activeStyle = document.createElement('style');
  activeStyle.textContent = `
    .desktop-nav a.active {
      color: var(--text-primary);
    }
    .desktop-nav a.active::after {
      width: 100% !important;
    }
  `;
  document.head.appendChild(activeStyle);


}); // fim do DOMContentLoaded