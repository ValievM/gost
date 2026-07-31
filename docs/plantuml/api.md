# PlantUML API

Импорт:

```js
const {
  createPlantUmlGost,
  ER,
  renderDiagram,
  wrapWithSkin,
  autoImageSize,
} = require("@magomed-cmd/gost/plantuml");
```

## Фабрика

```ts
createPlantUmlGost(options?: { dpi?: number }): PlantUmlGostInstance
```

Методы экземпляра:

| Метод | Результат |
| --- | --- |
| `useCaseDiagram()` | `UseCaseBuilder` |
| `classDiagram()` | `ClassDiagramBuilder` |
| `sequenceDiagram()` | `SequenceBuilder` |
| `stateDiagram()` | `StateBuilder` |
| `activityDiagram()` | `ActivityBuilder` |
| `componentDiagram()` | `ComponentBuilder` |
| `deploymentDiagram()` | `DeploymentBuilder` |
| `objectDiagram()` | `ObjectBuilder` |
| `erDiagram()` | `ERBuilder` |
| `timingDiagram()` | `TimingBuilder` |
| `mindMap()` | `MindMapBuilder` |
| `ganttChart()` | `GanttBuilder` |
| `render(source, options?)` | `Promise<Buffer>` |
| `autoImageSize(png, maxWidth?, sourceDpi?, fit?)` | `{ width, height }`; `sourceDpi` по умолчанию равен DPI фабрики |

## Общие методы builders

Все builders наследуют:

| Метод | Назначение |
| --- | --- |
| `add(line)` | добавить произвольную строку PlantUML |
| `blank()` | добавить пустую строку |
| `build()` | собрать готовый source |

Обычные builders создают `@startuml ... @enduml`. `mindMap()` и `ganttChart()` используют собственные теги PlantUML.

## 12 builders

### Use case

```ts
actor(name, alias?)
usecase(name, alias?)
arrow(from, to, label?)
extend(base, extension)
include(base, included)
package(name, callback)
```

### Class

```ts
class(name, members?)
abstract(name, members?)
interface(name, members?)
enum(name, values)
extends(child, parent)
implements(className, interfaceName)
association(from, to, label?)
dependency(from, to, label?)
composition(from, to, label?)
aggregation(from, to, label?)
package(name, callback)
```

`build()` автоматически добавляет `hide circle`.

### Sequence

```ts
participant(name, alias?)
actor(name, alias?)
arrow(from, to, label)
return(from, to, label)
activate(name)
deactivate(name)
note(text, "left" | "right", target)
divider(text?)
group(label, callback)
```

### State

```ts
state(name, label?)
transition(from, to, label?, direction?)
initial(to)
final(from)
```

`direction`: `"down" | "up" | "left" | "right"`.

### Activity

```ts
start()
stop()
end()
action(text)
note(text, side?)
if(condition, yesCallback, noCallback?, yesLabel?, noLabel?)
while(condition, callback, exitLabel?)
fork(...branchCallbacks)
partition(name, callback)
```

### Component

```ts
component(name, alias?)
interface(name, alias?)
database(name, alias?)
cloud(name, alias?)
arrow(from, to, label?)
link(from, to, label?)
package(name, callback)
```

### Deployment

```ts
node(name, alias?, callback?)
component(name, alias?)
database(name, alias?)
artifact(name, alias?)
cloud(name, callback?)
arrow(from, to, label?)
link(from, to, label?)
```

### Object

```ts
object(name, alias?, fields?)
link(from, to, label?)
```

`fields` — объект `Record<string, string | number>`. Для имени со спецсимволами задайте `alias` и используйте его в связях.

### ER

```ts
entity(name, primaryKeyFields, fields?)
relation(from, relation, to, label?)
```

Готовые отношения:

```js
ER.ONE_TO_ONE
ER.ONE_TO_MANY
ER.ONE_TO_MANY_REQ
ER.OPT_TO_MANY
ER.MANY_TO_MANY
```

Пример:

```js
const source = plantuml.erDiagram()
  .entity("User", ["id: UUID"], ["name: String"])
  .entity("Order", ["id: UUID"], ["user_id: UUID"])
  .relation("User", ER.ONE_TO_MANY, "Order", "создаёт")
  .build();
```

### Timing

```ts
concise(name, alias?)
robust(name, alias?)
clock(name, period)
at(time)
state(participant, value)
arrow(from, to, label)
highlight(fromTime, toTime, color?, label?)
```

### Mind map

```ts
node(level, text, side?)
```

`side`: `"right"` по умолчанию или `"left"`. `build()` создаёт `@startmindmap ... @endmindmap`.

### Gantt

```ts
startDate("YYYY-MM-DD")
task(name, durationDays)
after(name, afterTaskName, durationDays)
milestone(name, afterTaskName)
section(name)
```

`build()` создаёт `@startgantt ... @endgantt`.

## Рендер

```ts
plantuml.render(source, {
  format?: "png" | "svg",
  dpi?: number,
  skinparams?: Record<string, string>,
}): Promise<Buffer>
```

Фабричный `dpi` действует по умолчанию; значение в `render()` имеет приоритет.

Низкоуровневый эквивалент:

```ts
renderDiagram(source, options?): Promise<Buffer>
```

`wrapWithSkin(source, dpi?, { skinparams? })` добавляет базовые настройки шрифта и компоновки в source с тегом `@startuml`. Для `@startmindmap` и `@startgantt` текущая реализация не вставляет эти настройки.

## Sizing PNG для DOCX

Низкоуровневая функция:

```ts
autoImageSize(
  png: Buffer,
  maxWidth?: number,
  sourceDpi?: number,
  fit?: "natural" | "content",
): { width: number; height: number }
```

- `sourceDpi` — DPI исходного PNG.
- Результат выражен в DOCX display px: 96 display px = 1 inch.
- `"natural"` сохраняет естественный физический размер и ограничивает его `maxWidth`.
- `"content"` отображает картинку на `maxWidth`.
- Буфер не ресемплируется: меняется только размер отображения.

Instance-метод принимает те же параметры. Если `sourceDpi` не передан, он
использует DPI из `createPlantUmlGost({ dpi })`. Поэтому связка
`plantuml.render()` → `plantuml.autoImageSize()` сохраняет физический размер.
Для PNG из другого источника передайте его DPI явно.

## Экспорты

Runtime-экспорты:

```text
createPlantUmlGost
DiagramBuilder
UseCaseBuilder
ClassDiagramBuilder
SequenceBuilder
StateBuilder
ActivityBuilder
ComponentBuilder
DeploymentBuilder
ObjectBuilder
ERBuilder
TimingBuilder
MindMapBuilder
GanttBuilder
ER
renderDiagram
wrapWithSkin
autoImageSize
```
