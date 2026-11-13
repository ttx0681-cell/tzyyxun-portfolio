// Mobile navigation: keep the button's accessible state in sync with the menu.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const navLinks = [...navigation.querySelectorAll('a')];

function closeMenu() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
}

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
navLinks.forEach(link => link.addEventListener('click', () => {
  setActiveSection(link.hash);
  closeMenu();
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 641px)').addEventListener('change', closeMenu);

// Track section positions, including short sections at the bottom of the page.
const sections = [...document.querySelectorAll('main > section')];
const header = document.querySelector('.site-header');
function setActiveSection(hash) {
  navLinks.forEach(link => {
    if (link.hash === hash) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}
function updateActiveSection() {
  const readingLine = header.getBoundingClientRect().height + 80;
  let currentSection = sections[0];
  sections.forEach(section => {
    if (section.getBoundingClientRect().top <= readingLine) currentSection = section;
  });
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    currentSection = sections[sections.length - 1];
  }
  setActiveSection(`#${currentSection.id}`);
}
// Limit scroll measurements to one per animation frame.
let navigationFramePending = false;
function scheduleNavigationUpdate() {
  if (navigationFramePending) return;
  navigationFramePending = true;
  window.requestAnimationFrame(() => {
    updateActiveSection();
    navigationFramePending = false;
  });
}
window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true });
window.addEventListener('resize', scheduleNavigationUpdate);
window.addEventListener('hashchange', scheduleNavigationUpdate);
window.addEventListener('load', scheduleNavigationUpdate);
updateActiveSection();

// Selected Projects: a separate native dialog, independent of the artwork album.
const projects = [
  { title: 'Pawfect Match', category: 'UI/UX Design', image: 'Artwork-UIUX Design.png', imageAlt: 'Pawfect Match app screens with watercolor cat illustrations' },
  { title: 'My Hero', category: 'Documentary Film', image: 'Artwork-MyHero.png', imageAlt: 'My Hero documentary film cover' },
  { title: 'Core Decay & Regeneration', category: 'Projection Mapping', image: 'Artwork-Projection Mapping.png', imageAlt: 'Illuminated projection mapping cube displaying food waste visuals' },
  { title: 'Character Design', category: 'Digital Illustration', image: 'Artwork-Character Design.jpg', imageAlt: 'Character design illustration exploring dynamic poses' },
  { title: 'Typography Design', category: 'Graphic Design', image: 'Artwork-Typography.png', imageAlt: 'Bodoni typeface study and typography composition' }
];
const projectDialog = document.querySelector('#project-dialog');
const projectClose = projectDialog.querySelector('.dialog-close');
let projectTrigger = null;
let projectScrollState = null;
document.querySelectorAll('#projects [data-project]').forEach(card => {
  card.addEventListener('click', () => {
    if (projectDialog.open) return;
    const index = Number(card.dataset.project);
    if (index === 0) { openPawfectStudy(card); return; }
    const project = projects[index];
    projectDialog.classList.toggle('hero-journal', index === 1);
    projectDialog.setAttribute('aria-labelledby', index === 1 ? 'hero-title' : 'dialog-title');
    projectDialog.querySelector('.project-dialog-label').textContent = index === 1 ? 'PROJECT JOURNAL / 02' : 'PROJECT JOURNAL';
    projectTrigger = card;
    projectDialog.querySelector('#dialog-title').textContent = project.title;
    projectDialog.querySelector('#dialog-number').textContent = String(index + 1).padStart(2, '0');
    projectDialog.querySelector('#dialog-category').textContent = project.category;
    const cover = projectDialog.querySelector('#dialog-cover');
    cover.src = project.image;
    cover.alt = project.imageAlt;
    projectScrollState = {
      x: window.scrollX, y: window.scrollY,
      position: document.body.style.position, top: document.body.style.top,
      width: document.body.style.width, overflow: document.documentElement.style.overflow
    };
    projectDialog.showModal();
    document.body.style.position = 'fixed';
    document.body.style.top = `-${projectScrollState.y}px`;
    document.body.style.width = '100%';
    document.documentElement.style.overflow = 'hidden';
    projectDialog.scrollTop = 0;
    projectClose.focus({ preventScroll: true });
  });
});
function restoreProjectPage() {
  if (!projectScrollState) return;
  document.body.style.position = projectScrollState.position;
  document.body.style.top = projectScrollState.top;
  document.body.style.width = projectScrollState.width;
  document.documentElement.style.overflow = projectScrollState.overflow;
  window.scrollTo({ left: projectScrollState.x, top: projectScrollState.y, behavior: 'instant' });
  projectTrigger?.focus({ preventScroll: true });
  projectScrollState = null;
}
function closeProjectDialog() {
  projectDialog.querySelector('.hero-video')?.pause();
  projectDialog.close();
  restoreProjectPage();
}
projectClose.addEventListener('click', closeProjectDialog);
projectDialog.addEventListener('cancel', event => {
  event.preventDefault();
  closeProjectDialog();
});
// The native dialog makes the rest of the page inert.
// Explicitly wrap Tab, including when future case study links are added.
projectDialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const focusable = [...projectDialog.querySelectorAll('button, a[href], input, select, textarea, video[controls], [tabindex]')]
    .filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === projectDialog)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === projectDialog)) {
    event.preventDefault();
    first.focus();
  }
});
function isOutsideProjectDialog(event) {
  const bounds = projectDialog.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom;
}
let projectBackdropPress = false;
projectDialog.addEventListener('pointerdown', event => {
  projectBackdropPress = event.target === projectDialog && isOutsideProjectDialog(event);
});
projectDialog.addEventListener('pointercancel', () => { projectBackdropPress = false; });
projectDialog.addEventListener('click', event => {
  if (projectBackdropPress && event.target === projectDialog && isOutsideProjectDialog(event)) closeProjectDialog();
  projectBackdropPress = false;
});
projectDialog.addEventListener('close', () => {
  // Ignore a queued close event if another project has already opened.
  if (!projectDialog.open) restoreProjectPage();
});
document.querySelector('#year').textContent = new Date().getFullYear();

