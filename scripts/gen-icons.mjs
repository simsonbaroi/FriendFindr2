/**
 * Generates FriendFindr branded icon.png and splash.png
 * Pure Node.js — no external dependencies needed.
 */
import { createDeflate } from "zlib";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { Writable, Readable } from "stream";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../artifacts/friendfindr/assets/images");

// ─── CRC32 ────────────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const lenBuf = Buffer.allocUnsafe(4);
  lenBuf.writeUInt32BE(data.length);
  const crcBuf = Buffer.allocUnsafe(4);
  const crcInput = Buffer.concat([typeBytes, data]);
  crcBuf.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────
function makeCanvas(w, h, fill = [0, 0, 0, 255]) {
  const data = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    data[i * 4] = fill[0];
    data[i * 4 + 1] = fill[1];
    data[i * 4 + 2] = fill[2];
    data[i * 4 + 3] = fill[3];
  }
  return { data, w, h };
}

function setPixel(canvas, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= canvas.w || y < 0 || y >= canvas.h) return;
  const i = (y * canvas.w + x) * 4;
  // alpha blending
  const src_a = a / 255;
  const dst_a = canvas.data[i + 3] / 255;
  const out_a = src_a + dst_a * (1 - src_a);
  if (out_a === 0) return;
  canvas.data[i] = ((r * src_a + canvas.data[i] * dst_a * (1 - src_a)) / out_a) | 0;
  canvas.data[i + 1] = ((g * src_a + canvas.data[i + 1] * dst_a * (1 - src_a)) / out_a) | 0;
  canvas.data[i + 2] = ((b * src_a + canvas.data[i + 2] * dst_a * (1 - src_a)) / out_a) | 0;
  canvas.data[i + 3] = (out_a * 255) | 0;
}

function fillRect(canvas, x, y, rw, rh, r, g, b, a = 255) {
  for (let dy = 0; dy < rh; dy++)
    for (let dx = 0; dx < rw; dx++)
      setPixel(canvas, x + dx, y + dy, r, g, b, a);
}

function fillCircle(canvas, cx, cy, radius, r, g, b, a = 255) {
  const r2 = radius * radius;
  for (let dy = -radius; dy <= radius; dy++)
    for (let dx = -radius; dx <= radius; dx++)
      if (dx * dx + dy * dy <= r2)
        setPixel(canvas, cx + dx, cy + dy, r, g, b, a);
}

// Rounded rectangle (approximation via clipping corners)
function fillRoundRect(canvas, x, y, rw, rh, radius, r, g, b, a = 255) {
  fillRect(canvas, x + radius, y, rw - radius * 2, rh, r, g, b, a);
  fillRect(canvas, x, y + radius, rw, rh - radius * 2, r, g, b, a);
  fillCircle(canvas, x + radius, y + radius, radius, r, g, b, a);
  fillCircle(canvas, x + rw - radius, y + radius, radius, r, g, b, a);
  fillCircle(canvas, x + radius, y + rh - radius, radius, r, g, b, a);
  fillCircle(canvas, x + rw - radius, y + rh - radius, radius, r, g, b, a);
}

// Thick horizontal line
function hline(canvas, x, y, len, thick, r, g, b, a = 255) {
  fillRect(canvas, x, y - thick / 2 | 0, len, thick, r, g, b, a);
}
// Thick vertical line
function vline(canvas, x, y, len, thick, r, g, b, a = 255) {
  fillRect(canvas, x - thick / 2 | 0, y, thick, len, r, g, b, a);
}

// Draw an "F" letter centered at (cx, cy) with given height
function drawLetterF(canvas, cx, cy, height, color) {
  const [r, g, b] = color;
  const stroke = Math.max(2, (height * 0.15) | 0);
  const w = (height * 0.6) | 0;
  const h = height;
  const x0 = cx - w / 2 | 0;
  const y0 = cy - h / 2 | 0;

  // vertical stem
  fillRect(canvas, x0, y0, stroke, h, r, g, b);
  // top bar
  fillRect(canvas, x0, y0, w, stroke, r, g, b);
  // middle bar (at ~55%)
  const midY = y0 + (h * 0.45) | 0;
  fillRect(canvas, x0, midY, (w * 0.78) | 0, stroke, r, g, b);
}

