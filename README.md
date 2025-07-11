<link rel="icon" href="assets/images/favicon.png">

<style>
  #duck-cursor {
    position: fixed;
    width: 60px;
    height: 60px;
    background-image: url('assets/images/xz.png');
    background-size: contain;
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.3s ease; /* Плавность поворота */
  }
</style>

<div id="rocket-cursor"></div>

<script>
// Проверяем загрузку DOM
document.addEventListener('DOMContentLoaded', function() {
  const rocket = document.getElementById('rocket-cursor');
  let posX = 0, posY = 0;
  let mouseX = 0, mouseY = 0;
  
  // Плавное следование за курсором
  function followCursor() {
    posX += (mouseX - posX - 16) * 0.2;
    posY += (mouseY - posY - 16) * 0.2;
    
    rocket.style.left = posX + 'px';
    rocket.style.top = posY + 'px';
    
    requestAnimationFrame(followCursor);
  }
  
  // Отслеживание положения мыши
  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Поворот ракеты
    const angle = Math.atan2(e.movementY, e.movementX) * 180 / Math.PI;
    rocket.style.transform = `rotate(${angle + 90}deg)`;
  });
  
  followCursor();
});
</script>

# 🚀 Привет, я Алексей!

Добро пожаловать на мой сайт-портфолио.

### 🔥 Обо мне  
Я увлекаюсь программированием и создаю проекты на Python.  

[Подробнее →](about.md)

### 📫 Контакты  
- **Telegram**: [@red6orion](https://t.me/red6orion)  
- **Почта**: [aleksei.ryabochkin@yandex.ru](mailto:aleksei.ryabochkin@yandex.ru)  

© 2025 Алексей. Сайт работает на [GitHub Pages](https://pages.github.com/).
