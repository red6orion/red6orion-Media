// Вспомогательные функции

// Получить случайное число в диапазоне
export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Линейная интерполяция
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Загрузка JSON
export async function loadJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Ошибка загрузки ${url}: ${response.statusText}`);
  return await response.json();
}
