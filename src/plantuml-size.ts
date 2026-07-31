// Автоматическое определение отображаемых размеров PNG.
// ImageRun использует 96 display px на дюйм независимо от DPI исходного PNG.

export interface ImageSize {
  width: number;
  height: number;
}

export type ImageFit = "natural" | "content";

/**
 * Читает реальные размеры PNG из буфера (согласно PNG spec: bytes 16-20 = width, 20-24 = height)
 * и вычисляет размер отображения в DOCX.
 *
 * sourceDpi влияет только на естественный физический размер. Сам PNG не
 * ресемплируется: Word получает исходный буфер и только меняет его размер
 * отображения.
 */
export function autoImageSize(
  buffer: Buffer,
  maxWidth = 624,
  sourceDpi = 96,
  fit: ImageFit = "natural",
): ImageSize {
  if (buffer.length < 24) throw new Error("autoImageSize(): PNG buffer is too short.");
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!pngSignature.every((byte, index) => buffer[index] === byte)) {
    throw new Error("autoImageSize(): buffer is not a PNG.");
  }
  if (buffer.toString("ascii", 12, 16) !== "IHDR") {
    throw new Error("autoImageSize(): PNG has no IHDR header.");
  }
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
    throw new Error("autoImageSize(): maxWidth must be a positive number.");
  }
  if (!Number.isFinite(sourceDpi) || sourceDpi <= 0) {
    throw new Error("autoImageSize(): sourceDpi must be a positive number.");
  }
  if (fit !== "natural" && fit !== "content") {
    throw new Error('autoImageSize(): fit must be "natural" or "content".');
  }

  const w = buffer.readUInt32BE(16);
  const h = buffer.readUInt32BE(20);
  if (w === 0 || h === 0) throw new Error("autoImageSize(): PNG dimensions must be positive.");

  const naturalWidth = w * (96 / sourceDpi);
  const width = fit === "content"
    ? maxWidth
    : Math.min(naturalWidth, maxWidth);

  return {
    width: Math.round(width),
    height: Math.round(h * (width / w)),
  };
}
