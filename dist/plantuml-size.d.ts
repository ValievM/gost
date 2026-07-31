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
export declare function autoImageSize(buffer: Buffer, maxWidth?: number, sourceDpi?: number, fit?: ImageFit): ImageSize;
