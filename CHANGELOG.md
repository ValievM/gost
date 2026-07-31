# Changelog

Все заметные изменения проекта фиксируются в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
версии следуют [Semantic Versioning](https://semver.org/lang/ru/).

## [Unreleased]

### Added

- Модульные публичные входы `docx`, `plantuml` и `excel`.
- Тематическая документация и запускаемые примеры.
- Проверка собранного npm-пакета в CommonJS, ESM и TypeScript.

### Changed

- DOCX-код разделён на модули без изменения публичного сценария генерации.
- Размеры изображений и диаграмм рассчитываются с учётом DPI.
- Excel autofit вынесен в стратегии.
- Базовая зависимость `docx` обновлена до совместимой версии 9.7.1.

### Fixed

- Расчёт ширины объединённых ячеек DOCX-таблиц.
- Независимость вложенных настроек стиля между экземплярами.

[Unreleased]: https://github.com/Magomed-cmd/gost/compare/stable...main
