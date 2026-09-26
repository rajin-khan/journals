const scene = document.getElementById('scene');
const book = document.getElementById('book');
const bookMotion = document.getElementById('bookMotion');
const sheetsHost = document.getElementById('sheets');
const coverButton = document.getElementById('coverButton');
const toggleButton = document.getElementById('toggleButton');
const lastPage = document.getElementById('lastPage');
const stickerLayer = document.getElementById('stickerLayer');
const viewportNotice = document.getElementById('viewportNotice');

// Short tangent panels give the two rounded free corners real cover thickness.
const cornerRadius = 23;
const cornerSteps = 8;
const cornerWidth = cornerRadius * Math.PI / (2 * cornerSteps) + 1;
for (const cover of document.querySelectorAll('.cover')) {
  for (const bottom of [false, true]) {
    for (let step = 0; step < cornerSteps; step++) {
      const angle = (step + .5) * 90 / cornerSteps + (bottom ? 90 : 0);
      const radians = angle * Math.PI / 180;
      const x = 310 - cornerRadius + cornerRadius * Math.sin(radians);
      const y = (bottom ? 542.5 - cornerRadius : cornerRadius) - cornerRadius * Math.cos(radians);
      const edge = document.createElement('span');
      edge.className = 'cover-edge edge-curve';
      edge.style.left = `${x - cornerWidth / 2}px`;
      edge.style.top = `${y - 3}px`;
      edge.style.width = `${cornerWidth}px`;
      edge.style.transform = `rotateZ(${angle}deg) rotateX(90deg)`;
      cover.prepend(edge);
    }
  }
}

// Continue the paper stack's top and bottom planes around the fore-edge corners.
const paperBlock = document.querySelector('.paper-block');
const paperRadius = 15;
const paperWidth = 296;
const paperHeight = 528.5;
const paperSegmentWidth = paperRadius * Math.PI / (2 * cornerSteps) + .7;
for (const bottom of [false, true]) {
  for (let step = 0; step < cornerSteps; step++) {
    const angle = (step + .5) * 90 / cornerSteps + (bottom ? 90 : 0);
    const radians = angle * Math.PI / 180;
    const x = paperWidth - paperRadius + paperRadius * Math.sin(radians);
    const y = (bottom ? paperHeight - paperRadius : paperRadius) - paperRadius * Math.cos(radians);
    const edge = document.createElement('span');
    edge.className = 'paper-block-curve';
    edge.style.left = `${x - paperSegmentWidth / 2}px`;
    edge.style.top = `${y - 20}px`;
    edge.style.width = `${paperSegmentWidth}px`;
    edge.style.transform = `translateZ(20px) rotateZ(${angle}deg) rotateX(90deg)`;
    paperBlock.append(edge);
  }
}

// The supplied layout maps a 1115 x 1953 pixel rectangle onto the 10 x 17.5 cm cover.
const STICKER_LAYOUT = [
  ['delulu', 310, 244, 381, 272],
  ['botanical-stamp', 1030, 244, 306, 210],
  ['sleeping-cat', 718, 308, 251, 252],
  ['another-point-of-view', 997, 515, 295, 157],
  ['computer-club', 364, 577, 277, 191],
  ['eyes', 701, 657, 155, 398],
  ['road', 925, 728, 408, 256],
  ['pantone-moon', 364, 835, 251, 303],
  ['goated', 356, 1206, 373, 231],
  ['garden', 1025, 1301, 290, 274],
  ['why-stop-now', 758, 1325, 257, 59],
  ['dream-again', 666, 1417, 355, 354],
  ['whimsy', 340, 1579, 286, 357],
  ['portrait', 1062, 1624, 242, 432],
  ['testing-code', 716, 1839, 281, 178],
  ['git-merge', 385, 1982, 251, 112],
];
const stickerScaleX = 310 / 1115;
const stickerScaleY = 542.5 / 1953;
for (const [name, x, y, width, height] of STICKER_LAYOUT) {
  const sticker = document.createElement('img');
  sticker.className = 'sticker';
  sticker.src = `./assets/stickers/${name}.png`;
  sticker.alt = '';
  sticker.decoding = 'async';
  sticker.draggable = false;
  sticker.style.left = `${(x - 269 - 2) * stickerScaleX}px`;
  sticker.style.top = `${(y - 193 - 2) * stickerScaleY}px`;
  sticker.style.width = `${(width + 4) * stickerScaleX}px`;
  sticker.style.height = `${(height + 4) * stickerScaleY}px`;
  stickerLayer.append(sticker);
}

