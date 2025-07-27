// Основной класс для визуализации сети
class NetworkVisualization {
    constructor(canvasId, dataUrl) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.dataUrl = dataUrl;
        
        // Параметры визуализации
        this.nodes = [];
        this.links = [];
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.selectedNode = null;
        this.hoveredNode = null;

        // Настройки
        this.minScale = 0.1;
        this.maxScale = 3;
        this.nodeMinRadius = 8;
        this.nodeMaxRadius = 30;

        this.init();
    }

    async init() {
        this.setupCanvas();
        this.setupEventListeners();
        await this.loadData();
        this.centerView();
        this.animate();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * window.devicePixelRatio;
            this.canvas.height = rect.height * window.devicePixelRatio;
            this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
        };

        resizeCanvas();
        window.addEventListener('resize', Utils.debounce(resizeCanvas, 250));
    }

    setupEventListeners() {
        // Обработчики мыши
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));

        // Обработчики касаний для мобильных устройств
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Кнопки управления
        document.getElementById('resetZoom')?.addEventListener('click', () => this.resetZoom());
        document.getElementById('centerView')?.addEventListener('click', () => this.centerView());
    }

    async loadData() {
        try {
            const response = await fetch(this.dataUrl);
            const data = await response.json();
            this.nodes = data.nodes || [];
            this.links = data.links || [];
            this.updateStats();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            // Загружаем демо-данные при ошибке
            this.loadDemoData();
        }
    }

    loadDemoData() {
        this.nodes = [
            { id: 'center', label: 'Центральный узел', x: 0, y: 0, size: 3, color: '#4ecdc4' },
            { id: 'node1', label: 'Узел 1', x: 100, y: 50, size: 2, color: '#ff6b6b' },
            { id: 'node2', label: 'Узел 2', x: -80, y: 80, size: 1.5, color: '#feca57' },
            { id: 'node3', label: 'Узел 3', x: 60, y: -90, size: 2, color: '#45b7d1' }
        ];
        this.links = [
            { source: 'center', target: 'node1' },
            { source: 'center', target: 'node2' },
            { source: 'center', target: 'node3' }
        ];
        this.updateStats();
    }

    updateStats() {
        const nodeCountEl = document.getElementById('nodeCount');
        const linkCountEl = document.getElementById('linkCount');
        if (nodeCountEl) nodeCountEl.textContent = this.nodes.length;
        if (linkCountEl) linkCountEl.textContent = this.links.length;
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - this.offsetX) / this.scale,
            y: (e.clientY - rect.top - this.offsetY) / this.scale
        };
    }

    getTouchPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        return {
            x: (touch.clientX - rect.left - this.offsetX) / this.scale,
            y: (touch.clientY - rect.top - this.offsetY) / this.scale
        };
    }

    findNodeAt(x, y) {
        for (let node of this.nodes) {
            const radius = this.nodeMinRadius + (node.size || 1) * 8;
            if (Utils.isPointInCircle(x, y, node.x, node.y, radius)) {
                return node;
            }
        }
        return null;
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        const node = this.findNodeAt(pos.x, pos.y);
        
        if (node) {
            this.selectedNode = node;
            this.isDragging = true;
            this.dragStartX = pos.x - node.x;
            this.dragStartY = pos.y - node.y;
        } else {
            this.isDragging = true;
            this.dragStartX = e.clientX - this.offsetX;
            this.dragStartY = e.clientY - this.offsetY;
        }
    }

    handleMouseMove(e) {
        const pos = this.getMousePos(e);
        
        if (this.isDragging) {
            if (this.selectedNode) {
                // Перетаскивание узла
                this.selectedNode.x = pos.x - this.dragStartX;
                this.selectedNode.y = pos.y - this.dragStartY;
            } else {
                // Перетаскивание всей карты
                this.offsetX = e.clientX - this.dragStartX;
                this.offsetY = e.clientY - this.dragStartY;
            }
        } else {
            // Подсветка узла при наведении
            this.hoveredNode = this.findNodeAt(pos.x, pos.y);
        }
    }

    handleMouseUp(e) {
        this.isDragging = false;
        this.selectedNode = null;
    }

    handleWheel(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Utils.clamp(this.scale * scaleFactor, this.minScale, this.maxScale);
        
        if (newScale !== this.scale) {
            this.offsetX = mouseX - (mouseX - this.offsetX) * (newScale / this.scale);
            this.offsetY = mouseY - (mouseY - this.offsetY) * (newScale / this.scale);
            this.scale = newScale;
        }
    }

    // Обработчики касаний
    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const pos = this.getTouchPos(e);
            const node = this.findNodeAt(pos.x, pos.y);
            
            if (node) {
                this.selectedNode = node;
                this.isDragging = true;
                this.dragStartX = pos.x - node.x;
                this.dragStartY = pos.y - node.y;
            } else {
                this.isDragging = true;
                this.dragStartX = e.touches[0].clientX - this.offsetX;
                this.dragStartY = e.touches[0].clientY - this.offsetY;
            }
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1 && this.isDragging) {
            const pos = this.getTouchPos(e);
            
            if (this.selectedNode) {
                this.selectedNode.x = pos.x - this.dragStartX;
                this.selectedNode.y = pos.y - this.dragStartY;
            } else {
                this.offsetX = e.touches[0].clientX - this.dragStartX;
                this.offsetY = e.touches[0].clientY - this.dragStartY;
            }
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.isDragging = false;
        this.selectedNode = null;
    }

    resetZoom() {
        this.scale = 1;
        this.centerView();
    }

    centerView() {
        if (this.nodes.length === 0) return;
        
        const bounds = this.getNodesBounds();
        const canvasWidth = this.canvas.clientWidth;
        const canvasHeight = this.canvas.clientHeight;
        
        this.offsetX = canvasWidth / 2 - (bounds.centerX * this.scale);
        this.offsetY = canvasHeight / 2 - (bounds.centerY * this.scale);
    }

    getNodesBounds() {
        if (this.nodes.length === 0) return { centerX: 0, centerY: 0 };
        
        let minX = this.nodes[0].x;
        let maxX = this.nodes[0].x;
        let minY = this.nodes[0].y;
        let maxY = this.nodes[0].y;
        
        for (let node of this.nodes) {
            minX = Math.min(minX, node.x);
            maxX = Math.max(maxX, node.x);
            minY = Math.min(minY, node.y);
            maxY = Math.max(maxY, node.y);
        }
        
        return {
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2
        };
    }

    render() {
        const ctx = this.ctx;
        const canvasWidth = this.canvas.clientWidth;
        const canvasHeight = this.canvas.clientHeight;
        
        // Очистка canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Применение трансформации
        ctx.save();
        ctx.translate(this.offsetX, this.offsetY);
        ctx.scale(this.scale, this.scale);
        
        // Рендер связей
        this.renderLinks(ctx);
        
        // Рендер узлов
        this.renderNodes(ctx);
        
        ctx.restore();
    }

    renderLinks(ctx) {
        ctx.strokeStyle = '#404040';
        ctx.lineWidth = 2;
        
        for (let link of this.links) {
            const sourceNode = this.nodes.find(n => n.id === link.source);
            const targetNode = this.nodes.find(n => n.id === link.target);
            
            if (sourceNode && targetNode) {
                ctx.beginPath();
                ctx.moveTo(sourceNode.x, sourceNode.y);
                ctx.lineTo(targetNode.x, targetNode.y);
                ctx.stroke();
            }
        }
    }

    renderNodes(ctx) {
        for (let node of this.nodes) {
            const radius = this.nodeMinRadius + (node.size || 1) * 8;
            const isHovered = this.hoveredNode === node;
            const isSelected = this.selectedNode === node;
            
            // Тень для выделенного узла
            if (isSelected || isHovered) {
                ctx.shadowColor = node.color || '#4ecdc4';
                ctx.shadowBlur = 20;
            }
            
            // Основной круг узла
            ctx.fillStyle = node.color || '#4ecdc4';
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Внутренний круг для эффекта
            ctx.fillStyle = Utils.hexToRgba(node.color || '#4ecdc4', 0.3);
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
            
            // Сброс тени
            ctx.shadowBlur = 0;
            
            // Текст метки
            if (node.label) {
                ctx.fillStyle = '#ffffff';
                ctx.font = `${12 + (node.size || 1) * 2}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Тень для текста
                ctx.shadowColor = '#000000';
                ctx.shadowBlur = 3;
                ctx.fillText(node.label, node.x, node.y + radius + 20);
                ctx.shadowBlur = 0;
            }
        }
    }

    animate() {
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}
