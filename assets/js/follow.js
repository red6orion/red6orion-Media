document.addEventListener('DOMContentLoaded', function() {
  const duck = document.getElementById('duck-cursor');
  let duckX = window.innerWidth / 2; // Стартовая позиция
  let duckY = window.innerHeight / 2;
  
  // Настройки (регулируйте эти значения)
  const settings = {
    speed: 1.5,          // Пикселей за кадр (рекомендуем 0.5-3)
    rotationSpeed: 0.1,   // Плавность поворота (0.05-0.3)
    targetOffsetX: 30,    // Смещение от курсора
    targetOffsetY: 30
  };

  function moveDuck() {
    // Получаем позицию курсора со смещением
    const targetX = mouseX + settings.targetOffsetX;
    const targetY = mouseY + settings.targetOffsetY;
    
    // Рассчитываем направление
    const dx = targetX - duckX;
    const dy = targetY - duckY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Двигаемся с постоянной скоростью
    if (distance > 5) {
      duckX += (dx / distance) * settings.speed;
      duckY += (dy / distance) * settings.speed;
    }
    
    // Применяем позицию
    duck.style.left = duckX + 'px';
    duck.style.top = duckY + 'px';
    
    // Плавный поворот
    if (distance > 10) {
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      duck.style.transform = `rotate(${angle + 90}deg)`;
    }
    
    requestAnimationFrame(moveDuck);
  }

  // Текущая позиция курсора
  let mouseX = 0;
  let mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Запуск анимации
  moveDuck();
});
