# DOCX: таблицы и математика

## Таблица

```js
const { createDocxGost } = require("@magomed-cmd/gost/docx");
const g = createDocxGost();

const table = g.makeTable([
  ["Критерий", "Значение"],
  ["MM", 12],
  [{ text: "Итого", bold: true }, { text: 12, bold: true }],
], {
  widths: [6000, 3355],
  headerRow: 0,
  centerHeader: true,
});

void table;
```

`rows` — двумерный массив. Значение ячейки:

- строка или число;
- descriptor `{ text, align, bold, italics, size, color, font, colspan,
  rowspan, shading }`;
- math-компонент;
- в `descriptor.text` — массив текстовых и math-фрагментов.

`TableOpts`:

| Поле | Смысл |
| --- | --- |
| `widths` | ширины колонок в DXA |
| `headerRow` | индекс строки-заголовка, default `0` |
| `align` | выравнивание обычных ячеек |
| `centerHeader` | центрировать заголовок, default `true` |
| `fontSize` | размер текста |
| `cellLine` | межстрочный интервал |
| `contentWidth` | общая ширина вместо `style.CONTENT_WIDTH` |
| `borders` | объект границ `docx` |

Если `widths` не передан, ширина делится поровну. Если передан — массив должен
соответствовать фактическим колонкам.

Для `descriptor.text`, содержащего массив или math-компонент, параметры
`bold`, `italics`, `size`, `color` и `font` применяются ко всему содержимому.
Опции отдельных текстовых фрагментов имеют приоритет над общими.

## Формулы

```js
const {
  createDocxGost,
  mathFraction,
  mathSub,
  mathSubSup,
  mathSum,
} = require("@magomed-cmd/gost/docx");

const g = createDocxGost();

const children = [
  g.paragraphWithMath([
    "Оптимальное значение ",
    mathSub("V", "max"),
    " найдено аналитически.",
  ]),
  g.formulaMath(["ν = ", mathFraction(48, 13), " ≈ 3.692"]),
  g.formulaInline("Получаем:", [
    mathSum(mathSub("x", "i"), {
      subScript: "i=1",
      superScript: "n",
    }),
    " = 1",
  ]),
  g.formulaMath([mathSubSup("x", "i", "*"), " = 0"]),
];

void children;
```

Math-хелперы экспортируются из модуля:

| Функция | Результат |
| --- | --- |
| `mathExpr(...parts)` | выражение |
| `mathFraction(num, den)` | дробь |
| `mathSub(base, sub)` | нижний индекс |
| `mathSup(base, sup)` | верхний индекс |
| `mathSubSup(base, sub, sup)` | оба индекса |
| `mathParen(...parts)` | круглые скобки |
| `mathBracket(...parts)` | квадратные скобки |
| `mathBrace(...parts)` | фигурные скобки |
| `mathRoot(content, degree?)` | корень |
| `mathSum(content, opts?)` | сумма с пределами |
| `mathIntegral(content, opts?)` | интеграл с пределами |

Используйте math API для индексов, дробей, степеней и специальных операторов,
чтобы Word сохранял формулу как Office Math, а не обычный текст.
