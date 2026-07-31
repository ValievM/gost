"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapWithSkin = exports.renderDiagram = exports.autoImageSize = exports.GanttBuilder = exports.MindMapBuilder = exports.TimingBuilder = exports.ERBuilder = exports.ER = exports.ObjectBuilder = exports.DeploymentBuilder = exports.ComponentBuilder = exports.ActivityBuilder = exports.StateBuilder = exports.SequenceBuilder = exports.ClassDiagramBuilder = exports.UseCaseBuilder = exports.DiagramBuilder = void 0;
exports.createPlantUmlGost = createPlantUmlGost;
const plantuml_render_1 = require("./plantuml-render");
const plantuml_size_1 = require("./plantuml-size");
// ── Базовый строитель ─────────────────────────────────────────────────────────
class DiagramBuilder {
    constructor() {
        this.lines = [];
    }
    /** Добавить произвольную строку PlantUML (escape hatch) */
    add(line) {
        this.lines.push(line);
        return this;
    }
    /** Добавить пустую строку для визуального разделения */
    blank() {
        return this.add("");
    }
    /** Собрать итоговую строку @startuml...@enduml */
    build() {
        return `@startuml\n${this.lines.join("\n")}\n@enduml`;
    }
}
exports.DiagramBuilder = DiagramBuilder;
// ── Use Case builder ──────────────────────────────────────────────────────────
class UseCaseBuilder extends DiagramBuilder {
    /** Объявить актора */
    actor(name, alias) {
        return this.add(alias ? `actor "${name}" as ${alias}` : `actor "${name}"`);
    }
    /** Объявить прецедент */
    usecase(name, alias) {
        return this.add(alias ? `usecase "${name}" as ${alias}` : `usecase "${name}"`);
    }
    /** Стрелка связи от from к to */
    arrow(from, to, label) {
        return this.add(label ? `${from} --> ${to} : ${label}` : `${from} --> ${to}`);
    }
    /** Отношение <<extend>> */
    extend(base, extension) {
        return this.add(`${extension} .> ${base} : <<extend>>`);
    }
    /** Отношение <<include>> */
    include(base, included) {
        return this.add(`${base} .> ${included} : <<include>>`);
    }
    /** Сгруппировать прецеденты в прямоугольник системы */
    package(name, fn) {
        this.add(`rectangle "${name}" {`);
        fn(this);
        return this.add("}");
    }
}
exports.UseCaseBuilder = UseCaseBuilder;
// ── Class diagram builder ─────────────────────────────────────────────────────
class ClassDiagramBuilder extends DiagramBuilder {
    /** build всегда добавляет hide circle (ГОСТ стиль) */
    build() {
        return `@startuml\nhide circle\n${this.lines.join("\n")}\n@enduml`;
    }
    /** Объявить класс с необязательными членами */
    class(name, members = []) {
        if (members.length === 0)
            return this.add(`class ${name}`);
        this.add(`class ${name} {`);
        members.forEach((m) => this.add(`  ${m}`));
        return this.add("}");
    }
    /** Объявить абстрактный класс */
    abstract(name, members = []) {
        if (members.length === 0)
            return this.add(`abstract class ${name}`);
        this.add(`abstract class ${name} {`);
        members.forEach((m) => this.add(`  ${m}`));
        return this.add("}");
    }
    /** Объявить интерфейс */
    interface(name, members = []) {
        if (members.length === 0)
            return this.add(`interface ${name}`);
        this.add(`interface ${name} {`);
        members.forEach((m) => this.add(`  ${m}`));
        return this.add("}");
    }
    /** Объявить перечисление */
    enum(name, values) {
        this.add(`enum ${name} {`);
        values.forEach((v) => this.add(`  ${v}`));
        return this.add("}");
    }
    /** Наследование: child --|> parent */
    extends(child, parent) {
        return this.add(`${child} --|> ${parent}`);
    }
    /** Реализация интерфейса: cls ..|> iface */
    implements(cls, iface) {
        return this.add(`${cls} ..|> ${iface}`);
    }
    /** Ассоциация: from --> to */
    association(from, to, label) {
        return this.add(label ? `${from} --> ${to} : ${label}` : `${from} --> ${to}`);
    }
    /** Зависимость: from ..> to */
    dependency(from, to, label) {
        return this.add(label ? `${from} ..> ${to} : ${label}` : `${from} ..> ${to}`);
    }
    /** Композиция: from *-- to */
    composition(from, to, label) {
        return this.add(label ? `${from} *-- ${to} : ${label}` : `${from} *-- ${to}`);
    }
    /** Агрегация: from o-- to */
    aggregation(from, to, label) {
        return this.add(label ? `${from} o-- ${to} : ${label}` : `${from} o-- ${to}`);
    }
    /** Сгруппировать классы в пакет */
    package(name, fn) {
        this.add(`package ${name} {`);
        fn(this);
        return this.add("}");
    }
}
exports.ClassDiagramBuilder = ClassDiagramBuilder;
// ── Sequence builder ──────────────────────────────────────────────────────────
class SequenceBuilder extends DiagramBuilder {
    /** Объявить участника */
    participant(name, alias) {
        return this.add(alias ? `participant "${name}" as ${alias}` : `participant "${name}"`);
    }
    /** Объявить актора */
    actor(name, alias) {
        return this.add(alias ? `actor "${name}" as ${alias}` : `actor "${name}"`);
    }
    /** Синхронная стрелка from -> to */
    arrow(from, to, label) {
        return this.add(`${from} -> ${to} : ${label}`);
    }
    /** Пунктирная возвратная стрелка from --> to */
    return(from, to, label) {
        return this.add(`${from} --> ${to} : ${label}`);
    }
    /** Активировать участника */
    activate(name) {
        return this.add(`activate ${name}`);
    }
    /** Деактивировать участника */
    deactivate(name) {
        return this.add(`deactivate ${name}`);
    }
    /** Заметка рядом с участником */
    note(text, side, target) {
        return this.add(`note ${side} of ${target} : ${text}`);
    }
    /** Разделитель с подписью */
    divider(text) {
        return this.add(text ? `== ${text} ==` : "====");
    }
    /** Группа с меткой */
    group(label, fn) {
        this.add(`group ${label}`);
        fn(this);
        return this.add("end");
    }
}
exports.SequenceBuilder = SequenceBuilder;
// ── State builder ─────────────────────────────────────────────────────────────
class StateBuilder extends DiagramBuilder {
    /** Объявить состояние */
    state(name, label) {
        return this.add(label ? `state "${label}" as ${name}` : `state ${name}`);
    }
    /** Переход между состояниями с явным направлением */
    transition(from, to, label, direction) {
        const arrow = direction ? `-${direction}->` : "-->";
        return this.add(label ? `${from} ${arrow} ${to} : ${label}` : `${from} ${arrow} ${to}`);
    }
    /** Начальное состояние */
    initial(to) {
        return this.add(`[*] --> ${to}`);
    }
    /** Конечное состояние */
    final(from) {
        return this.add(`${from} --> [*]`);
    }
}
exports.StateBuilder = StateBuilder;
// ── Activity builder ──────────────────────────────────────────────────────────
class ActivityBuilder extends DiagramBuilder {
    /** Начало диаграммы */
    start() { return this.add("start"); }
    /** Нормальное завершение (stop-узел) */
    stop() { return this.add("stop"); }
    /** Конечный узел (end-узел c завершением потока) */
    end() { return this.add("end"); }
    /** Действие — прямоугольник с текстом */
    action(text) { return this.add(`:${text};`); }
    /** Заметка рядом с текущим действием */
    note(text, side = "right") {
        return this.add(`note ${side}: ${text}`);
    }
    /** Условное ветвление. noFn и метки опциональны */
    if(condition, yesFn, noFn, yesLabel = "yes", noLabel = "no") {
        this.add(`if (${condition}?) then (${yesLabel})`);
        yesFn(this);
        if (noFn) {
            this.add(`else (${noLabel})`);
            noFn(this);
        }
        return this.add("endif");
    }
    /** Цикл while */
    while(condition, fn, exitLabel) {
        this.add(`while (${condition}?)`);
        fn(this);
        return this.add(exitLabel ? `endwhile (${exitLabel})` : "endwhile");
    }
    /** Параллельное ветвление: каждый элемент массива — одна ветвь */
    fork(...branches) {
        branches.forEach((branch, i) => {
            this.add(i === 0 ? "fork" : "fork again");
            branch(this);
        });
        return this.add("end fork");
    }
    /** Swimlane / раздел */
    partition(name, fn) {
        this.add(`partition "${name}" {`);
        fn(this);
        return this.add("}");
    }
}
exports.ActivityBuilder = ActivityBuilder;
// ── Component builder ─────────────────────────────────────────────────────────
class ComponentBuilder extends DiagramBuilder {
    /** Компонент */
    component(name, alias) {
        return this.add(alias ? `component [${name}] as ${alias}` : `component [${name}]`);
    }
    /** Интерфейс */
    interface(name, alias) {
        return this.add(alias ? `interface "${name}" as ${alias}` : `interface "${name}"`);
    }
    /** База данных */
    database(name, alias) {
        return this.add(alias ? `database "${name}" as ${alias}` : `database "${name}"`);
    }
    /** Облако / внешняя система */
    cloud(name, alias) {
        return this.add(alias ? `cloud "${name}" as ${alias}` : `cloud "${name}"`);
    }
    /** Направленная зависимость */
    arrow(from, to, label) {
        return this.add(label ? `${from} --> ${to} : ${label}` : `${from} --> ${to}`);
    }
    /** Ненаправленная линия связи */
    link(from, to, label) {
        return this.add(label ? `${from} -- ${to} : ${label}` : `${from} -- ${to}`);
    }
    /** Сгруппировать в пакет / подсистему */
    package(name, fn) {
        this.add(`package "${name}" {`);
        fn(this);
        return this.add("}");
    }
}
exports.ComponentBuilder = ComponentBuilder;
// ── Deployment builder ────────────────────────────────────────────────────────
class DeploymentBuilder extends DiagramBuilder {
    /** Физический узел (сервер, устройство) с опциональным вложением */
    node(name, alias, fn) {
        if (fn) {
            this.add(alias ? `node "${name}" as ${alias} {` : `node "${name}" {`);
            fn(this);
            return this.add("}");
        }
        return this.add(alias ? `node "${name}" as ${alias}` : `node "${name}"`);
    }
    /** Компонент внутри узла */
    component(name, alias) {
        return this.add(alias ? `component [${name}] as ${alias}` : `component [${name}]`);
    }
    /** База данных */
    database(name, alias) {
        return this.add(alias ? `database "${name}" as ${alias}` : `database "${name}"`);
    }
    /** Артефакт (jar, war, исполняемый файл) */
    artifact(name, alias) {
        return this.add(alias ? `artifact "${name}" as ${alias}` : `artifact "${name}"`);
    }
    /** Облачная зона с опциональным вложением */
    cloud(name, fn) {
        if (fn) {
            this.add(`cloud "${name}" {`);
            fn(this);
            return this.add("}");
        }
        return this.add(`cloud "${name}"`);
    }
    /** Направленное соединение */
    arrow(from, to, label) {
        return this.add(label ? `${from} --> ${to} : ${label}` : `${from} --> ${to}`);
    }
    /** Физическое соединение без стрелки */
    link(from, to, label) {
        return this.add(label ? `${from} -- ${to} : ${label}` : `${from} -- ${to}`);
    }
}
exports.DeploymentBuilder = DeploymentBuilder;
// ── Object builder ────────────────────────────────────────────────────────────
class ObjectBuilder extends DiagramBuilder {
    /**
     * Объект-экземпляр.
     * @param name   - идентификатор (используется в link/arrow). Если содержит
     *                 пробелы или двоеточие — автоматически оборачивается в кавычки,
     *                 а для связей нужно передать alias.
     * @param alias  - короткий идентификатор для link/arrow когда name содержит спецсимволы
     * @param fields - поля в формате { key: value }
     */
    object(name, alias, fields = {}) {
        const entries = Object.entries(fields);
        const needsQuotes = /[^a-zA-Z0-9_]/.test(name);
        const decl = needsQuotes
            ? `object "${name}"${alias ? ` as ${alias}` : ""}`
            : `object ${name}`;
        if (entries.length === 0)
            return this.add(decl);
        this.add(`${decl} {`);
        entries.forEach(([k, v]) => this.add(`  ${k} = ${v}`));
        return this.add("}");
    }
    /** Связь между объектами */
    link(from, to, label) {
        return this.add(label ? `${from} --> ${to} : ${label}` : `${from} --> ${to}`);
    }
}
exports.ObjectBuilder = ObjectBuilder;
// ── ER builder ────────────────────────────────────────────────────────────────
/**
 * Готовые строки связей для ER-диаграмм PlantUML.
 * Используй как второй аргумент ERBuilder.relation().
 *
 * В PlantUML нотация кардинальности зеркальна:
 *   левая сторона (--): `||`, `|o`, `}|`, `}o`
 *   правая сторона (--): `||`, `o|`, `|{`, `o{`
 * Константы ниже — готовые комбинации, которые всегда корректны.
 *
 * @example er.relation("User", ER.ONE_TO_MANY, "Order", "делает")
 */