// About scrapbook: independent disclosure buttons, with at most one page open.
const scrapbookCards = [...document.querySelectorAll('#about .scrapbook-card')];
scrapbookCards.forEach(card => {
  card.addEventListener('click', () => {
    const shouldOpen = card.getAttribute('aria-expanded') !== 'true';
    scrapbookCards.forEach(otherCard => {
      const isOpen = otherCard === card && shouldOpen;
      const panel = document.getElementById(otherCard.getAttribute('aria-controls'));
      otherCard.setAttribute('aria-expanded', String(isOpen));
      panel.classList.toggle('is-open', isOpen);
      panel.inert = !isOpen;
      otherCard.querySelector('.scrapbook-card-action').firstChild.textContent = isOpen ? 'Close page ' : 'Open page ';
    });
  });
});
// About Polaroids: native buttons support pointer, touch, Enter, and Space.
const scrapbookCollage = document.querySelector('#about .scrapbook-collage');
const scrapbookPhotoButtons = [...document.querySelectorAll('#about .scrapbook-photo-button')];
scrapbookPhotoButtons.forEach(button => {
  button.addEventListener('click', () => {
    scrapbookCollage.classList.toggle('artwork-in-front', button.closest('.scrapbook-artwork') !== null);
    scrapbookPhotoButtons.forEach(photoButton => {
      photoButton.setAttribute('aria-pressed', String(photoButton === button));
    });
    if (button.closest('.scrapbook-artwork')) openArtworkGallery();
  });
});