// Fifty leaves make approximately one hundred writable faces.
const LEAVES = 50;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const wait = ms => new Promise(resolve => window.setTimeout(resolve, reducedMotion.matches ? 20 : ms));
let isOpen = false;
let busy = false;
let pendingAction = '';
let turned = 0;
let pointerStart = null;
let suppressClickUntil = 0;
const sheets = [];
const motion = {
  yaw: -27,
  hoverX: 0,
  hoverY: 0,
  targetX: 0,
  targetY: 0,
  hovered: false,
  dragging: false,
  pointerId: null,
  startX: 0,
  lastX: 0,
  moved: false,
  lastFrame: 0,
};

function renderMotion(time = performance.now()) {
  const breathe = reducedMotion.matches ? 0 : Math.sin(time / 2400);
  const lift = reducedMotion.matches ? 0 : Math.sin(time / 1700) * 3.5 - (motion.hovered ? 5 : 0);
  book.style.transform = `translateY(${lift.toFixed(3)}px) rotateX(${(13 + motion.hoverX + breathe * 1.2).toFixed(3)}deg) rotateY(${(motion.yaw + motion.hoverY).toFixed(3)}deg) rotateZ(${(-2.5 + breathe * .4).toFixed(3)}deg)`;
}

let motionFrame = 0;
function queueRest() {
  if (!motionFrame && !isOpen && !busy && !document.hidden && !reducedMotion.matches) motionFrame = requestAnimationFrame(animateRest);
}

function animateRest(time) {
  motionFrame = 0;
  if (isOpen || busy || document.hidden || reducedMotion.matches) return;
  const elapsed = motion.lastFrame ? Math.min(50, time - motion.lastFrame) : 16;
  motion.lastFrame = time;
  if (!motion.hovered && !motion.dragging) motion.yaw += elapsed * .006;
  const easing = Math.min(1, elapsed * .008);
  motion.hoverX += (motion.targetX - motion.hoverX) * easing;
  motion.hoverY += (motion.targetY - motion.hoverY) * easing;
  if (motion.yaw >= 333) motion.yaw -= 360;
  renderMotion(time);
  queueRest();
}

function settleFront() {
  const current = motion.yaw + motion.hoverY;
  const front = -27 + Math.round((current + 27) / 360) * 360;
  const duration = Math.min(1200, Math.max(250, Math.abs(front - current) * 6.5));
  scene.classList.remove('is-hovered', 'is-dragging');
  scene.classList.add('is-settling');
  book.style.setProperty('--settle-duration', `${duration}ms`);
  motion.hovered = false;
  motion.targetX = 0;
  motion.targetY = 0;
  motion.hoverX = 0;
  motion.hoverY = 0;
  motion.yaw = front;
  book.style.transform = `translateY(0px) rotateX(13deg) rotateY(${front}deg) rotateZ(-2.5deg)`;
  return duration;
}

const PAGE_HTML = `<div class="page-gutter"></div><div class="page-content" aria-hidden="true">
    <div class="page-head">
      <div class="page-codes"><div class="weather"><span>☼</span><span>☁</span><span class="rain-icon"></span></div><div class="weekdays">${['Mo','Tu','We','Th','Fr','Sa','Su'].map(day => `<span>${day}</span>`).join('')}</div></div>
      <div class="page-fields"><span>Memo No.<i></i></span><span class="date">Date<i></i>/<i></i>/<i></i></span></div>
    </div><div class="page-rules">${Array.from({ length: 15 }, () => '<span></span>').join('')}</div><div class="page-bottom"></div>
  </div>`;
