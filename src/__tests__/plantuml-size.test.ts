import { autoImageSize } from "../plantuml-size";
import { createPlantUmlGost } from "../plantuml-gost";

// Минимальный PNG-буфер с нужными размерами в нужных байтах (PNG spec: bytes 16-19 = width, 20-23 = height)
function fakePng(width: number, height: number): Buffer {
  const buf = Buffer.alloc(24);
  buf.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  buf.write("IHDR", 12, "ascii");
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

describe("autoImageSize", () => {
  test("уменьшает большое изображение до maxWidth по умолчанию (624)", () => {
    const buf = fakePng(800, 600);
    const { width, height } = autoImageSize(buf);
    expect(width).toBe(624);
    expect(height).toBe(Math.round(600 * (624 / 800)));
  });

  test("уменьшает до переданного maxWidth", () => {
    const buf = fakePng(1000, 500);
    const { width, height } = autoImageSize(buf, 500);
    expect(width).toBe(500);
    expect(height).toBe(250);
  });

  test("пропорции сохраняются при масштабировании", () => {
    const buf = fakePng(400, 200); // соотношение 2:1
    const { width, height } = autoImageSize(buf, 200);
    expect(width / height).toBeCloseTo(2, 1);
  });

  test("не увеличивает изображение меньше maxWidth", () => {
    const buf = fakePng(320, 180);
    expect(autoImageSize(buf, 624)).toEqual({ width: 320, height: 180 });
  });

  test("fit=content растягивает изображение до maxWidth", () => {
    const buf = fakePng(320, 180);
    expect(autoImageSize(buf, 624, 96, "content")).toEqual({ width: 624, height: 351 });
  });

  test("учитывает DPI исходного PNG при расчёте физического размера", () => {
    const buf = fakePng(975, 450);
    expect(autoImageSize(buf, 624, 150)).toEqual({ width: 624, height: 288 });
  });

  test("если изображение уже равно maxWidth — размеры не меняются", () => {
    const buf = fakePng(624, 400);
    const { width, height } = autoImageSize(buf, 624);
    expect(width).toBe(624);
    expect(height).toBe(400);
  });

  test("отклоняет некорректные размеры и параметры", () => {
    expect(() => autoImageSize(Buffer.alloc(8))).toThrow(/too short/);
    expect(() => autoImageSize(Buffer.alloc(24))).toThrow(/not a PNG/);
    expect(() => autoImageSize(fakePng(0, 100))).toThrow(/positive/);
    expect(() => autoImageSize(fakePng(100, 100), 0)).toThrow(/maxWidth/);
    expect(() => autoImageSize(fakePng(100, 100), 624, 0)).toThrow(/sourceDpi/);
    expect(() => autoImageSize(fakePng(100, 100), 624, 96, "invalid" as never)).toThrow(/fit/);
  });

  test("instance helper использует DPI экземпляра по умолчанию", () => {
    const plantUml = createPlantUmlGost({ dpi: 150 });
    const buf = fakePng(300, 150);
    expect(plantUml.autoImageSize(buf)).toEqual({ width: 192, height: 96 });
    expect(plantUml.autoImageSize(buf, 624, 96)).toEqual({ width: 300, height: 150 });
  });
});
