// Export the Screen class as a module
export class Screen {
    constructor(width, height, x = 0, y = 0, id, element) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.id = id;
        this.element = element; // expects a <canvas> element
        // ensure the canvas drawing buffer matches requested size
        if (this.element) {
            // set <canvas> pixel buffer size (separate from CSS size)
            this.element.width = this.width;
            this.element.height = this.height;
            // store context for reuse and set sensible defaults
            this.ctx = this.element.getContext("2d");
            // default drawing style suited to the page (green on black)
            this.ctx.fillStyle = "lightgreen";
            this.ctx.strokeStyle = "lime";
            this.ctx.lineWidth = 1;
            // draw text from the top (so y=0 places text at top)
            this.ctx.textBaseline = "top";
            // include font fallback and explicit size; the imported 'LCD' font may take time to load
            this.ctx.font = "16px 'LCD', monospace";
        }
    }

    addText(text, x, y) {
        const ctx = this.ctx || this.element.getContext("2d");
        // ensure visible color and sensible baseline
        if (!ctx.fillStyle) ctx.fillStyle = "lightgreen";
        // use top baseline so small y values are visible
        ctx.textBaseline = ctx.textBaseline || "top";
        ctx.fillText(text, x, y);
    }
    addSmallText(text, x, y) {
        const ctx = this.ctx || this.element.getContext("2d");
        // ensure visible color and sensible baseline
        if (!ctx.fillStyle) ctx.fillStyle = "lightgreen";
        // use top baseline so small y values are visible
        ctx.textBaseline = ctx.textBaseline || "top";
        ctx.fillText(text, x, y);
    }

    addLine(color, sx, sy, ex, ey) {
        const ctx = this.ctx || this.element.getContext("2d");
        ctx.beginPath(); // ensure a new path for each line
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = color || ctx.strokeStyle || "lime";
        ctx.stroke();
    }
    addRect(color, x1, y1, x2, y2) {
        const ctx = this.ctx || this.element.getContext("2d");
        ctx.beginPath(); // ensure a new path for each line
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y1);
        ctx.lineTo(x2, y2);
        ctx.lineto(x1, y2);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = color || ctx.strokeStyle || "lime";
        ctx.stroke();
    }
    addCircle(color, cx, cy, r) {
        const ctx = this.ctx || this.element.getContext("2d");
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2*Math.PI);
        ctx.strokeStyle = color || ctx.strokeStyle || "lime";
        ctx.stroke();
    }
    clearRect() {
        const ctx = this.ctx || this.element.getContext("2d");
        ctx.clearRect(0, 0, this.width, this.height);
    }
}