const INTRO_TEXT = `this is a public facing copy of my actual journal.
I update entries at the end of every week, for real.
private info and certain names are redacted, ofc.
this is mostly for myself, and a fun little art project.`;

lastPage.innerHTML = PAGE_HTML;
for (let index = 0; index < LEAVES; index++) {
  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.setAttribute('aria-hidden', 'true');
  sheet.innerHTML = '<div class="paper-face front"></div><div class="paper-face back"></div>';
  sheetsHost.append(sheet);
  sheets.push(sheet);
}

// Keep the faces visible now or on the next page turn; every blank leaf shares the same design.
const renderedPages = new Set();
function syncPageContent() {
  const first = Math.max(0, turned - 2);
  const last = Math.min(LEAVES - 1, turned + 1);
  for (const index of renderedPages) {
    if (index === 0 || (index >= first && index <= last)) continue;
    sheets[index].firstElementChild.replaceChildren();
    sheets[index].lastElementChild.replaceChildren();
    sheets[index].style.visibility = 'hidden';
    renderedPages.delete(index);
  }
  for (let index = 0; index < LEAVES; index++) {
    if (index !== 0 && (index < first || index > last)) continue;
    if (renderedPages.has(index)) continue;
    sheets[index].firstElementChild.innerHTML = PAGE_HTML;
    if (index === 0) {
      const intro = document.createElement('div');
      intro.className = 'first-page-note';
      const heading = document.createElement('span');
      heading.className = 'note-title';
      heading.textContent = '(vol I)';
      const body = document.createElement('p');
      body.className = 'note-body';
      body.textContent = INTRO_TEXT;
      const signoff = document.createElement('div');
      signoff.className = 'note-signoff';
      signoff.innerHTML = '<span>cheerio,</span><span class="note-signature">- rajin</span>';
      intro.append(heading, body, signoff);
      sheets[index].firstElementChild.querySelector('.page-content').append(intro);
    }
    sheets[index].lastElementChild.innerHTML = PAGE_HTML;
    sheets[index].style.visibility = 'visible';
    renderedPages.add(index);
  }
  console.assert(
    sheets[Math.max(0, turned - 1)].lastElementChild.childElementCount &&
    sheets[Math.min(turned, LEAVES - 1)].firstElementChild.childElementCount,
    'Visible journal pages must be ready'
  );
}

function layout() {
  const rect = scene.getBoundingClientRect();
  const availableHeight = Math.max(300, rect.height - 170);
  const availableWidth = Math.max(230, rect.width - 48);
  const scale = Math.min(1.12, availableHeight / 560, availableWidth / (isOpen ? 820 : 390));
  scene.style.setProperty('--scale', scale.toFixed(4));
  scene.style.setProperty('--offset', `${((isOpen ? -90 : -155) * scale).toFixed(1)}px`);
}

function syncSheets() {
  scene.classList.toggle('has-left-page', turned > 0);
  sheets.forEach((sheet, index) => {
    const isTurned = index < turned;
    sheet.classList.toggle('is-turned', isTurned);
    sheet.style.zIndex = String(isTurned ? index + 1 : LEAVES - index + 15);
    sheet.style.transform = `translateZ(${isTurned ? 7 + index * .025 : 11 - index * .025}px) rotateY(${isTurned ? -180 : 0}deg)`;
  });
}

function syncView() {
  scene.classList.toggle('is-open', isOpen);
  const phase = pendingAction || (isOpen ? 'open' : 'closed');
  toggleButton.dataset.phase = phase;
  toggleButton.setAttribute('aria-label', {
    closed: 'Open journal', opening: 'Opening journal',
    open: 'Close journal', closing: 'Closing journal'
  }[phase]);
  toggleButton.setAttribute('aria-busy', String(Boolean(pendingAction)));
  toggleButton.setAttribute('aria-expanded', String(isOpen));
  toggleButton.disabled = busy;
  coverButton.disabled = isOpen;
  coverButton.tabIndex = isOpen ? -1 : 0;
}

