import { randomRange, loadJSON } from './utils.js';

const canvas = document.getElementById('stars-canvas');
const ctx = canvas.getContext('2d');
let stars = [];
let meteors = [];
let backgroundStars = [];
let infoPopup = document.getElementById('info-popup');
let animationId = null;

// Настройки
const METEOR_COUNT = 3;
const BACKGROUND_STARS_COUNT = 200;
const METEOR_SPAWN_INTERVAL = 3000; // 3 секунды

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Пересчитываем позиции звёзд при изменении размера
  stars.forEach(star => {
    star.updatePosition();
  });
  
  // Пересоздаём фоновые звёзды
  createBackgroundStars();
}

window.addEventListener('resize', resize);
resize();

// Класс для интерактивных звёзд
class InteractiveStar {
  constructor(data) {
    this.data = data;
    this.relativeX = data.x;
    this.relativeY = data.y;
    this.type = data.type;
    this.title = data.title;
    this.description = data.description;
    this.links = data.links || [];
    
    // Визуальные свойства
    this.baseRadius = this.getRadiusByType();
    this.radius = this.baseRadius;
    this.targetRadius = this.baseRadius;
    this.hovered = false;
    this.color = this.getColorByType();
    this.glowIntensity = 0;
    this.targetGlowIntensity = 0;
    
    // Анимация мерцания
    this.twinkle = Math.random() * Math.PI * 2;
    this.twinkleSpeed = randomRange(0.01, 0.03);
    
    this.updatePosition();
  }
  
  updatePosition() {
    this.x = this.relativeX * canvas.width;
    this.y = this.relativeY * canvas.height;
  }
  
  getRadiusByType() {
    const sizes = {
      contact: 4,
      tech: 3,
      project: 5,
      achievement: 4,
      default: 3
    };
    return sizes[this.type] || sizes.default;
  }
  
  getColorByType() {
    const colors = {
      contact: '#66ccff',
      tech: '#ffcc66',
      project: '#ff6666',
      achievement: '#66ff66',
      default: '#aaaaaa'
    };
    return colors[this.type] || colors.default;
  }
  
  update() {
    // Обновляем анимацию мерцания
    this.twinkle += this.twinkleSpeed;
    
    // Плавная анимация размера
    this.radius += (this.targetRadius - this.radius) * 0.1;
    
    // Плавная анимация свечения
    this.glowIntensity += (this.targetGlowIntensity - this.glowIntensity) * 0.1;
    
    // Устанавливаем целевые значения в зависимости от состояния
    if (this.hovered) {
      this.targetRadius = this.baseRadius * 2;
      this.targetGlowIntensity = 1;
    } else {
      this.targetRadius = this.baseRadius;
      this.targetGlowIntensity = 0;
    }
  }
  
  draw() {
    const twinkleIntensity = Math.sin(this.twinkle) * 0.2 + 0.8;
    
    ctx.save();
    
    // Свечение при наведении
    if (this.glowIntensity > 0) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 20 * this.glowIntensity;
    }
    
    // Основная звезда
    ctx.globalAlpha = twinkleIntensity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Дополнительное свечение в центре
    if (this.hovered) {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  isPointInside(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    const hitRadius = Math.max(this.radius + 10, 15); // Минимальная область клика
    return dx * dx + dy * dy <= hitRadius * hitRadius;
  }
}

// Класс для фоновых звёзд
class BackgroundStar {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = randomRange(0.5, 2);
    this.opacity = randomRange(0.2, 0.8);
    this.twinkle = Math.random() * Math.PI * 2;
    this.twinkleSpeed = randomRange(0.005, 0.02);
  }
  
  update() {
    this.twinkle += this.twinkleSpeed;
  }
  