exports.ER = {
    /** || -- ||  один к одному */
    ONE_TO_ONE: "||--||",
    /** || -- o{  один к нулю-или-многим (самый частый) */
    ONE_TO_MANY: "||--o{",
    /** || -- |{  один к одному-или-многим */
    ONE_TO_MANY_REQ: "||--|{",
    /** |o -- o{  ноль-или-один к нулю-или-многим */
    OPT_TO_MANY: "|o--o{",
    /** }o -- o{  многие ко многим */
    MANY_TO_MANY: "}o--o{",
};
class ERBuilder extends DiagramBuilder {
    /**
     * Объявить сущность.
     * @param pkFields - поля первичного ключа (выделяются * и отделяются чертой)
     * @param fields   - обычные поля
     */
    entity(name, pkFields, fields = []) {
        this.add(`entity "${name}" {`);
        pkFields.forEach((f) => this.add(`  * ${f}`));
        if (pkFields.length > 0 && fields.length > 0)
            this.add("  --");
        fields.forEach((f) => this.add(`  ${f}`));
        return this.add("}");
    }
    /**
     * Связь между сущностями.
     * @param rel - строка кардинальности, используй константы ER.* или свою строку
     * @example er.relation("User", ER.ONE_TO_MANY, "Order", "делает")
     */
    relation(from, rel, to, label) {
        return this.add(label
            ? `${from} ${rel} ${to} : ${label}`
            : `${from} ${rel} ${to}`);
    }
}
exports.ERBuilder = ERBuilder;
// ── Timing builder ────────────────────────────────────────────────────────────
class TimingBuilder extends DiagramBuilder {
    /** Участник типа concise — переключается между дискретными состояниями */
    concise(name, alias) {
        return this.add(alias ? `concise "${name}" as ${alias}` : `concise "${name}"`);
    }
    /** Участник типа robust — аналоговый сигнал с длительностью переходов */
    robust(name, alias) {
        return this.add(alias ? `robust "${name}" as ${alias}` : `robust "${name}"`);
    }
    /** Тактовый сигнал с периодом */
    clock(name, period) {
        return this.add(`clock "${name}" with period ${period}`);
    }
    /** Временна́я точка — все последующие state() привязаны к этому моменту */
    at(time) {
        return this.add(`@${time}`);
    }
    /** Состояние участника в текущей временно́й точке */
    state(participant, value) {
        return this.add(`${participant} is ${value}`);
    }
    /** Сообщение между участниками */
    arrow(from, to, label) {
        return this.add(`${from} -> ${to} : ${label}`);
    }
    /**
     * Выделить временной отрезок цветом (поддерживается в PlantUML 1.2021+).
     * Синтаксис: highlight start to end #Color : label
     */
    highlight(fromTime, toTime, color = "#LightYellow", label) {
        return this.add(label
            ? `highlight ${fromTime} to ${toTime} ${color} : ${label}`
            : `highlight ${fromTime} to ${toTime} ${color}`);
    }
}
exports.TimingBuilder = TimingBuilder;
// ── MindMap builder ───────────────────────────────────────────────────────────
class MindMapBuilder extends DiagramBuilder {
    /** MindMap использует собственные теги вместо @startuml */
    build() {
        return `@startmindmap\n${this.lines.join("\n")}\n@endmindmap`;
    }
    /**
     * Узел карты.
     * @param level - глубина: 1 = корень, 2 = ветвь, 3 = лист, ...
     * @param text  - текст узла
     * @param side  - "right" (по умолчанию) или "left" (ветви идут влево от корня)
     */
    node(level, text, side = "right") {
        const stars = "*".repeat(Math.max(1, level));
        return this.add(side === "left" ? `${stars}_ ${text}` : `${stars} ${text}`);
    }
}
exports.MindMapBuilder = MindMapBuilder;
// ── Gantt builder ─────────────────────────────────────────────────────────────
class GanttBuilder extends DiagramBuilder {
    /** Gantt использует собственные теги вместо @startuml */
    build() {
        return `@startgantt\n${this.lines.join("\n")}\n@endgantt`;
    }
    /** Дата начала проекта в формате YYYY-MM-DD */
    startDate(date) {
        return this.add(`Project starts ${date}`);
    }
    /** Задача с длительностью в днях. Начинается сразу после предыдущей */
    task(name, duration) {
        return this.add(`[${name}] lasts ${duration} days`);
    }
    /** Задача, стартующая сразу после окончания другой */
    after(name, afterName, duration) {
        return this.add(`[${name}] starts at [${afterName}]'s end and lasts ${duration} days`);
    }
    /** Веха — нулевая длительность в момент окончания задачи */
    milestone(name, afterTask) {
        return this.add(`[${name}] happens at [${afterTask}]'s end`);
    }
    /** Раздел / фаза проекта */
    section(name) {
        return this.add(`-- ${name} --`);
    }
}
exports.GanttBuilder = GanttBuilder;
// ── Фабрика ───────────────────────────────────────────────────────────────────
function createPlantUmlGost(opts = {}) {
    const defaultDpi = opts.dpi ?? 150;
    return {
        useCaseDiagram: () => new UseCaseBuilder(),
        classDiagram: () => new ClassDiagramBuilder(),
        sequenceDiagram: () => new SequenceBuilder(),
        stateDiagram: () => new StateBuilder(),
        activityDiagram: () => new ActivityBuilder(),
        componentDiagram: () => new ComponentBuilder(),
        deploymentDiagram: () => new DeploymentBuilder(),
        objectDiagram: () => new ObjectBuilder(),
        erDiagram: () => new ERBuilder(),
        timingDiagram: () => new TimingBuilder(),
        mindMap: () => new MindMapBuilder(),
        ganttChart: () => new GanttBuilder(),
        render: (puml, renderOpts = {}) => (0, plantuml_render_1.renderDiagram)(puml, { dpi: defaultDpi, ...renderOpts }),
        autoImageSize: (buffer, maxWidth, sourceDpi = defaultDpi, fit = "natural") => (0, plantuml_size_1.autoImageSize)(buffer, maxWidth, sourceDpi, fit),
    };
}
var plantuml_size_2 = require("./plantuml-size");
Object.defineProperty(exports, "autoImageSize", { enumerable: true, get: function () { return plantuml_size_2.autoImageSize; } });
var plantuml_render_2 = require("./plantuml-render");
Object.defineProperty(exports, "renderDiagram", { enumerable: true, get: function () { return plantuml_render_2.renderDiagram; } });
Object.defineProperty(exports, "wrapWithSkin", { enumerable: true, get: function () { return plantuml_render_2.wrapWithSkin; } });
//# sourceMappingURL=plantuml-gost.js.map