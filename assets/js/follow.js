document.addEventListener('DOMContentLoaded', function() {
  const duck = document.getElementById('duck');
  let duckX = 0, duckY = 0;
  let mouseX = 0, mouseY = 0;
  
  // Настройки (можно менять)
  const config = {
    speed: 1.2,          // Скорость движения (пикселей за кадр)
    targetOffsetX: 20,   // Смещение от курсора
    targetOffsetY: 20,
    appearDelay: 1000    // Задержка перед появлением (мс)
  };

  // Показываем утку с задержкой
  setTimeout(() => {
    duck.style.opacity = '1';
    
    // Стартовая позиция - текущее положение мыши
    duckX = mouseX;
    duckY = mouseY;
    updatePosition();
  }, config.appearDelay);

  // Обновление позиции утки
  function updatePosition() {
    const targetX = mouseX + config.targetOffsetX;
    const targetY = mouseY + config.targetOffsetY;
    
    // Рассчитываем направление
    const dx = targetX - duckX;
    const dy = targetY - duckY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Движение с постоянной скоростью
    if (distance > 2) {
      duckX += (dx / distance) * config.speed;
      duckY += (dy / distance) * config.speed;
    }
    
    // Применяем позицию
    duck.style.left = duckX + 'px';
    duck.style.top = duckY + 'px';
    
    // Поворот
    if (distance > 5) {
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      duck.style.transform = `rotate(${angle + 90}deg)`;
    }
    
    requestAnimationFrame(updatePosition);
  }

  // Отслеживание курсора
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
});