  draw() {
    const twinkleIntensity = Math.sin(this.twinkle) * 0.3 + 0.7;
    
    ctx.save();
    ctx.globalAlpha = this.opacity * twinkleIntensity;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Класс для метеоритов
class Meteor {
  constructor() {
    this.reset();
  }
  
  reset() {
    // Случайная сторона появления
    const side = Math.floor(Math.random() * 4);
    const margin = 100;
    
    switch (side) {
      case 0: // сверху
        this.x = randomRange(-margin, canvas.width + margin);
        this.y = -margin;
        this.vx = randomRange(-2, 2);
        this.vy = randomRange(3, 8);
        break;
      case 1: // справа
        this.x = canvas.width + margin;
        this.y = randomRange(-margin, canvas.height + margin);
        this.vx = randomRange(-8, -3);
        this.vy = randomRange(-2, 2);
        break;
      case 2: // снизу
        this.x = randomRange(-margin, canvas.width + margin);
        this.y = canvas.height + margin;
        this.vx = randomRange(-2, 2);
        this.vy = randomRange(-8, -3);
        break;
      case 3: // слева
        this.x = -margin;
        this.y = randomRange(-margin, canvas.height + margin);
        this.vx = randomRange(3, 8);
        this.vy = randomRange(-2, 2);
        break;
    }
    
    this.length = randomRange(40, 100);
    this.opacity = 1;
    this.fadeSpeed = randomRange(0.005, 0.01);
    this.trail = [];
    this.maxTrailLength = 15;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    
    // Добавляем точку в след
    this.trail.push({
      x: this.x,
      y: this.y,
      opacity: this.opacity
    });
    
    // Ограничиваем длину следа
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
    
    // Обновляем прозрачность следа
    this.trail.forEach((point, index) => {
      point.opacity = (index / this.trail.length) * this.opacity * 0.8;
    });
    
    // Постепенное затухание
    this.opacity -= this.fadeSpeed;
    
    // Проверяем выход за границы или полное затухание
    const margin = 200;
    if (this.x < -margin || this.x > canvas.width + margin || 
        this.y < -margin || this.y > canvas.height + margin ||
        this.opacity <= 0) {
      this.reset();
    }
  }
  
  draw() {
    if (this.trail.length < 2) return;
    
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Рисуем след
    for (let i = 1; i < this.trail.length; i++) {
      const current = this.trail[i];
      const previous = this.trail[i - 1];
      
      ctx.globalAlpha = current.opacity;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = (i / this.trail.length) * 3;
      
      ctx.beginPath();
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();
    }
    
    // Рисуем голову метеорита
    if (this.trail.length > 0) {
      const head = this.trail[this.trail.length - 1];
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.arc(head.x, head.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

// Создание фоновых звёзд
function createBackgroundStars() {
  backgroundStars = [];
  for (let i = 0; i < BACKGROUND_STARS_COUNT; i++) {
    backgroundStars.push(new BackgroundStar());
  }
}

// Создание метеоритов
function createMeteors() {
  meteors = [];
  for (let i = 0; i < METEOR_COUNT; i++) {
    meteors.push(new Meteor());
  }
}

// Показ информационной подсказки
function showInfo(star, mouseX, mouseY) {
  if (!star) {
    infoPopup.classList.add('hidden');
    return;
  }
  
  let html = `<strong>${star.title}</strong><br>${star.description}`;
  
  if (star.links.length > 0) {
    html += '<div class="links">';
    star.links.forEach(link => {
      html += `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.text}</a><br>`;
    });
    html += '</div>';
  }
  
  infoPopup.innerHTML = html;
  
  // Позиционирование с учётом границ экрана
  let left = mouseX + 15;
  let top = mouseY + 15;
  
  // Получаем размеры подсказки
  infoPopup.style.visibility = 'hidden';
  infoPopup.classList.remove('hidden');
  const rect = infoPopup.getBoundingClientRect();
  infoPopup.classList.add('hidden');
  infoPopup.style.visibility = 'visible';
  
  // Проверяем правую границу
  if (left + rect.width > window.innerWidth) {
    left = mouseX - rect.width - 15;
  }
  
  // Проверяем нижнюю границу
  if (top + rect.height > window.innerHeight) {
    top = mouseY - rect.height - 15;
  }
  
  // Проверяем левую границу
  if (left < 0) {
    left = 15;
  }
  
  // Проверяем верхнюю границу
  if (top < 0) {
    top = 15;
  }
  
  infoPopup.style.left = left + 'px';
  infoPopup.style.top = top + 'px';
  infoPopup.classList.remove('hidden');
}

// Обработчики событий мыши
function handleMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  let hoveredStar = null;
  
  // Проверяем наведение на интерактивные звёзды
  stars.forEach(star => {
    if (star.isPointInside(mouseX, mouseY)) {
      star.hovered = true;
      hoveredStar = star;
      canvas.style.cursor = 'pointer';
    } else {
      star.hovered = false;
    }
  });
  
  if (hoveredStar) {
    showInfo(hoveredStar, e.clientX, e.clientY);
  } else {
    showInfo(null);
    canvas.style.cursor = 'default';
  }
}

function handleMouseLeave() {
  stars.forEach(star => {
    star.hovered = false;
  });
  showInfo(null);
  canvas.style.cursor = 'default';
}

function handleClick(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  // Проверяем клик по звёздам
  stars.forEach(star => {
    if (star.isPointInside(mouseX, mouseY)) {
      // Если у звезды только одна ссылка, открываем её сразу
      if (star.links.length === 1) {
        window.open(star.links[0].url, '_blank');
      }
      // Создаём эффект клика
      createClickEffect(mouseX, mouseY);
    }
  });
}

// Эффект клика
function createClickEffect(x, y) {
  // Создаём временные частицы для эффекта
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const speed = randomRange(2, 5);
    
    // Добавляем временный метеорит для эффекта
    const effect = new Meteor();
    effect.x = x;
    effect.y = y;
    effect.vx = Math.cos(angle) * speed;
    effect.vy = Math.sin(angle) * speed;
    effect.length = 20;
    effect.opacity = 1;
    effect.fadeSpeed = 0.05;
    
    meteors.push(effect);
  }
}

// Основной цикл анимации
function animate() {
  // Очищаем canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Обновляем и рисуем фоновые звёзды
  backgroundStars.forEach(star => {
    star.update();
    star.draw();
  });
  
  // Обновляем и рисуем интерактивные звёзды
  stars.forEach(star => {
    star.update();
    star.draw();
  });
  
  // Обновляем и рисуем метеориты
  meteors.forEach(meteor => {
    meteor.update();
    meteor.draw();
  });
  
  // Удаляем метеориты-эффекты, которые полностью исчезли
  meteors = meteors.filter(meteor => meteor.opacity > 0);
  
  animationId = requestAnimationFrame(animate);
}

// Инициализация
async function init() {
  try {
    // Загружаем данные звёзд
    const data = await loadJSON('data/stars.json');
    
    if (data && Array.isArray(data)) {
      stars = data.map(starData => new InteractiveStar(starData));
    } else {
      console.warn('Не удалось загрузить данные звёзд, используем демо-данные');
      // Демо-данные
      stars = [
        new InteractiveStar({
          x: 0.2, y: 0.3, type: 'contact',
          title: 'Контакт', description: 'Свяжитесь со мной',
          links: [{ text: 'Email', url: 'mailto:test@example.com' }]
        }),
        new InteractiveStar({
          x: 0.7, y: 0.4, type: 'tech',
          title: 'Технологии', description: 'Мой технический стек',
          links: []
        }),
        new InteractiveStar({
          x: 0.5, y: 0.6, type: 'project',
          title: 'Проект', description: 'Мой последний проект',
          links: [{ text: 'GitHub', url: 'https://github.com' }]
        })
      ];
    }
    
    // Создаём фоновые звёзды и метеориты
    createBackgroundStars();
    createMeteors();
    
    // Настраиваем обработчики событий
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);
    
    // Включаем pointer-events для canvas
    canvas.style.pointerEvents = 'auto';
    
    // Запускаем анимацию
    animate();
    
    console.log('Звёздное небо инициализировано:', stars.length, 'интерактивных звёзд');
    
  } catch (error) {
    console.error('Ошибка инициализации звёздного неба:', error);
  }
}

// Очистка при выгрузке страницы
window.addEventListener('beforeunload', () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});

// Запускаем инициализацию
init();
