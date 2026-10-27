'use strict';

// TASARIM AYARLARI: Renkler, boyutlar, konumlar ve kurallar buradan değiştirilebilir.
const DESIGN = {
  colours: [
    {id:'blush',name:'Blush Pink',hex:'#eeb2c3'}, {id:'rose',name:'Dusty Rose',hex:'#ca7793'},
    {id:'cherry',name:'Cherry Red',hex:'#c63f5c'}, {id:'lilac',name:'Lilac',hex:'#bca8dd'},
    {id:'cream',name:'Vanilla',hex:'#f5e7cc'}, {id:'mint',name:'Mint',hex:'#a6d4bd'},
    {id:'peach',name:'Peach',hex:'#efb08f'}, {id:'plum',name:'Plum',hex:'#73536f'},
    {id:'bubblegum',name:'Bubblegum',hex:'#f17cb3'}, {id:'ballet',name:'Ballet Pink',hex:'#f8d4df'},
    {id:'burgundy',name:'Burgundy',hex:'#842e48'}, {id:'coral',name:'Coral',hex:'#ff867c'},
    {id:'lavender',name:'Lavender',hex:'#d7c5f2'}, {id:'blue',name:'Baby Blue',hex:'#b5d7f4'},
    {id:'sage',name:'Sage',hex:'#a8b99c'}, {id:'white',name:'French White',hex:'#fff8f0'},
    {id:'mocha',name:'Mocha',hex:'#ab8175'}, {id:'black',name:'Midnight',hex:'#39303e'}
  ],
  shapes: [ { id: 'round', name: 'Round' }, { id: 'square', name: 'Square' }, { id: 'almond', name: 'Almond' } ],
  charms: [
    {id:'heart',name:'Heart',symbol:'♥'}, {id:'star',name:'Star',symbol:'✦'},
    {id:'bow',name:'Bow',symbol:'🎀'}, {id:'flower',name:'Flower',symbol:'✿'},
    {id:'pearl',name:'Pearl',symbol:'●'}, {id:'butterfly',name:'Butterfly',symbol:'🦋'},
    {id:'cherry',name:'Cherry',symbol:'🍒'}, {id:'diamond',name:'Gem',symbol:'◆'},
    {id:'moon',name:'Moon',symbol:'☾'}, {id:'sparkle',name:'Sparkle',symbol:'✧'},
    {id:'daisy',name:'Daisy',symbol:'🌼'}, {id:'clover',name:'Clover',symbol:'♣'}
  ],
  positions: [ { id: 'top', name: 'Top' }, { id: 'middle', name: 'Middle' }, { id: 'bottom', name: 'Bottom' } ],
  nails: [
    { name: 'Thumb', x: 13.4, y: 63.3, rotation: -38 },
    { name: 'Index', x: 33.7, y: 31.4, rotation: -3 },
    { name: 'Middle', x: 48.5, y: 16.8, rotation: 0 },
    { name: 'Ring', x: 63.2, y: 24.5, rotation: 4 },
    { name: 'Pinky', x: 78.2, y: 38.4, rotation: 10 }
  ],
  capacities: { free: 3, limited: 1 },
  defaultColour: 'blush',
  defaultShape: 'round',
  nailWidthPx: 33,
  nailHeightPx: 54,
  feedbackDurationMs: 0, // 0: Mesaj yeni işlem gelene kadar kalır.
  animationsEnabled: true,
  resetOnModeChange: true,
  allowDuplicateCharms: true,
  freeCapacityBehaviour: 'reject',
  limitedCapacityBehaviour: 'replace'
};

// STATE: Arayüzden bağımsız uygulama durumu.
const makeNail = () => ({ colour: DESIGN.defaultColour, shape: DESIGN.defaultShape, decorations: [] });
const state = {
  mode: 'free',
  nails: Array.from({ length: DESIGN.nails.length }, makeNail),
  selectedNail: 0,
  pendingCharm: null,
  selectedPosition: 'middle',
  message: 'Choose a nail and start creating! ♡'
};