// Original artwork files, relative to index.html, in the album's display order.
const artworks = [
  { image: 'Artwork-MyHero.png', title: 'My Hero', category: 'Short Film · Visual Storytelling' },
  { image: 'Artwork-Character Design.jpg', title: 'Dynamic Poses', category: 'Character Design · Digital Illustration' },
  { image: 'Artwork-Typography.png', title: 'Bodoni — Typeface Study', category: 'Typography · Graphic Design' },
  { image: 'Artwork-UIUX Design.png', title: 'Pawfect Match', category: 'UI/UX Design · Mobile App' },
  { image: 'Artwork-Projection Mapping.png', title: 'Core Decay & Regeneration', category: 'Projection Mapping · Motion Graphics' }
];
const artworkGallery = document.querySelector('#artwork-gallery');
const artworkTrigger = document.querySelector('.scrapbook-artwork .scrapbook-photo-button');
const artworkStage = document.querySelector('.artwork-gallery-stage');
const artworkTrack = document.querySelector('.artwork-gallery-track');
const artworkDots = document.querySelector('.artwork-gallery-dots');
const reducedArtworkMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const artworkClose = document.querySelector('.artwork-gallery-close');
let artworkIndex = 0;
let galleryScrollState;
let artworkAnimation = null;
let artworkDrag = null;

const artworkCaption = document.querySelector('.artwork-gallery-caption');
const artworkCaptionStage = document.createElement('div');
artworkCaptionStage.className = 'artwork-gallery-caption-stage';
const artworkCaptionTrack = document.createElement('div');
artworkCaptionTrack.className = 'artwork-gallery-caption-track';
artworkCaptionStage.append(artworkCaptionTrack);
const captionFields = ['title', 'category', 'counter', 'year', 'description'];
const captionTemplate = captionFields.map(field => document.querySelector(`#artwork-gallery-${field}`));
const artworkCaptionSlides = artworks.map((artwork, index) => {
  const slide = document.createElement('div');
  slide.className = 'artwork-gallery-caption-slide';
  captionTemplate.forEach(template => {
    const element = template.cloneNode(true);
    const field = element.id.replace('artwork-gallery-', '');
    element.className = element.id;
    element.removeAttribute('id');
    const value = field === 'counter'
      ? `${String(index + 1).padStart(2, '0')} / ${String(artworks.length).padStart(2, '0')}`
      : String(artwork[field] ?? '').trim();
    element.textContent = value;
    element.hidden = !value;
    slide.append(element);
  });
  return slide;
});
captionTemplate.forEach(element => element.remove());
artworkCaption.prepend(artworkCaptionStage);

// Decode once and retain the exact image nodes throughout navigation.
const artworkSlides = artworks.map(artwork => {
  const slide = document.createElement('div');
  slide.className = 'artwork-gallery-slide';
  const image = new Image();
  image.alt = artwork.title;
  image.draggable = false;
  image.src = artwork.image;
  slide.append(image);
  return slide;
});
let artworkReady = false;
let artworkOpening = false;
let artworkNavigationBusy = false;
let artworkSession = 0;
let artworkCaptionAnimation = null;
let artworkPreparation = null;
function prepareArtwork() {
  if (!artworkPreparation) {
    artworkPreparation = Promise.all(artworkSlides.map(async slide => {
      const image = slide.firstElementChild;
      await image.decode();
      if (!image.naturalWidth) throw new Error(`Unable to load ${image.getAttribute('src')}`);
    })).then(() => { artworkReady = true; }).catch(error => {
      artworkPreparation = null;
      throw error;
    });
  }
  return artworkPreparation;
}
// Warm the cache before the first open, without unhandled load failures.
prepareArtwork().catch(error => console.error('Artwork gallery:', error));