async function openJournal() {
  if (isOpen || busy) return;
  busy = true;
  pendingAction = 'opening';
  syncView();
  await wait(settleFront());
  // 333deg and -27deg look identical, but CSS would animate the long way to 0deg.
  book.style.transition = 'none';
  motion.yaw = -27;
  book.style.transform = 'translateY(0px) rotateX(13deg) rotateY(-27deg) rotateZ(-2.5deg)';
  void book.offsetWidth;
  book.style.removeProperty('transition');
  scene.classList.add('is-unfastened');
  await wait(860);
  isOpen = true;
  book.style.removeProperty('transform');
  layout();
  syncView();
  await wait(1060);
  busy = false;
  pendingAction = '';
  scene.classList.remove('is-settling');
  syncView();
}

async function closeJournal() {
  if (!isOpen || busy) return;
  busy = true;
  pendingAction = 'closing';
  syncView();
  if (turned > 0) {
    scene.classList.add('is-gathering-pages');
    turned = 0;
    syncSheets();
    await wait(660);
    syncPageContent();
    scene.classList.remove('is-gathering-pages');
  }
  settleFront();
  isOpen = false;
  layout();
  syncView();
  await wait(1060);
  scene.classList.remove('is-unfastened');
  await wait(860);
  busy = false;
  pendingAction = '';
  scene.classList.remove('is-settling');
  syncView();
  queueRest();
}

async function turn(direction) {
  if (!isOpen || busy) return;
  const next = turned + direction;
  if (next < 0 || next > LEAVES) return;
  busy = true;
  syncView();
  const sheet = sheets[direction > 0 ? turned : turned - 1];
  sheet.classList.add('is-turning');
  sheet.style.zIndex = '120';
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  turned = next;
  sheet.classList.toggle('is-turned', direction > 0);
  sheet.style.transform = `translateZ(${direction > 0 ? 7 + (next - 1) * .025 : 11 - next * .025}px) rotateY(${direction > 0 ? -180 : 0}deg)`;
  await wait(890);
  sheet.classList.remove('is-turning');
  busy = false;
  sheet.style.zIndex = String(direction > 0 ? next : LEAVES - next + 15);
  scene.classList.toggle('has-left-page', turned > 0);
  syncPageContent();
  syncView();
}

