// cds.js
import { Screen } from './software/classes/screen.js';

const canvas = document.getElementById("central-data-screen");
const screen = new Screen(510, 320, 0, 0, 'cds', canvas);

let cdsData = null;
let currentPageKey = null;
let scrollOffset = 0;
const lineHeight = 18;
const bottomReserved = 40; // reserved space for softkeys
let maxLinesVisible = Math.floor((screen.height - bottomReserved - 25) / lineHeight);

// Load JSON data
async function loadCDSData() {
    const response = await fetch('/libraries/cds.json');
    cdsData = await response.json();
    if (cdsData && cdsData.pages) {
        loadPage(Object.keys(cdsData.pages)[0]); // load first page by default
    }
}

// Draw the bottom CDS layout (lines, softkey divisions, and text)
function drawLowerLayout(bottomButtons = {}) {
    const softkeyY = 282; // top of bottom area
    screen.addLine("lime", 0, 280, 510, 280); // horizontal bottom
    for (let i = 0; i < 6; i++) {
        const x = 85 * i;
        screen.addLine("lime", x, 280, x, 320); // vertical divisions for softkeys

        // Draw label text centered in each softkey
        const label = bottomButtons[`cds${i + 1}`];
        if (label) {
            // center text in 85px wide softkey
            const textX = x + 42; // center of softkey (half of 85)
            const textY = 295; // vertical position within bottom reserved area
            screen.addText(label, textX - (label.length * 4), textY); // crude centering
        }
    }
}

// Load a page by key
function loadPage(pageKey) {
    if (!cdsData || !cdsData.pages[pageKey]) return;
    currentPageKey = pageKey;
    scrollOffset = 0;
    const page = cdsData.pages[pageKey];

    screen.clearRect();
    drawLowerLayout(page.bottomButtons);

    // Draw page title
    screen.addText(page.title, 5, 5);

    // Draw page lines (scrollable)
    page.lines.forEach((line, index) => {
        const y = 25 + (index - scrollOffset) * lineHeight;
        if (y >= 25 && y <= screen.height - bottomReserved - lineHeight) {
            screen.addText(line, 10, y);
        }
    });

    updateButtons(page.bottomButtons);
}

// Update CDS buttons dynamically
function updateButtons(buttonMap) {
    if (!buttonMap) return;

    for (let i = 1; i <= 6; i++) {
        const btn = document.getElementById(`cds${i}`);
        if (!btn) continue;

        btn.onclick = () => {
            const action = buttonMap[`cds${i}`];
            if (!action) return;

            if (action === 'SCROLL_UP') scrollPage(-1);
            else if (action === 'SCROLL_DOWN') scrollPage(1);
            else loadPage(action); // load another page key
        };
    }
}

// Scroll page by delta
function scrollPage(direction) {
    if (!cdsData || !currentPageKey) return;
    const page = cdsData.pages[currentPageKey];
    const maxScroll = Math.max(0, page.lines.length - maxLinesVisible);
    scrollOffset = Math.min(maxScroll, Math.max(0, scrollOffset + direction));
    loadPage(currentPageKey);
}

// Initialize CDS
loadCDSData();
