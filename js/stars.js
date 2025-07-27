import { randomRange, loadJSON } from './utils.js';

const canvas = document.getElementById('stars-canvas');
const ctx = canvas.getContext('2d');
let stars = [];
let infoPopup = document.getElementById('info-popup');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

class Star {
  constructor(data) {
    this.x = data.x * canvas.width;
    this.y = data.y * canvas.height;
    this.type = data.type;
    this.title = data.title;
    this.description = data.description;
    this.links = data.links || [];
    this.radius = 2;
    this.hovered = false;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.hovered ? '#66ccff' : '#aaa';
    ctx.shadowColor = '#66ccff';
    ctx.shadowBlur = this.hovered ? 10 : 0;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  isPointInside(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= (this.radius + 5) ** 2;
  }
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(star => star.draw());
}

function showInfo(star, x, y) {
  if (!star) {
    infoPopup.classList.add('hidden');
    return;
  }
  let html = `<strong>${star.title}</strong><br>${star.description}<br>`;
  if (star.links.length) {
    html += '<div class="links">';
    star.links.forEach(link => {
      html += `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.text}</a><br>`;
    });
    html += '</div>';
  }
  infoPopup.innerHTML = html;
  infoPopup.style.left = x + 15 + 'px';
  infoPopup.style.top = y + 15 + 'px';
  infoPopup.classList.remove('hidden');
}

canvas.addEventListener('mousemove', e => {
  let found = false;
  stars.forEach(star => {
    if (star.isPointInside(e.clientX, e.clientY)) {
      star.hovered = true;
      showInfo(star, e.clientX, e.clientY);
      found = true;
    } else {
      star.hovered = false;
    }
  });
  if (!found) showInfo(null);
  drawStars();
});

canvas.addEventListener('mouseleave', () => {
  stars.forEach(s => s.hovered = false);
  showInfo(null);
  drawStars();
});

// Метеориты
class Meteor {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = randomRange(0, canvas.width);
    this.y = randomRange(-100, -10);
    this.length = randomRange(50, 100);
    this.speed = randomRange(5, 10);
    this.angle = Math.PI / 4;
  }
  update() {
    this.x += this.speed * Math.cos(this.angle);
    this.y += this.speed * Math.sin(this.angle);
    if (this.x > canvas.width || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.length * Math.cos(this.angle), this.y - this.length * Math.sin(this.angle));
    ctx.stroke();
  }
}

let meteors = [];
for (let i = 0; i < 5; i++) meteors.push(new Meteor());

async function init() {
  const data = await loadJSON('data/stars.json');
  stars = data.map(d => new Star(d));
  animate();
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(s => s.draw());
  meteors.forEach(m => {
    m.update();
    m.draw();
  });
  requestAnimationFrame(animate);
}

init();