function renderArtwork(incomingIndex = null, direction = 0) {
  const previous = (artworkIndex - 1 + artworks.length) % artworks.length;
  const next = (artworkIndex + 1) % artworks.length;
  const order = [previous, artworkIndex, next];
  if (incomingIndex !== null && direction) order[direction < 0 ? 0 : 2] = incomingIndex;
  if (order[0] === order[2]) {
    order[direction < 0 ? 2 : 0] = artworks.findIndex((_, index) => !order.includes(index));
  }
  // All five caption notes stay in the sizing grid, so even the longest title
  // reserves its space at every viewport width. Only three slots can be reached.
  artworks.forEach((_, index) => { if (!order.includes(index)) order.push(index); });
  order.forEach((index, slot) => {
    artworkSlides[index].setAttribute('aria-hidden', String(slot !== 1));
    artworkCaptionSlides[index].setAttribute('aria-hidden', String(slot !== 1));
  });
  artworkTrack.replaceChildren(...order.map(index => artworkSlides[index]));
  artworkCaptionTrack.replaceChildren(...order.map(index => artworkCaptionSlides[index]));
  artworkTrack.style.transform = 'translateX(-100%)';
  artworkCaptionTrack.style.transform = 'translateX(-100%)';
  [...artworkDots.children].forEach((dot, index) => {
    dot.setAttribute('aria-pressed', String(index === artworkIndex));
  });
}
async function openArtworkGallery() {
  if (artworkGallery.open || artworkOpening || !artworks.length) return;
  artworkOpening = true;
  try {
    await prepareArtwork();
    artworkIndex = 0;
    artworkDots.replaceChildren(...artworks.map((artwork, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `View artwork ${index + 1}: ${artwork.title}`);
      dot.addEventListener('click', () => navigateArtwork(index - artworkIndex));
      return dot;
    }));
    renderArtwork();
    galleryScrollState = {
      x: window.scrollX, y: window.scrollY,
      position: document.body.style.position, top: document.body.style.top,
      width: document.body.style.width, overflow: document.documentElement.style.overflow
    };
    document.body.style.position = 'fixed';
    document.body.style.top = `-${galleryScrollState.y}px`;
    document.body.style.width = '100%';
    document.documentElement.style.overflow = 'hidden';
    artworkSession++;
    artworkGallery.showModal();
    artworkClose.focus();
  } catch (error) {
    console.error('Artwork gallery could not open:', error);
  } finally {
    artworkOpening = false;
  }
}
function navigateArtwork(direction, dragOffset = 0) {
  if (!artworkGallery.open || !artworkReady || artworkNavigationBusy || artworkDrag || artworks.length < 2) return;
  if (!direction && !dragOffset) return;
  artworkNavigationBusy = true;
  const session = artworkSession;
  const nextIndex = (artworkIndex + direction + artworks.length) % artworks.length;
  const sign = Math.sign(direction);
  // A direct dot jump reuses the decoded destination in the adjacent slot.
  // Leave an in-progress drag's transform intact while arranging those nodes.
  renderArtwork(nextIndex, sign);
  artworkTrack.style.transform = `translateX(calc(-100% + ${dragOffset}px))`;
  const captionOffset = artworkStage.clientWidth
    ? dragOffset / artworkStage.clientWidth * artworkCaptionStage.clientWidth : 0;
  artworkCaptionTrack.style.transform = `translateX(calc(-100% + ${captionOffset}px))`;
  const finish = () => {
    if (session !== artworkSession || !artworkGallery.open) return;
    artworkIndex = nextIndex;
    // Recenter the same decoded nodes and remove animation overrides in one task.
    renderArtwork();
    if (artworkAnimation) artworkAnimation.cancel();
    if (artworkCaptionAnimation) artworkCaptionAnimation.cancel();
    artworkAnimation = null;
    artworkCaptionAnimation = null;
    artworkNavigationBusy = false;
  };
  if (reducedArtworkMotion.matches) { finish(); return; }
  const timing = { duration: 300, easing: 'cubic-bezier(.22,.7,.25,1)', fill: 'forwards' };
  const frames = offset => [
    { transform: `translateX(calc(-100% + ${offset}px))` },
    { transform: `translateX(${-100 - sign * 100}%)` }
  ];
  artworkAnimation = artworkTrack.animate(frames(dragOffset), timing);
  artworkCaptionAnimation = artworkCaptionTrack.animate(frames(captionOffset), timing);
  const startTime = document.timeline.currentTime;
  artworkAnimation.startTime = startTime;
  artworkCaptionAnimation.startTime = startTime;
  Promise.all([artworkAnimation.finished, artworkCaptionAnimation.finished]).then(finish).catch(() => {
    // Closing the modal cancels both animations and invalidates this session.
  });
}

