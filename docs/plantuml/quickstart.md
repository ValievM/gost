# PlantUML: быстрый старт

Модуль `@magomed-cmd/gost/plantuml` строит PlantUML-текст и рендерит его в `Buffer`.

## Требования

- Node.js 18+.
- Java должна быть установлена и доступна через `PATH`.
- Для использования установленного пакета: `npm install @magomed-cmd/gost`.

## Построение и рендер PNG

```js
const fs = require("fs/promises");
const {
  createPlantUmlGost,
  autoImageSize,
} = require("@magomed-cmd/gost/plantuml");

async function main() {
  const plantuml = createPlantUmlGost({ dpi: 300 });

  const source = plantuml.classDiagram()
    .interface("Repository", ["+ save(entity): void"])
    .class("SqlRepository", ["+ save(entity): void"])
    .implements("SqlRepository", "Repository")
    .build();

  const png = await plantuml.render(source);
  await fs.writeFile("diagram.png", png);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

`dpi` управляет детализацией растра. Его можно задать фабрике или переопределить для одного рендера:

```js
async function renderVariants(plantuml, source) {
  const preview = await plantuml.render(source, { dpi: 150 });
  const print = await plantuml.render(source, { dpi: 300 });
  const svg = await plantuml.render(source, { format: "svg" });
  return { preview, print, svg };
}
```

## Размер изображения

Разделяйте два понятия:

- естественный размер — пиксели, созданные PlantUML при рендере;
- отображаемый размер — ширина и высота, переданные в DOCX, где 96 display px соответствуют одному дюйму.

Высокий `dpi` нужен для резкости, но не означает, что изображение должно занимать больше места на странице. Исходные пиксели PNG нельзя напрямую считать физической шириной в DOCX.

Для PNG можно вычислить пропорциональный отображаемый размер. Передавайте DPI, с которым PNG был отрендерен:

```js
const { width, height } = autoImageSize(
  png,
  contentWidthDisplayPx,
  300,
  "natural",
);
```

Режимы:

- `"natural"` — сохраняет естественный физический размер и только ограничивает его шириной контента;
- `"content"` — отображает изображение на всю переданную ширину контента.

`autoImageSize` работает с PNG. Для SVG и других форматов он не предназначен.

При вставке через `g.diagramBlock(...)` DOCX-модуль сам связывает размер с шириной контента документа:

```js
async function makeDiagramChildren(g, source, figures) {
  return [
    ...await g.diagramBlock(source, figures, "диаграмма классов", {
      dpi: 300,
      fit: "natural",
    }),
  ];
}
```

`diagramBlock` использует `"natural"` по умолчанию, передаёт DPI рендера в sizing и ограничивает отображение шириной контента DOCX. Для принудительного заполнения всей ширины используйте `fit: "content"`.

## Произвольный PlantUML

Каждый builder поддерживает:

```js
const source = plantuml.componentDiagram()
  .component("API", "api")
  .add("queue Jobs")
  .blank()
  .add("api --> Jobs")
  .build();
```

`.add(line)` добавляет любую строку PlantUML, `.blank()` — пустую строку.

Полный список builders и методов: [api.md](./api.md).

Исполняемый smoke-пример всех 12 builders:

```bash
npm run example:plantuml
```
