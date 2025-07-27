import { randomRange, loadJSON } from './utils.js';

// Получаем элементы DOM
const canvas = document.getElementById('stars-canvas');
const ctx = canvas.getContext('2d');
const infoPopup = document.getElementById('info-popup');

// Массивы для хранения объектов
let stars = [];
let meteors = [];
let backgroundStars = [];
let animationId = null;

// Состояние всплывающей таблички
let pinnedStar = null; // Звезда, для которой закреплена табличка
let isPinned = false; // Флаг закреплённого состояния

// Настройки
const METEOR_COUNT = 3;
const BACKGROUND_STARS_COUNT = 150;
const DEBUG = true; // Включаем отладку

// Функция для логирования отладочной информации
function debugLog(message, data = null) {
  if (DEBUG) {
    console.log(`[Stars Debug] ${message}`, data || '');
  }
}

// Класс для интерактивных звёзд
class InteractiveStar {
  constructor(data) {
    this.data = data;
    this.relativeX = data.x; // Относительные координаты (0-1)
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
    
    // Вычисляем абсолютные координаты
    this.updatePosition();
    
    debugLog(`Created star: ${this.title} at (${this.x}, ${this.y})`);
  }
  
  updatePosition() {
    // Преобразуем относительные координаты в абсолютные
    this.x = this.relativeX * canvas.width;
    this.y = this.relativeY * canvas.height;
  }
  
  getRadiusByType() {
    const sizes = {
      contact: 5,
      tech: 4,
      project: 6,
      achievement: 5,
      default: 4
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
    this.radius += (this.targetRadius - this.radius) * 0.15;
    
    // Плавная анимация свечения
    this.glowIntensity += (this.targetGlowIntensity - this.glowIntensity) * 0.15;
    
    // Устанавливаем целевые значения в зависимости от состояния
    if (this.hovered || (isPinned && pinnedStar === this)) {
      this.targetRadius = this.baseRadius * 2.5;
      this.targetGlowIntensity = 1;
    } else {
      this.targetRadius = this.baseRadius;
      this.targetGlowIntensity = 0;
    }
  }
  
  draw() {
    const twinkleIntensity = Math.sin(this.twinkle) * 0.3 + 0.7;
    
    ctx.save();
    
    // Свечение при наведении или закреплении
    if (this.glowIntensity > 0) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 25 * this.glowIntensity;
    }
    
    // Основная звезда
    ctx.globalAlpha = twinkleIntensity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Дополнительное свечение в центре при наведении или закреплении
    if (this.hovered || (isPinned && pinnedStar === this)) {
      ctx.globalAlpha = 0.8;
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
    const hitRadius = Math.max(this.radius + 15, 20); // Увеличенная область для клика
    return dx * dx + dy * dy <= hitRadius * hitRadius;
  }
}

// ... existing code ... (BackgroundStar и Meteor классы остаются без изменений)

// Класс для фоновых звёзд
class BackgroundStar {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = randomRange(0.5, 1.5);
    this.opacity = randomRange(0.3, 0.8);
    this.twinkle = Math.random() * Math.PI * 2;
    this.twinkleSpeed = randomRange(0.005, 0.02);
  }
  
  update() {
    this.twinkle += this.twinkleSpeed;
  }
  
