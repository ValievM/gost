# AGENTS.md

## Назначение

Репозиторий генерирует учебные DOCX/XLSX-отчёты ИТА ЮФУ (Таганрог) и
PlantUML-диаграммы. Текущий титульный шаблон не универсален: организация и
город зашиты в `src/docx/document.ts`.

## Источник истины

При расхождении доверять в таком порядке:

1. публичные типы в `src/*/types.ts`;
2. wiring фабрики в `src/*/index.ts`;
3. реализация;
4. тесты;
5. документация.

Не обещать больше, чем делает код. В частности:

- DOCX lint — статический анализ последовательности элементов, без рендера Word;
- DOCX переводит размеры изображений в display px из расчёта 96 px/in;
- auto-size изображений по умолчанию сохраняет natural size и только уменьшает
  до ширины контента;
- `makeTitlePage()` выводит ИТА ЮФУ и Таганрог.

## Progressive disclosure

Начинать с `README.md`, затем открывать только нужную ветку `docs/INDEX.md`.

Для DOCX:

- генерация готового отчёта — `docs/ai-report-generation.md`;
- модель и маршрут — `docs/docx/README.md`;
- сигнатуры — `docs/docx/api.md`;
- текст, списки, код, приложения — `docs/docx/content.md`;
- таблицы и формулы — `docs/docx/tables-and-math.md`;
- изображения и PlantUML в DOCX — `docs/docx/images-and-diagrams.md`;
- стили, титульник и сборка — `docs/docx/document-and-styles.md`;
- lint — `docs/docx/lint.md`.

Не загружать все документы без необходимости.

Для полного отчёта использовать `examples/docx/full-report.cjs` как
канонический шаблон; `examples/docx/minimal.cjs` — только для быстрого старта.

## Архитектура

- `src/docx-gost.ts`, `src/excel-gost.ts` — совместимые re-export entrypoints.
- Реализация DOCX — `src/docx/`.
- Реализация Excel — `src/excel/`.
- PlantUML builders — `src/plantuml-gost.ts`.
- Сгенерированные артефакты — `dist/`.
- Тесты — `src/__tests__/`.

Созданные экземпляры DOCX не разделяют вложенные объекты стиля и счётчики.
Не добавлять новое глобальное изменяемое состояние.

## Правила изменений

- Не менять публичное поведение в рефакторинге без отдельного решения и теста.
- Сохранять subpath imports: `@magomed-cmd/gost/docx`, `/excel`, `/plantuml`.
- Не редактировать `dist/` вручную; синхронизировать через `npm run build`.
- Все CommonJS-примеры с `await` оборачивать в `async function main()`.
- Пример должен проходить `node --check`.
- Новую публичную функцию одновременно добавить в типы, factory wiring, тесты и
  тематический документ.
- Не называть DOCX lint полной проверкой ГОСТ или реальной пагинации.

## Проверка

```bash
npm run build
npm test
```

Для документационных изменений дополнительно проверить ссылки и:

```bash
find examples \( -name '*.cjs' -o -name '*.mjs' \) -exec node --check {} \;
```
