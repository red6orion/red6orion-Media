import { loadJSON } from './utils.js';

const svg = document.getElementById('map-svg');
const width = window.innerWidth;
const height = window.innerHeight;

let nodes = [];
let links = [];

let draggingNode = null;
let offset = { x: 0, y: 0 };

function createSVGElement(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
  return el;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function draw() {
  svg.innerHTML = '';

  // Рисуем связи
  links.forEach(link => {
    const line = createSVGElement('line', {
      x1: link.source.x,
      y1: link.source.y,
      x2: link.target.x,
      y2: link.target.y,
      stroke: '#66ccff',
      'stroke-width': 2,
    });
    svg.appendChild(line);
  });

  // Рисуем узлы
  nodes.forEach(node => {
    const group = createSVGElement('g', { cursor: 'pointer' });
    const circle = createSVGElement('circle', {
      cx: node.x,
      cy: node.y,
      r: 20,
      fill: '#0a0a1a',
      stroke: '#66ccff',
      'stroke-width': 2,
    });
    const text = createSVGElement('text', {
      x: node.x,
      y: node.y + 6,
      'text-anchor': 'middle',
      'font-size': 14,
      fill: '#66ccff',
      'pointer-events': 'none',
      'font-family': 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    });
    text.textContent = node.name;

    group.appendChild(circle);
    group.appendChild(text);
    svg.appendChild(group);

    group.addEventListener('mousedown', e => {
      draggingNode = node;
      offset.x = e.clientX - node.x;
      offset.y = e.clientY - node.y;
    });

    group.addEventListener('click', () => {
      if (node.isCentral) {
        // Ничего
      } else if (node.isSpecial) {
        // Анимация погружения и переход на главную
        svg.style.transition = 'opacity 1s';
        svg.style.opacity = 0;
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }
    });
  });
}

function updatePhysics() {
  // Простая физика пружинных связей
  const springLength = 150;
  const springStrength = 0.01;
  const friction = 0.9;

  nodes.forEach(node => {
    node.vx = (node.vx || 0) * friction;
    node.vy = (node.vy || 0) * friction;
  });

  links.forEach(link => {
    const dx = link.target.x - link.source.x;
    const dy = link.target.y - link.source.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const diff = springLength - dist;
    const force = springStrength * diff;

    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    if (!link.source.fixed) {
      link.source.vx = (link.source.vx || 0) - fx;
      link.source.vy = (link.source.vy || 0) - fy;
    }
    if (!link.target.fixed) {
      link.target.vx = (link.target.vx || 0) + fx;
      link.target.vy = (link.target.vy || 0) + fy;
    }
  });

  nodes.forEach(node => {
    if (!node.fixed) {
      node.x += node.vx || 0;
      node.y += node.vy || 0;
    }
  });
}

function animate() {
  updatePhysics();
  draw();
  requestAnimationFrame(animate);
}

function onMouseMove(e) {
  if (!draggingNode) return;
  draggingNode.x = e.clientX - offset.x;
  draggingNode.y = e.clientY - offset.y;

  // Перемещаем связанные узлы
  const connected = links.filter(l => l.source === draggingNode || l.target === draggingNode);
  connected.forEach(link => {
    const other = link.source === draggingNode ? link.target : link.source;
    if (!other.fixed) {
      other.x += (draggingNode.x - other.x) * 0.1;
      other.y += (draggingNode.y - other.y) * 0.1;
    }
  });
}

function onMouseUp() {
  draggingNode = null;
}

async function init() {
  const data = await loadJSON('data/mapdata.json');
  nodes = data.nodes;
  links = data.links.map(l => ({
    source: nodes.find(n => n.id === l.source),
    target: nodes.find(n => n.id === l.target),
  }));

  // Отметим центральный и специальный узлы
  nodes.forEach(n => {
    n.fixed = false;
    n.vx = 0;
    n.vy = 0;
    n.isCentral = n.id === data.centralNodeId;
    n.isSpecial = n.id === data.specialNodeId;
    if (n.isCentral) {
      n.fixed = true;
      n.x = width / 2;
      n.y = height / 2;
    }
  });

  svg.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  animate();
}

init();
