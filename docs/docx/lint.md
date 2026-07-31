# DOCX lint

`g.lint(children)` выполняет статический preflight массива до создания
`Document`:

```js
const { createDocxGost } = require("@magomed-cmd/gost/docx");
const g = createDocxGost();

const children = [
  g.h1("Введение"),
  g.paragraph("Текст."),
];

const issues = g.lint(children);
if (issues.some((issue) => issue.level === "warn")) {
  process.exitCode = 1;
}
```

Метод печатает результат и возвращает `LintIssue[]`:

```ts
interface LintIssue {
  level: "warn" | "info";
  index: number;
  code: string;
  message: string;
}
```

Для CI без автоматической печати:

```js
const {
  lintChildren,
  printLintResults,
} = require("@magomed-cmd/gost/docx");

const issues = lintChildren(children);
printLintResults(issues);
```

## Правила

| Код | Level | Проверка |
| --- | --- | --- |
| `empty-page-start` | warn | `pageBreak` первым |
| `empty-page-end` | warn | `pageBreak` последним |
| `consecutive-page-breaks` | warn | два `pageBreak` подряд |
| `page-break-blank-page-break` | warn | разрыв, blanks, разрыв |
| `heading-before-page-break` | warn | heading прямо перед разрывом |
| `image-caption-split` | warn | после image следующим значимым идёт разрыв |
| `table-caption-split` | warn | после tableCaption следующим значимым идёт разрыв |
| `image-without-caption` | warn | сразу после image нет caption |
| `placeholder-left` | warn | остался placeholder |
| `blank-before-page-break` | info | blank прямо перед разрывом |
| `too-many-blanks` | info | три и более blanks подряд |

## Граница возможностей

Lint видит только типы элементов и их порядок. Он не:

- запускает Word и не знает фактическую пагинацию;
- не проверяет поля, шрифты и визуальную геометрию;
- не доказывает соответствие ГОСТ;
- не анализирует произвольные `docx.Paragraph`, не созданные фабрикой;
- не проверяет текстовые ссылки на номера рисунков и таблиц.

`image-caption-split` и `table-caption-split` реагируют на разрыв, но не ищут
реальную подпись или таблицу дальше по массиву.