// RULE: İş kuralları yalnızca durumu değiştirir, HTML üretmez.
function capacity() { return DESIGN.capacities[state.mode]; }
function resetNails() {
  state.nails = Array.from({ length: DESIGN.nails.length }, makeNail);
  state.selectedNail = 0;
  state.pendingCharm = null;
  state.selectedPosition = 'middle';
}
function applyColour(colourId) {
  if (!DESIGN.colours.some(item => item.id === colourId)) return;
  state.nails[state.selectedNail].colour = colourId;
  state.message = `Colour updated on ${DESIGN.nails[state.selectedNail].name}.`;
}
function applyShape(shapeId) {
  if (!DESIGN.shapes.some(item => item.id === shapeId)) return;
  state.nails[state.selectedNail].shape = shapeId;
  state.message = `Shape updated on ${DESIGN.nails[state.selectedNail].name}.`;
}
function applyCharm(charmId, positionId) {
  if (!DESIGN.charms.some(item => item.id === charmId) || !DESIGN.positions.some(item => item.id === positionId)) return;
  const decorations = state.nails[state.selectedNail].decorations;
  const samePositionIndex = decorations.findIndex(item => item.position === positionId);
  if (samePositionIndex !== -1) {
    decorations[samePositionIndex] = { charm: charmId, position: positionId };
    state.message = `Charm replaced at ${positionId} position.`;
    return;
  }
  if (!DESIGN.allowDuplicateCharms && decorations.some(item => item.charm === charmId)) {
    state.message = 'This charm is already on the selected nail.';
    return;
  }
  if (decorations.length < capacity()) {
    decorations.push({ charm: charmId, position: positionId });
    state.message = `Charm added at ${positionId} position!`;
  } else if (state.mode === 'limited' && DESIGN.limitedCapacityBehaviour === 'replace') {
    decorations.splice(0, decorations.length, { charm: charmId, position: positionId });
    state.message = 'Limited Mode: the new charm replaced the old one.';
  } else {
    state.message = `Decoration limit reached (${capacity()}). Remove a charm to add another.`;
  }
}
function setMode(nextMode) {
  if (!Object.hasOwn(DESIGN.capacities, nextMode) || nextMode === state.mode) return;
  state.mode = nextMode;
  if (DESIGN.resetOnModeChange) resetNails();
  state.message = `${nextMode === 'free' ? 'Free' : 'Limited'} Mode started. Your design has been reset.`;
}
function removeLastCharm() {
  const list = state.nails[state.selectedNail].decorations;
  if (list.length) { list.pop(); state.message = 'Last charm removed.'; }
  else state.message = 'No charms to remove on this nail.';
}

