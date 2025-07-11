document.addEventListener('DOMContentLoaded', function() {
  const follower = document.getElementById('rocket-cursor'); // Или goose-cursor
  let posX = 0, posY = 0;
  let mouseX = 0, mouseY = 0;
  
  // Настройки анимации (регулируйте эти значения)
  const settings = {
    speed: 0.05,       // Чем меньше (0.01-0.2), тем медленнее (было 0.2)
    offsetX: 16,      // Смещение по горизонтали
    offsetY: 16,      // Смещение по вертикали
    rotationOffset: 90 // Коррекция угла поворота
  };
  
  function followCursor() {
    // Плавное движение с новой скоростью
    posX += (mouseX - posX - settings.offsetX) * settings.speed;
    posY += (mouseY - posY - settings.offsetY) * settings.speed;
    
    follower.style.left = posX + 'px';
    follower.style.top = posY + 'px';
    
    requestAnimationFrame(followCursor);
  }
  
  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Поворот персонажа
    const angle = Math.atan2(e.movementY, e.movementX) * 180 / Math.PI;
    follower.style.transform = `rotate(${angle + settings.rotationOffset}deg)`;
  });
  
  followCursor();
});
