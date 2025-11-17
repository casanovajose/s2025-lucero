// Menú lateral (desktop): scroll suave y item activo según sección visible
(function () {
  const menuLateral = document.querySelector('.side-nav');
  const enlacesMenu = Array.from(document.querySelectorAll('.side-nav a'));
  const secciones = Array.from(document.querySelectorAll('section[id][data-section-title]'));

  // Scroll suave al hacer click en el menú lateral
  enlacesMenu.forEach((enlace) => {
    enlace.addEventListener('click', (evento) => {
      const destinoHref = enlace.getAttribute('href');
      if (!destinoHref || !destinoHref.startsWith('#')) return;

      evento.preventDefault();
      const destino = document.querySelector(destinoHref);
      if (destino) {
        destino.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  // Marca cuál enlace está activo
  const marcarActivo = (idSeccion) => {
    enlacesMenu.forEach((enlace) => {
      const href = enlace.getAttribute('href');
      enlace.classList.toggle('active', href === '#' + idSeccion);
    });
  };

  const observador = new IntersectionObserver(
    (entradas) => {
      // Si el usuario está pasando el mouse por el menú, dejamos que actúe el hover
      if (menuLateral && menuLateral.matches(':hover')) return;

      // elegimos la sección con mayor intersectionRatio entre las que entran
      let masVisible = null;

      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        if (!masVisible || entrada.intersectionRatio > masVisible.intersectionRatio) {
          masVisible = entrada;
        }
      });

      if (masVisible) {
        marcarActivo(masVisible.target.id);
      }
    },
    {
      root: null,
      rootMargin: '0px 0px -40% 0px',
      threshold: 0.35,
    }
  );

  secciones.forEach((seccion) => observador.observe(seccion));

  const primeraSeccion = secciones[0];
  if (primeraSeccion) marcarActivo(primeraSeccion.id);
})();

// Navbar móvil: scroll suave y botón activo según sección visible
(function () {
  const navMovil = document.querySelector('.mobile-nav');
  if (!navMovil) return;

  navMovil.addEventListener('click', (evento) => {
    const boton = evento.target.closest('button[data-target]');
    if (!boton) return;

    const selector = boton.getAttribute('data-target');
    const destino = document.querySelector(selector);
    if (destino) {
      destino.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  });

  const secciones = document.querySelectorAll('section[id]');
  const botones = Array.from(navMovil.querySelectorAll('button[data-target]'));

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          const id = '#' + entrada.target.id;
          botones.forEach((boton) => {
            const coincide = boton.getAttribute('data-target') === id;
            if (coincide) {
              boton.setAttribute('aria-current', 'true');
            } else {
              boton.removeAttribute('aria-current');
            }
          });
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -45% 0px',
      threshold: 0.35,
    }
  );

  secciones.forEach((seccion) => observador.observe(seccion));
})();

// Sliders: sincronizar los dots con el radio seleccionado
(function () {
  const gruposSliders = ['obra', 'ph', 'music', 'anim'];

  gruposSliders.forEach((nombre) => {
    const radios = Array.from(
      document.querySelectorAll(`input[type="radio"][name="${nombre}"]`)
    );
    if (radios.length === 0) return;

    const slider = radios[0].closest('.slider');
    if (!slider) return;

    const todosDots = Array.from(
      slider.parentElement.querySelectorAll('.dots .dot')
    );
    const dots = todosDots.filter((dot) => {
      const atributoFor = dot.getAttribute('for') || '';
      return atributoFor.startsWith(nombre + '-');
    });

    const actualizarDots = () => {
      const radioSeleccionado = radios.find((r) => r.checked);
      if (!radioSeleccionado) return;

      const idSeleccionado = radioSeleccionado.id;
      dots.forEach((dot) => {
        const esActual = dot.getAttribute('for') === idSeleccionado;
        dot.setAttribute('aria-current', esActual ? 'true' : 'false');
      });
    };

    radios.forEach((radio) =>
      radio.addEventListener('change', actualizarDots)
    );

    const labels = Array.from(slider.querySelectorAll('label[for]')); // flechas + dots
    labels.forEach((label) =>
      label.addEventListener('click', () => {
        // se espera al próximo tick para que el radio cambie primero
        setTimeout(actualizarDots, 0);
      })
    );

    actualizarDots();
  });
})();

// Lightbox para la sección Fotos
(function () {
  const fotosSection = document.getElementById('fotos');
  const lightbox = document.getElementById('lightbox');
  if (!fotosSection || !lightbox) return;

  const imgViewer = lightbox.querySelector('.lightbox__img');
  const closeBtn = lightbox.querySelector('.lightbox__close');

  const abrir = (src, alt) => {
    imgViewer.src = src;
    imgViewer.alt = alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const cerrar = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    imgViewer.src = '';
    document.body.style.overflow = '';
  };

  // Click en cualquier imagen dentro de #fotos
  fotosSection.addEventListener('click', (ev) => {
    const img = ev.target.closest('img');
    if (!img || !fotosSection.contains(img)) return;
    abrir(img.src, img.alt);
  });

  closeBtn.addEventListener('click', cerrar);

  // Cerrar haciendo click fuera de la imagen
  lightbox.addEventListener('click', (ev) => {
    if (ev.target === lightbox) {
      cerrar();
    }
  });

  // Cerrar con Esc
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && lightbox.classList.contains('is-open')) {
      cerrar();
    }
  });
})();