artworkStage.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0 || !artworkReady || artworkNavigationBusy || artworks.length < 2) return;
  artworkDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, offset: 0, horizontal: false };
  artworkStage.setPointerCapture(event.pointerId);
});
artworkStage.addEventListener('pointermove', event => {
  if (!artworkDrag || event.pointerId !== artworkDrag.id) return;
  const dx = event.clientX - artworkDrag.x;
  const dy = event.clientY - artworkDrag.y;
  if (!artworkDrag.horizontal) {
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { endArtworkDrag(true); return; }
    if (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy)) return;
    artworkDrag.horizontal = true;
    artworkStage.classList.add('is-dragging');
  }
  artworkDrag.offset = Math.max(-artworkStage.clientWidth, Math.min(artworkStage.clientWidth, dx));
  artworkTrack.style.transform = `translateX(calc(-100% + ${artworkDrag.offset}px))`;
  const captionOffset = artworkDrag.offset / artworkStage.clientWidth * artworkCaptionStage.clientWidth;
  artworkCaptionTrack.style.transform = `translateX(calc(-100% + ${captionOffset}px))`;
});
function endArtworkDrag(cancelled = false) {
  if (!artworkDrag) return;
  const drag = artworkDrag;
  artworkDrag = null;
  artworkStage.classList.remove('is-dragging');
  if (artworkStage.hasPointerCapture(drag.id)) artworkStage.releasePointerCapture(drag.id);
  const threshold = Math.max(40, Math.min(90, artworkStage.clientWidth * .16));
  const direction = !cancelled && drag.horizontal && Math.abs(drag.offset) >= threshold ? (drag.offset < 0 ? 1 : -1) : 0;
  if (drag.horizontal) navigateArtwork(direction, drag.offset);
}
artworkStage.addEventListener('pointerup', () => endArtworkDrag());
artworkStage.addEventListener('pointercancel', () => endArtworkDrag(true));
artworkStage.addEventListener('lostpointercapture', () => endArtworkDrag(true));
artworkStage.addEventListener('dragstart', event => event.preventDefault());
document.querySelector('#artwork-gallery-prev').addEventListener('click', () => navigateArtwork(-1));
document.querySelector('#artwork-gallery-next').addEventListener('click', () => navigateArtwork(1));
artworkClose.addEventListener('click', () => artworkGallery.close());
artworkGallery.addEventListener('cancel', event => {
  event.preventDefault();
  artworkGallery.close();
});
artworkGallery.addEventListener('close', () => {
  artworkSession++;
  artworkNavigationBusy = false;
  if (artworkCaptionAnimation) artworkCaptionAnimation.cancel();
  artworkCaptionAnimation = null;
  artworkDrag = null;
  artworkStage.classList.remove('is-dragging');
  if (artworkAnimation) artworkAnimation.cancel();
  artworkAnimation = null;
  document.body.style.position = galleryScrollState.position;
  document.body.style.top = galleryScrollState.top;
  document.body.style.width = galleryScrollState.width;
  document.documentElement.style.overflow = galleryScrollState.overflow;
  window.scrollTo({ left: galleryScrollState.x, top: galleryScrollState.y, behavior: 'instant' });
  artworkTrigger.focus({ preventScroll: true });
});
// Require both ends of the pointer gesture to be on the backdrop.
let artworkBackdropPressed = false;
artworkGallery.addEventListener('pointerdown', event => {
  artworkBackdropPressed = event.target === artworkGallery;
});
artworkGallery.addEventListener('click', event => {
  if (artworkBackdropPressed && event.target === artworkGallery) artworkGallery.close();
  artworkBackdropPressed = false;
});
artworkGallery.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    navigateArtwork(event.key === 'ArrowLeft' ? -1 : 1);
  }
  if (event.key === 'Tab') {
    const controls = [...artworkGallery.querySelectorAll('button:not(:disabled)')];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }
});

// Nested experience timeline: independent from the main About disclosures.
const experienceToggles = [...document.querySelectorAll('#experience-panel .experience-toggle')];
experienceToggles.forEach(toggle => {
  toggle.addEventListener('click', () => {
    const shouldExpand = toggle.getAttribute('aria-expanded') !== 'true';
    experienceToggles.forEach(otherToggle => {
      const expanded = otherToggle === toggle && shouldExpand;
      const detail = document.getElementById(otherToggle.getAttribute('aria-controls'));
      otherToggle.setAttribute('aria-expanded', String(expanded));
      otherToggle.closest('.experience-entry').classList.toggle('is-expanded', expanded);
      detail.inert = !expanded;
    });
  });
});

