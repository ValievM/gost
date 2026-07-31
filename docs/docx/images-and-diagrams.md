# DOCX: изображения и диаграммы

## Изображение с явными размерами

```js
const fs = require("node:fs");
const { createDocxGost } = require("@magomed-cmd/gost/docx");
const g = createDocxGost();

const image = g.imageBlock(
  fs.readFileSync("photo.jpg"),
  400,
  300,
  { imageType: "jpg" },
);

void image;
```

Явные `width` и `height` задаются в display px Word: 96 px = 1 inch.

Сигнатура:

```ts
interface DocxGostInstance {
  imageBlock(
    src: string | Buffer,
    width: number,
    height: number,
    opts?: ImageBlockOpts,
  ): Paragraph;
}
```

Поддерживаемые `imageType`: `png`, `jpg`, `gif`, `bmp`. Default — `png`.

## Авторазмер PNG

```js
const fs = require("node:fs");
const { createDocxGost } = require("@magomed-cmd/gost/docx");
const g = createDocxGost();
const png = fs.readFileSync("diagram.png");

const defaultWidth = g.imageBlock(png);
const customWidth = g.imageBlock(png, {
  maxWidth: 500,
  fit: "natural",
  sourceDpi: 144,
});

void defaultWidth;
void customWidth;
```

Без `width/height` библиотека читает размеры из PNG-заголовка. Другие форматы
в этом режиме бросают исключение.

Размер вычисляется в display px:

```text
naturalWidth = rasterWidth × 96 / sourceDpi
naturalHeight = rasterHeight × 96 / sourceDpi
```

Default `sourceDpi` — 96. Default `maxWidth` выводится из
`style.CONTENT_WIDTH`; для стандартного стиля это около 624 display px.

Default `fit: "natural"` сохраняет natural size и только уменьшает изображение,
если оно шире `maxWidth`. `fit: "content"` растягивает или уменьшает изображение
до `maxWidth`.

Общие опции: `align`, `line`, `before`, `after`, `keepNext`, `keepLines`,
`imageType`, `maxWidth`, `fit`, `sourceDpi`. Default `keepNext: true`, чтобы
рисунок оставался с последующей подписью.

## Правильная последовательность

```js
const figures = g.createCaptionCounter("Рисунок");
const children = [
  g.paragraph(`Архитектура показана на рисунке ${figures.peek()}.`),
  g.imageBlock(png),
  figures.caption("архитектура системы"),
];

void children;
```

## PlantUML сразу в DOCX

```js
const {
  createDocxGost,
} = require("@magomed-cmd/gost/docx");
const {
  createPlantUmlGost,
} = require("@magomed-cmd/gost/plantuml");

async function buildDiagramChildren() {
  const g = createDocxGost();
  const p = createPlantUmlGost();
  const figures = g.createCaptionCounter("Рисунок");

  const source = p.classDiagram()
    .interface("Repository", ["+ save(): void"])
    .class("SqlRepository")
    .implements("SqlRepository", "Repository")
    .build();

  return [
    g.paragraph(`Структура показана на рисунке ${figures.peek()}.`),
    ...await g.diagramBlock(source, figures, "структура классов"),
  ];
}

void buildDiagramChildren;
```

`diagramBlock()`:

1. рендерит PlantUML в PNG;
2. вычисляет размер;
3. возвращает `[imageBlock, caption]`.

Опции:

| Поле | Default | Смысл |
| --- | --- | --- |
| `dpi` | `150` | качество исходного PNG |
| `maxWidth` | вычисляется | максимальная display-ширина |
| `fit` | `natural` | natural size с ограничением или заполнение ширины |
| `skinparams` | `{}` | дополнительные PlantUML skinparams |

Default `maxWidth = style.CONTENT_WIDTH / 1440 × 96`: при стандартном стиле это
около 624 display px. DPI рендера не меняет физическую ширину диаграммы в Word:
он даёт больше исходных пикселей для качественной печати. Natural size
диаграммы ограничивается шириной контента без увеличения маленьких диаграмм.

При высоте результата больше 900 px библиотека выводит предупреждение.
Рендер PlantUML требует Java.