// OUTPUT: Görsel arayüzü güncelleyen işlevler.
const $ = id => document.getElementById(id);
const findColour = id => DESIGN.colours.find(item => item.id === id);
const findCharm = id => DESIGN.charms.find(item => item.id === id);
function makeButton(className, text, label, onClick) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = className;
  button.textContent = text; button.setAttribute('aria-label', label);
  button.addEventListener('click', onClick);
  return button;
}
function renderNails() {
  const root = $('nailSlots'); root.replaceChildren();
  state.nails.forEach((nail, index) => {
    const layout = DESIGN.nails[index];
    const btn = makeButton('nail', '', `${layout.name}: ${findColour(nail.colour).name}, ${nail.shape}, ${nail.decorations.length} decorations. Select nail.`, () => {
      state.selectedNail = index; state.message = `${layout.name} selected.`; render();
    });
    btn.style.left = `${layout.x}%`; btn.style.top = `${layout.y}%`;
    btn.style.transform = `translate(-50%, -50%) rotate(${layout.rotation}deg)`;
    btn.style.setProperty('--nail-colour', findColour(nail.colour).hex);
    btn.style.width = `${DESIGN.nailWidthPx}px`; btn.style.height = `${DESIGN.nailHeightPx}px`;
    btn.dataset.shape = nail.shape;
    btn.classList.toggle('selected', index === state.selectedNail);
    btn.setAttribute('aria-pressed', String(index === state.selectedNail));
    nail.decorations.forEach(decoration => {
      const mark = document.createElement('span'); mark.className = 'charm';
      mark.dataset.position = decoration.position;
      mark.textContent = findCharm(decoration.charm).symbol;
      btn.append(mark);
    });
    root.append(btn);
  });
}
function renderTools() {
  const nail = state.nails[state.selectedNail];
  const colours = $('colourOptions'); colours.replaceChildren();
  DESIGN.colours.forEach(item => {
    const btn = makeButton('swatch', '', item.name, () => { applyColour(item.id); render(); });
    btn.style.setProperty('--swatch', item.hex);
    btn.classList.toggle('active', nail.colour === item.id);
    btn.setAttribute('aria-pressed', String(nail.colour === item.id)); btn.title = item.name;
    colours.append(btn);
  });
  const shapes = $('shapeOptions'); shapes.replaceChildren();
  DESIGN.shapes.forEach(item => {
    const btn = makeButton('choice', item.name, item.name, () => { applyShape(item.id); render(); });
    btn.classList.toggle('active', nail.shape === item.id);
    btn.setAttribute('aria-pressed', String(nail.shape === item.id)); shapes.append(btn);
  });
  const charms = $('charmOptions'); charms.replaceChildren();
  DESIGN.charms.forEach(item => {
    const btn = makeButton('choice charm-choice', '', `Select ${item.name} charm`, () => {
      state.pendingCharm = item.id;
      state.message = `${item.name} selected. Choose a position below to apply it.`;
      render();
    });
    const icon = document.createElement('span'); icon.className = 'charm-icon'; icon.textContent = item.symbol;
    const name = document.createElement('span'); name.textContent = item.name;
    btn.append(icon, name);
    btn.classList.toggle('active', state.pendingCharm === item.id);
    btn.setAttribute('aria-pressed', String(state.pendingCharm === item.id)); charms.append(btn);
  });
  const positions = $('positionOptions'); positions.replaceChildren();
  DESIGN.positions.forEach(item => {
    const btn = makeButton('choice', item.name, `Apply selected charm at ${item.name} position`, () => {
      state.selectedPosition = item.id;
      if (!state.pendingCharm) state.message = 'Choose a charm first.';
      else applyCharm(state.pendingCharm, item.id);
      render();
    });
    btn.classList.toggle('active', state.selectedPosition === item.id);
    btn.setAttribute('aria-pressed', String(state.selectedPosition === item.id));
    positions.append(btn);
  });
}
function render() {
  renderNails(); renderTools();
  document.querySelectorAll('[data-mode]').forEach(btn => {
    const active = btn.dataset.mode === state.mode;
    btn.classList.toggle('active', active); btn.setAttribute('aria-pressed', String(active));
  });
  $('selectedLabel').textContent = `Selected: ${DESIGN.nails[state.selectedNail].name}`;
  $('capacityLabel').textContent = `Decorations: ${state.nails[state.selectedNail].decorations.length} / ${capacity()}`;
  $('feedback').textContent = state.message;
}

// INPUT: Fare, dokunma ve klavye aynı HTML düğmelerini kullanır.
document.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => { setMode(btn.dataset.mode); render(); }));
$('cancelSelection').addEventListener('click', () => {
  state.pendingCharm = null;
  state.message = 'Charm selection cancelled. Your nail design is unchanged.';
  render();
});
$('resetDesign').addEventListener('click', () => {
  resetNails(); state.message = 'Design reset. Your current mode is unchanged.'; render();
});
$('removeCharm').addEventListener('click', () => { removeLastCharm(); render(); });
render();
