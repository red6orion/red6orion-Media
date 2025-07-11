document.addEventListener('DOMContentLoaded', () => {
  const goose = document.getElementById('follow-goose');
  let mouseX = 0, mouseY = 0;
  let gooseX = 0, gooseY = 0;
  let isVisible = false;

  // Плавное появление через 2 секунды
  setTimeout(() => {
    goose.style.opacity = '1';
    isVisible = true;
  }, 2000);

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    if (!isVisible) return;

    // Задержка движения (персонаж отстает от курсора)
    gooseX += (mouseX - gooseX - 40) * 0.1;
    gooseY += (mouseY - gooseY - 40) * 0.1;

    goose.style.left = `${gooseX}px`;
    goose.style.top = `${gooseY}px`;

    // Поворот в направлении движения
    const angle = Math.atan2(mouseY - gooseY, mouseX - gooseX) * 180 / Math.PI;
    goose.style.transform = `rotate(${angle}deg)`;

    requestAnimationFrame(animate);
  }

  animate();
});
