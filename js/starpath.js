const canvas = document.getElementById('starpath-canvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const text = "Привет! Я — Алексей. Добро пожаловать в мой звёздный путь. Здесь вы можете узнать ифнормацию про меня";
let offsetX = canvas.width;
const speed = 1;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '24px Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
  ctx.fillStyle = 'rgba(102, 204, 255, 0.3)';
  ctx.fillText(text, offsetX, canvas.height / 2);
  offsetX -= speed;
  if (offsetX < -ctx.measureText(text).width) {
    offsetX = canvas.width;
  }
  requestAnimationFrame(draw);
}

draw();
