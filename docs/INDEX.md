# Карта документации

Документация построена по progressive disclosure: сначала выберите подсистему,
затем откройте только нужную тему.

## DOCX

Начать с [модели DOCX](docx/README.md).

| Задача | Документ |
| --- | --- |
| Найти сигнатуру или опцию | [API](docx/api.md) |
| Создать текст, заголовок, список, листинг, приложение | [Контент](docx/content.md) |
| Создать таблицу или формулу | [Таблицы и математика](docx/tables-and-math.md) |
| Вставить изображение или PlantUML | [Изображения и диаграммы](docx/images-and-diagrams.md) |
| Настроить стиль, титульник, секции и сохранение | [Документ и стили](docx/document-and-styles.md) |
| Интерпретировать `g.lint()` | [Lint](docx/lint.md) |

Запускаемый пример: [examples/docx/minimal.cjs](../examples/docx/minimal.cjs).

## PlantUML

- [Быстрый старт](plantuml/quickstart.md)
- [API](plantuml/api.md)

## Excel

- [Быстрый старт](excel/quickstart.md)
- [API](excel/api.md)

## Разработка

- [Правила для AI-агентов](../AGENTS.md)
- Публичные entrypoints: `src/docx-gost.ts`, `src/excel-gost.ts`,
  `src/plantuml-gost.ts`
- Тесты: `src/__tests__/`
