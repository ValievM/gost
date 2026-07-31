# Выпуск версии

Релиз выполняется только из чистой ветки `main` после прохождения CI.

1. Обновить `CHANGELOG.md`: перенести изменения из `Unreleased` в новую версию.
2. Выполнить:
   ```bash
   npm ci
   npm run verify
   npm run check:package
   ```
3. Обновить версию без автоматического тега:
   ```bash
   npm version patch --no-git-tag-version
   ```
   Для несовместимого публичного API использовать `major`, для новой
   совместимой функциональности — `minor`.
4. Закоммитить `package.json`, `package-lock.json` и changelog.
5. Создать неизменяемый semver-тег и GitHub Release:
   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z"
   git push origin main vX.Y.Z
   gh release create vX.Y.Z --generate-notes
   ```
6. `npm publish` выполнять отдельно только после проверки владельца scope,
   включённой двухфакторной аутентификации и содержимого `npm pack --dry-run`.

Тег `stable` не переписывать: это сохранённая предыдущая стабильная точка.