  draw() {
    const twinkleIntensity = Math.sin(this.twinkle) * 0.4 + 0.6;
    
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
    this.fadeSpeed = randomRange(0.003, 0.008);
    this.trail = [];
    this.maxTrailLength = 12;
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
      ctx.shadowBlur = 8;
      
      ctx.beginPath();
      ctx.arc(head.x, head.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

// ... existing code ... (createBackgroundStars и createMeteors остаются без изменений)

// Создание фоновых звёзд
function createBackgroundStars() {
  backgroundStars = [];
  for (let i = 0; i < BACKGROUND_STARS_COUNT; i++) {
    backgroundStars.push(new BackgroundStar());
  }
  debugLog(`Created ${BACKGROUND_STARS_COUNT} background stars`);
}

// Создание метеоритов
function createMeteors() {
  meteors = [];
  for (let i = 0; i < METEOR_COUNT; i++) {
    meteors.push(new Meteor());
  }
  debugLog(`Created ${METEOR_COUNT} meteors`);
}

// Эффект клика
function createClickEffect(x, y) {
  debugLog(`Creating click effect at (${x}, ${y})`);
  
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
    effect.trail = [{ x: x, y: y, opacity: 1 }];
    
    meteors.push(effect);
  }
}

// Показ информационной подсказки
function showInfo(star, mouseX, mouseY, pinned = false) {
  if (!star) {
    if (!isPinned) {
      infoPopup.classList.add('hidden');
    }
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
  
  // Управляем состоянием закрепления
  if (pinned) {
    infoPopup.classList.add('pinned');
    infoPopup.style.pointerEvents = 'auto'; // Разрешаем клики по ссылкам
    isPinned = true;
    pinnedStar = star;
  } else if (!isPinned) {
    infoPopup.classList.remove('pinned');
    infoPopup.style.pointerEvents = 'none';
  }
  
  infoPopup.classList.remove('hidden');
  
  debugLog(`Showing info for: ${star.title} at (${left}, ${top}), pinned: ${pinned}`);
}

// Скрытие всплывающей таблички
function hideInfo() {
  infoPopup.classList.add('hidden');
  infoPopup.classList.remove('pinned');
  infoPopup.style.pointerEvents = 'none';
  isPinned = false;
  pinnedStar = null;
  debugLog('Info popup hidden');
}

// Обработчики событий мыши
function handleMouseMove(e) {
  // Если табличка закреплена, не показываем hover-эффекты
  if (isPinned) {
    return;
  }
  
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  let hoveredStar = null;
  let foundHover = false;
  
  // Проверяем наведение на интерактивные звёзды
  stars.forEach(star => {
    if (star.isPointInside(mouseX, mouseY)) {
      star.hovered = true;
      hoveredStar = star;
      foundHover = true;
      canvas.style.cursor = 'pointer';
    } else {
      star.hovered = false;
    }
  });
  
  if (foundHover && hoveredStar) {
    showInfo(hoveredStar, e.clientX, e.clientY, false);
  } else {
    showInfo(null);
    canvas.style.cursor = 'default';
  }
}

function handleMouseLeave() {
  // Если табличка закреп��ена, не скрываем её
  if (isPinned) {
    return;
  }
  
  stars.forEach(star => {
    star.hovered = false;
  });
  showInfo(null);
  canvas.style.cursor = 'default';
  debugLog('Mouse left canvas');
}

function handleClick(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  let clickedStar = null;
  
  // Проверяем клик по звёздам
  stars.forEach(star => {
    if (star.isPointInside(mouseX, mouseY)) {
      clickedStar = star;
    }
  });
  
  if (clickedStar) {
    debugLog(`Clicked on star: ${clickedStar.title}`);
    
    // Если кликнули на уже закреплённую звезду, скрываем табличку
    if (isPinned && pinnedStar === clickedStar) {
      hideInfo();
    } else {
      // Закрепляем табличку для новой звезды
      showInfo(clickedStar, e.clientX, e.clientY, true);
    }
    
    // Создаём эффект клика
    createClickEffect(mouseX, mouseY);
  }
}

// Обработчик клика по документу для скрытия таблички при клике вне её
function handleDocumentClick(e) {
  if (!isPinned) return;
  
  // Проверяем, был ли клик по canvas или по всплывающей табличке
  const clickedOnCanvas = e.target === canvas;
  const clickedOnPopup = infoPopup.contains(e.target);
  
  // Если клик был не по canvas и не по табличке, скрываем её
  if (!clickedOnCanvas && !clickedOnPopup) {
    hideInfo();
  }
}

// ... existing code ... (resize функция остается без изменений)

// Функция изменения размера canvas
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  debugLog(`Canvas resized to: ${canvas.width}x${canvas.height}`);
  
  // Пересчитываем позиции звёзд при изменении размера
  stars.forEach(star => {
    star.updatePosition();
  });
  
  // Пересоздаём фоновые звёзды
  createBackgroundStars();
}

// ... existing code ... (animate функция остается без изменений)

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
  
  // Обновляем и рисуем метеориты (поверх звёзд)
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
    debugLog('Starting initialization...');
    
    // Проверяем наличие необходимых элементов
    if (!canvas) {
      throw new Error('Canvas element #stars-canvas not found');
    }
    if (!infoPopup) {
      throw new Error('Info popup element #info-popup not found');
    }
    
    debugLog('DOM elements found, loading stars data...');
    
    // Загружаем данные звёзд
    const data = await loadJSON('data/stars.json');
    
    if (data && Array.isArray(data)) {
      debugLog(`Loaded ${data.length} stars from JSON`);
      
      // Создаём интерактивные звёзды
      stars = data.map(starData => {
        // Проверяем корректность данных
        if (typeof starData.x !== 'number' || typeof starData.y !== 'number') {
          console.warn('Invalid star coordinates:', starData);
          return null;
        }
        if (starData.x < 0 || starData.x > 1 || starData.y < 0 || starData.y > 1) {
          console.warn('Star coordinates out of range (0-1):', starData);
        }
        
        return new InteractiveStar(starData);
      }).filter(star => star !== null); // Удаляем некорректные звёзды
      
      debugLog(`Created ${stars.length} interactive stars`);
    } else {
      console.warn('Failed to load stars data, using demo data');
      
      // Демо-данные
      stars = [
        new InteractiveStar({
          x: 0.2, y: 0.3, type: 'contact',
          title: 'Email', description: 'Свяжитесь со мной по почте',
          links: [{ text: 'Написать', url: 'mailto:test@example.com' }]
        }),
        new InteractiveStar({
          x: 0.7, y: 0.4, type: 'tech',
          title: 'JavaScript', description: 'Основной язык программирования',
          links: []
        }),
        new InteractiveStar({
          x: 0.5, y: 0.6, type: 'project',
          title: 'Проект', description: 'Мой последний проект',
          links: [{ text: 'GitHub', url: 'https://github.com' }]
        })
      ];
      
      debugLog(`Created ${stars.length} demo stars`);
    }
    
    // Создаём фоновые звёзды и метеориты
    createBackgroundStars();
    createMeteors();
    
    // Настраиваем обработчики событий
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);
    
    // Добавляем обработчик клика по документу
    document.addEventListener('click', handleDocumentClick);
    
    // Включаем pointer-events для canvas
    canvas.style.pointerEvents = 'auto';
    
    debugLog('Event listeners attached, starting animation...');
    
    // Запускаем анимацию
    animate();
    
    debugLog('Initialization complete!');
    
  } catch (error) {
    console.error('Error during initialization:', error);
    
    // Показываем ошибку пользователю
    if (infoPopup) {
      infoPopup.innerHTML = `<strong>Ошибка загрузки</strong><br>Не удалось загрузить звёздное небо: ${error.message}`;
      infoPopup.style.left = '50px';
      infoPopup.style.top = '100px';
      infoPopup.classList.remove('hidden');
    }
  }
}

// Устанавливаем обработчик изменения размера и инициализируем canvas
window.addEventListener('resize', resize);
resize();

// Очистка при выгрузке страницы
window.addEventListener('beforeunload', () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  
  // Удаляем обработчик клика по документу
  document.removeEventListener('click', handleDocumentClick);
});

// Запускаем инициализацию после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