// Isolated Pawfect Match journal and nested image viewer.
const pawfectDialog = document.querySelector('#pawfect-dialog');
const pawfectViewer = document.querySelector('#pawfect-viewer');
let pawfectPageState = null;
let pawfectImageTrigger = null;
let pawfectImages = [];
let pawfectImageIndex = 0;
function openPawfectStudy(trigger) {
  if (pawfectDialog.open) return;
  pawfectPageState = { trigger, x:window.scrollX, y:window.scrollY, position:document.body.style.position, top:document.body.style.top, width:document.body.style.width, overflow:document.documentElement.style.overflow };
  pawfectDialog.showModal();
  document.body.style.position = 'fixed';
  document.body.style.top = `-${pawfectPageState.y}px`;
  document.body.style.width = '100%';
  document.documentElement.style.overflow = 'hidden';
  pawfectDialog.scrollTop = 0;
  pawfectDialog.querySelector('.pawfect-close').focus({preventScroll:true});
}
function closePawfectStudy() {
  if (pawfectViewer.open) pawfectViewer.close();
  pawfectDialog.close();
}
pawfectDialog.addEventListener('close', () => {
  if (pawfectDialog.open || !pawfectPageState) return;
  const state = pawfectPageState;
  pawfectPageState = null;
  document.body.style.position = state.position;
  document.body.style.top = state.top;
  document.body.style.width = state.width;
  document.documentElement.style.overflow = state.overflow;
  window.scrollTo({left:state.x, top:state.y, behavior:'instant'});
  state.trigger.focus({preventScroll:true});
});
pawfectDialog.querySelector('.pawfect-close').addEventListener('click', closePawfectStudy);
pawfectDialog.addEventListener('cancel', event => { event.preventDefault(); closePawfectStudy(); });
function renderPawfectImage() {
  const source = pawfectImages[pawfectImageIndex];
  const image = pawfectViewer.querySelector('.pawfect-viewer-image');
  image.src = source.dataset.pawfectImage;
  image.alt = source.querySelector('img')?.alt || source.dataset.caption;
  pawfectViewer.querySelector('#pawfect-viewer-caption').textContent = `${source.dataset.caption} · ${pawfectImageIndex + 1} / ${pawfectImages.length}`;
  pawfectViewer.querySelectorAll('[data-direction]').forEach(button => { button.disabled = pawfectImages.length < 2; });
}
pawfectDialog.addEventListener('click', event => {
  const trigger = event.target.closest('[data-pawfect-image]');
  if (!trigger) return;
  pawfectImages = [...pawfectDialog.querySelectorAll('[data-pawfect-image]')];
  pawfectImageIndex = pawfectImages.indexOf(trigger);
  pawfectImageTrigger = trigger;
  renderPawfectImage();
  pawfectViewer.showModal();
  pawfectViewer.querySelector('.pawfect-close').focus({preventScroll:true});
});
function movePawfectImage(direction) {
  if (pawfectImages.length < 2) return;
  pawfectImageIndex = (pawfectImageIndex + direction + pawfectImages.length) % pawfectImages.length;
  renderPawfectImage();
}
pawfectViewer.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => movePawfectImage(Number(button.dataset.direction))));
pawfectViewer.querySelector('.pawfect-close').addEventListener('click', () => pawfectViewer.close());
pawfectViewer.addEventListener('cancel', event => { event.preventDefault(); event.stopPropagation(); pawfectViewer.close(); });
pawfectViewer.addEventListener('close', () => {
  if (!pawfectViewer.open && pawfectDialog.open) pawfectImageTrigger?.focus({preventScroll:true});
});
pawfectViewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault(); movePawfectImage(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
[pawfectDialog, pawfectViewer].forEach(dialog => {
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button, a[href], [tabindex]')].filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
      event.preventDefault(); first?.focus();
    }
  });
  let backdropPress = false;
  const outside = event => {
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  };
  dialog.addEventListener('pointerdown', event => { backdropPress = event.target === dialog && outside(event); });
  dialog.addEventListener('pointercancel', () => { backdropPress = false; });
  dialog.addEventListener('click', event => {
    if (backdropPress && event.target === dialog && outside(event)) {
      if (dialog === pawfectViewer) pawfectViewer.close(); else closePawfectStudy();
    }
    backdropPress = false;
  });
});
// Project 2 uses the existing project modal; the default content remains for Projects 3–5.
projectDialog.append(document.querySelector('#hero-template').content.cloneNode(true));
const heroViewer = document.querySelector('#hero-viewer');
const heroPages = [...projectDialog.querySelectorAll('[data-storyboard]')];
const heroStage = heroViewer.querySelector('.hero-viewer-stage');
const heroZoom = heroViewer.querySelector('.hero-zoom');
let heroPageIndex = 0;
let heroPageTrigger = null;
function renderHeroPage() {
  const page = heroPages[heroPageIndex];
  const image = heroStage.querySelector('img');
  image.src = page.dataset.storyboard;
  image.alt = page.querySelector('img').alt;
  heroViewer.querySelector('#hero-viewer-caption').textContent = `Storyboard / Page ${page.dataset.page} of 05`;
  heroStage.classList.remove('is-zoomed');
  heroStage.scrollTo(0, 0);
  heroZoom.setAttribute('aria-pressed', 'false');
  heroZoom.textContent = 'Zoom in';
}
projectDialog.addEventListener('click', event => {
  const page = event.target.closest('[data-storyboard]');
  if (!page) return;
  heroPageIndex = heroPages.indexOf(page);
  heroPageTrigger = page;
  renderHeroPage();
  heroViewer.showModal();
  heroViewer.querySelector('.hero-viewer-close').focus({preventScroll:true});
});
function moveHeroPage(direction) {
  heroPageIndex = (heroPageIndex + direction + heroPages.length) % heroPages.length;
  renderHeroPage();
}
heroViewer.querySelectorAll('[data-hero-direction]').forEach(button => button.addEventListener('click', () => moveHeroPage(Number(button.dataset.heroDirection))));
heroZoom.addEventListener('click', () => {
  const zoomed = heroStage.classList.toggle('is-zoomed');
  heroZoom.setAttribute('aria-pressed', String(zoomed));
  heroZoom.textContent = zoomed ? 'Fit page' : 'Zoom in';
});
heroViewer.querySelector('.hero-viewer-close').addEventListener('click', () => heroViewer.close());
heroViewer.addEventListener('cancel', event => { event.preventDefault(); event.stopPropagation(); heroViewer.close(); });
heroViewer.addEventListener('close', () => { if (!heroViewer.open && projectDialog.open) heroPageTrigger?.focus({preventScroll:true}); });
heroViewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    if (heroStage.classList.contains('is-zoomed') && document.activeElement === heroStage) return;
    event.preventDefault(); moveHeroPage(event.key === 'ArrowLeft' ? -1 : 1);
  }
  if (event.key !== 'Tab') return;
  const controls = [...heroViewer.querySelectorAll('button, [tabindex]')].filter(el => !el.disabled && el.tabIndex >= 0);
  const first = controls[0], last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
let heroBackdropPress = false;
function outsideHeroViewer(event) {
  const b = heroViewer.getBoundingClientRect();
  return event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom;
}
heroViewer.addEventListener('pointerdown', event => { heroBackdropPress = event.target === heroViewer && outsideHeroViewer(event); });
heroViewer.addEventListener('pointercancel', () => { heroBackdropPress = false; });
heroViewer.addEventListener('click', event => {
  if (heroBackdropPress && event.target === heroViewer && outsideHeroViewer(event)) heroViewer.close();
  heroBackdropPress = false;
});
projectDialog.addEventListener('close', () => {
  if (projectDialog.open) return;
  projectDialog.querySelector('.hero-video').pause();
  if (heroViewer.open) heroViewer.close();
});