// ─── PNG encoder ─────────────────────────────────────────────────────────────
function encodePNG(canvas) {
  const { data, w, h } = canvas;
  // Build raw scanlines with filter byte 0 (None)
  const raw = Buffer.allocUnsafe(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0; // filter type None
    for (let x = 0; x < w; x++) {
      const src = (y * w + x) * 4;
      const dst = y * (1 + w * 4) + 1 + x * 4;
      raw[dst] = data[src];
      raw[dst + 1] = data[src + 1];
      raw[dst + 2] = data[src + 2];
      raw[dst + 3] = data[src + 3];
    }
  }

  const ihdrData = Buffer.allocUnsafe(13);
  ihdrData.writeUInt32BE(w, 0);
  ihdrData.writeUInt32BE(h, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  return new Promise((resolve, reject) => {
    const chunks = [
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
      chunk("IHDR", ihdrData),
    ];
    const bufs = [];
    const deflate = createDeflate({ level: 6 });
    deflate.on("data", (d) => bufs.push(d));
    deflate.on("end", () => {
      chunks.push(chunk("IDAT", Buffer.concat(bufs)));
      chunks.push(chunk("IEND", Buffer.alloc(0)));
      resolve(Buffer.concat(chunks));
    });
    deflate.on("error", reject);
    deflate.end(raw);
  });
}

async function savePNG(canvas, filename) {
  const buf = await encodePNG(canvas);
  await import("fs/promises").then((m) => m.writeFile(filename, buf));
  console.log(`✓ Wrote ${filename} (${(buf.length / 1024).toFixed(1)} KB)`);
}

// ─── Generate icon.png (1024×1024) ───────────────────────────────────────────
async function genIcon() {
  const SIZE = 1024;
  const BG = [9, 15, 26]; // #090F1A
  const CYAN = [0, 196, 216]; // #00C4D8
  const WHITE = [255, 255, 255];

  const c = makeCanvas(SIZE, SIZE, [...BG, 255]);

  // Cyan rounded square: 70% of canvas, centered, radius ~22% of square size
  const sq = (SIZE * 0.68) | 0;
  const sqX = ((SIZE - sq) / 2) | 0;
  const sqY = ((SIZE - sq) / 2) | 0;
  const sqR = (sq * 0.22) | 0;
  fillRoundRect(c, sqX, sqY, sq, sq, sqR, ...CYAN);

  // Subtle inner glow — lighter cyan ring
  const glow = (sq * 0.94) | 0;
  const glowX = ((SIZE - glow) / 2) | 0;
  const glowY = ((SIZE - glow) / 2) | 0;
  const glowR = (glow * 0.22) | 0;
  fillRoundRect(c, glowX, glowY, glow, glow, glowR, 30, 220, 240, 40);

  // White "F"
  const fH = (sq * 0.52) | 0;
  drawLetterF(c, SIZE / 2 | 0, SIZE / 2 | 0, fH, WHITE);

  await savePNG(c, `${OUT}/icon.png`);
}

// ─── Generate splash.png (2048×2048) ─────────────────────────────────────────
async function genSplash() {
  const W = 2048;
  const H = 2048;
  const BG = [9, 15, 26];
  const CYAN = [0, 196, 216];
  const WHITE = [255, 255, 255];

  const c = makeCanvas(W, H, [...BG, 255]);

  // Subtle radial glow behind logo — large dark circle
  const glowR = (W * 0.38) | 0;
  const cx = W / 2 | 0;
  const cy = H / 2 | 0;
  for (let dy = -glowR; dy <= glowR; dy++) {
    for (let dx = -glowR; dx <= glowR; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= glowR) {
        const alpha = ((1 - dist / glowR) * 38) | 0;
        setPixel(c, cx + dx, cy + dy, 0, 196, 216, alpha);
      }
    }
  }

  // Logo square
  const sq = (W * 0.28) | 0;
  const sqX = ((W - sq) / 2) | 0;
  const sqY = ((H - sq) / 2 - sq * 0.08) | 0;
  const sqR = (sq * 0.22) | 0;
  fillRoundRect(c, sqX, sqY, sq, sq, sqR, ...CYAN);

  // "F"
  const fH = (sq * 0.52) | 0;
  const fCY = sqY + sq / 2 | 0;
  drawLetterF(c, cx, fCY, fH, WHITE);

  // "FriendFindr" text below — drawn as pixel art blocks (simplified)
  // We'll skip real text rendering and just put a thin line as a brand mark
  const barW = (sq * 1.1) | 0;
  const barH = Math.max(3, (sq * 0.025) | 0);
  const barX = cx - barW / 2 | 0;
  const barY = sqY + sq + (sq * 0.12) | 0;
  fillRect(c, barX, barY, barW, barH, ...CYAN, 180);

  await savePNG(c, `${OUT}/splash.png`);
}

await genIcon();
await genSplash();
console.log("Done!");
