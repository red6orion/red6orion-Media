<link rel="icon" href="assets/images/favicon.png">

<style>
  #custom-cursor-rocket {
    position: fixed;
    width: 24px;
    height: 24px;
    pointer-events: none;
    z-index: 9999;
    background-image: url('assets/images/favicon.png');
    background-size: contain;
    background-repeat: no-repeat;
    transition: transform 0.05s ease;
  }
  
  html {
    cursor: none;
  }
  
  @media (hover: none) {
    #custom-cursor-rocket, html { cursor: default; }
  }
</style>

<div id="custom-cursor-rocket"></div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const rocket = document.getElementById('custom-cursor-rocket');
    
    document.addEventListener('mousemove', function(e) {
      rocket.style.left = (e.pageX + 10) + 'px';
      rocket.style.top = (e.pageY + 10) + 'px';
      const angle = Math.atan2(e.movementY, e.movementX) * 180 / Math.PI;
      rocket.style.transform = `rotate(${angle + 90}deg)`;
    });
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
