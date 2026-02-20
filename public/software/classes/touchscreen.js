export class TouchScreen {
    constructor(width, height, x = 0, y = 0, id, element) {
        if (!element) throw new Error("A canvas element is required");
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.id = id;
        this.element = element;

        // Set canvas pixel buffer
        this.element.width = width;
        this.element.height = height;

        // Context setup
        this.ctx = this.element.getContext("2d");
        this.ctx.fillStyle = "lightgreen";
        this.ctx.strokeStyle = "lime";
        this.ctx.lineWidth = 1;
        this.ctx.textBaseline = "top";
        this.ctx.font = "16px 'LCD', monospace";

        // Store event callbacks
        this.handlers = [];

        // Track dragging for mouse
        this.isMouseDown = false;

        // Bind events
        this._bindEvents();
    }

    // --- Drawing methods ---
    addText(text, x, y) { this.ctx.fillStyle = "lime";this.ctx.fillText(text, x, y); }
    addSmallText(text, x, y) { this.ctx.fillText(text, x, y); }
    addLine(color, sx, sy, ex, ey) {
        this.ctx.beginPath();
        this.ctx.moveTo(sx, sy);
        this.ctx.lineTo(ex, ey);
        this.ctx.strokeStyle = color || this.ctx.strokeStyle;
        this.ctx.stroke();
    }
    addRect(color, x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x1, y2);
        this.ctx.closePath();
        this.ctx.strokeStyle = color || this.ctx.strokeStyle;
        this.ctx.stroke();
    }
    addFilledRect(color, x1, y1, x2, y2) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x1, y1, x2, y2);
    }
    addCircle(color, cx, cy, r) {
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        this.ctx.strokeStyle = color || this.ctx.strokeStyle;
        this.ctx.stroke();
    }
    // Draw an arc from startAngle to endAngle (in degrees)
    addArc(color, cx, cy, r, startAngle, endAngle, lineWidth = 1) {
        this.ctx.beginPath();
        this.ctx.arc(
            cx,
            cy,
            r,
            (startAngle * Math.PI) / 180,
            (endAngle * Math.PI) / 180
        );
        this.ctx.strokeStyle = color || this.ctx.strokeStyle;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
    }

    // Draw a circular gauge filled proportionally to percent (0-100)
    addGauge(color, percent, cx, cy, r, lineWidth = 5) {
        const startAngle = -90; // start at top
        const endAngle = startAngle + (360 * percent) / 100;

        // Draw background circle (grey)
        this.addArc('#ccc', cx, cy, r, 0, 360, lineWidth);

        // Draw the filled portion
        this.addArc(color || 'lime', cx, cy, r, startAngle, endAngle, lineWidth);
    }

    clearRect() { this.ctx.clearRect(0, 0, this.width, this.height); }

    // --- Interaction methods ---
    onTouch(callback) {
        if (typeof callback === "function") this.handlers.push(callback);
    }

    _bindEvents() {
        this.element.addEventListener("click", (e) => this._handleOnClick(e));
        // Mouse events
        //this.element.addEventListener("mousedown", (e) => this._handleMouseDown(e));
        //this.element.addEventListener("mousemove", (e) => this._handleMouseMove(e));
        //this.element.addEventListener("mouseup", (e) => this._handleMouseUp(e));
        //this.element.addEventListener("mouseleave", (e) => this._handleMouseUp(e));

        // Touch events
        //this.element.addEventListener("touchstart", (e) => this._handleTouch(e));
        //this.element.addEventListener("touchmove", (e) => this._handleTouch(e));
        //this.element.addEventListener("touchend", (e) => this._handleTouch(e));
    }

    _handleOnClick(e) {
        this._emit([{ x: e.offsetX, y: e.offsetY, type: "onclick" }]);
    }

    _handleMouseDown(e) {
        this.isMouseDown = true;
        this._emit([{ x: e.offsetX, y: e.offsetY, type: "mousedown" }]);
    }

    _handleMouseMove(e) {
        if (!this.isMouseDown) return;
        this._emit([{ x: e.offsetX, y: e.offsetY, type: "mousemove" }]);
    }

    _handleMouseUp(e) {
        if (!this.isMouseDown) return;
        this.isMouseDown = false;
        this._emit([{ x: e.offsetX, y: e.offsetY, type: "mouseup" }]);
    }

    _handleTouch(e) {
        e.preventDefault();
        const touches = [];
        for (let t of e.touches) {
            const rect = this.element.getBoundingClientRect();
            touches.push({
                x: t.clientX - rect.left,
                y: t.clientY - rect.top,
                type: e.type
            });
        }
        this._emit(touches);
    }

    _emit(touches) {
        this.handlers.forEach(handler => handler(touches));
    }
}