coverButton.addEventListener('click', event => {
  if (performance.now() < suppressClickUntil) { event.preventDefault(); return; }
  openJournal();
});
bookMotion.addEventListener('pointerenter', event => {
  if (event.pointerType === 'touch' || isOpen || busy) return;
  motion.hovered = true;
  scene.classList.add('is-hovered');
});
bookMotion.addEventListener('pointermove', event => {
  if (isOpen || busy) return;
  if (motion.dragging && motion.pointerId === event.pointerId) {
    const dx = event.clientX - motion.lastX;
    motion.lastX = event.clientX;
    if (Math.abs(event.clientX - motion.startX) > 5) {
      if (!motion.moved) {
        motion.moved = true;
        bookMotion.setPointerCapture(event.pointerId);
      }
      motion.yaw += dx * .65;
      motion.targetX = 0;
      motion.targetY = 0;
    }
    return;
  }
  if (event.pointerType === 'touch') return;
  motion.hovered = true;
  scene.classList.add('is-hovered');
  const bounds = bookMotion.getBoundingClientRect();
  const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - .5) * 2));
  const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - .5) * 2));
  motion.targetX = -y * 6;
  motion.targetY = x * 9;
});
bookMotion.addEventListener('pointerleave', () => {
  if (motion.dragging) return;
  motion.hovered = false;
  motion.targetX = 0;
  motion.targetY = 0;
  scene.classList.remove('is-hovered');
});
bookMotion.addEventListener('pointerdown', event => {
  if (event.button !== 0 || isOpen || busy) return;
  motion.dragging = true;
  motion.pointerId = event.pointerId;
  motion.startX = event.clientX;
  motion.lastX = event.clientX;
  motion.moved = false;
  scene.classList.add('is-dragging');
});
bookMotion.addEventListener('pointerup', event => {
  if (!motion.dragging || motion.pointerId !== event.pointerId) return;
  if (motion.moved) suppressClickUntil = performance.now() + 450;
  motion.dragging = false;
  motion.pointerId = null;
  if (event.pointerType === 'touch') motion.hovered = false;
  scene.classList.remove('is-dragging');
});
bookMotion.addEventListener('pointercancel', () => {
  motion.dragging = false;
  motion.pointerId = null;
  motion.hovered = false;
  motion.targetX = 0;
  motion.targetY = 0;
  scene.classList.remove('is-dragging');
  scene.classList.remove('is-hovered');
});
let glintFrame = 0;
coverButton.addEventListener('pointermove', event => {
  if (isOpen) return;
  const bounds = coverButton.getBoundingClientRect();
  const x = Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100));
  const y = Math.max(0, Math.min(100, (event.clientY - bounds.top) / bounds.height * 100));
  cancelAnimationFrame(glintFrame);
  glintFrame = requestAnimationFrame(() => {
    coverButton.style.setProperty('--glint-x', `${x}%`);
    coverButton.style.setProperty('--glint-y', `${y}%`);
  });
});
coverButton.addEventListener('pointerleave', () => {
  cancelAnimationFrame(glintFrame);
  coverButton.style.removeProperty('--glint-x');
  coverButton.style.removeProperty('--glint-y');
});
toggleButton.addEventListener('click', () => isOpen ? closeJournal() : openJournal());
scene.addEventListener('pointerdown', event => {
  if (!isOpen || busy) return;
  pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
  scene.setPointerCapture(event.pointerId);
});
scene.addEventListener('pointerup', event => {
  if (!pointerStart || pointerStart.id !== event.pointerId) return;
  const dx = event.clientX - pointerStart.x;
  const dy = event.clientY - pointerStart.y;
  pointerStart = null;
  if (Math.abs(dx) < 35 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
  suppressClickUntil = performance.now() + 500;
  // A leftward gesture carries a right-hand leaf across the binding.
  turn(dx < 0 ? 1 : -1);
});
scene.addEventListener('pointercancel', () => { pointerStart = null; });
scene.addEventListener('click', event => {
  if (performance.now() < suppressClickUntil || !isOpen || busy) return;
  const bounds = book.getBoundingClientRect();
  const scale = Number.parseFloat(getComputedStyle(scene).getPropertyValue('--scale')) || 1;
  const spineX = bounds.left;
  if (event.clientY < bounds.top - 8 || event.clientY > bounds.bottom + 8) return;
  if (event.clientX < spineX - 310 * scale - 8 || event.clientX > spineX + 310 * scale + 8) return;
  turn(event.clientX >= spineX ? 1 : -1);
});
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); turn(1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); turn(-1); }
  if (event.key === 'Escape') closeJournal();
});
window.addEventListener('resize', layout);
document.addEventListener('visibilitychange', queueRest);
reducedMotion.addEventListener('change', queueRest);
const narrowViewport = window.matchMedia('(max-width: 720px)');
function showViewportNotice() {
  if (!narrowViewport.matches || viewportNotice.open) return;
  try {
    if (sessionStorage.getItem('journalViewportNotice') === 'dismissed') return;
  } catch { /* Storage may be unavailable. */ }
  viewportNotice.showModal();
}
viewportNotice.addEventListener('close', () => {
  try { sessionStorage.setItem('journalViewportNotice', 'dismissed'); } catch { /* Storage may be unavailable. */ }
});
narrowViewport.addEventListener('change', () => {
  if (narrowViewport.matches) showViewportNotice();
  else if (viewportNotice.open) viewportNotice.close();
});
syncSheets();
syncPageContent();
layout();
syncView();
renderMotion();
queueRest();
showViewportNotice();
