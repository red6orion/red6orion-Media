// Утилиты для работы с сетью
class Utils {
    // Вычисление расстояния между двумя точками
    static distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    // Проверка попадания точки в окружность
    static isPointInCircle(px, py, cx, cy, radius) {
        return this.distance(px, py, cx, cy) <= radius;
    }

    // Ограничение значения в диапазоне
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // Линейная интерполяция
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // Преобразование цвета из hex в rgba
    static hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Генерация случайного цвета
    static randomColor() {
        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
            '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd',
            '#00d2d3', '#ff9f43', '#10ac84', '#ee5a24'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Дебаунс функции
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}
