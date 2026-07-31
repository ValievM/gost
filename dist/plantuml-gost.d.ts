import { RenderDiagramOpts, SkinparamOpts } from "./plantuml-render";
import type { ImageFit } from "./plantuml-size";
export interface DiagramBuildOpts {
    /** Дополнительные skinparam поверх стандартных */
    skinparams?: Record<string, string>;
}
export interface PlantUmlGostOptions {
    /** DPI для растеризации. По умолчанию: 150 */
    dpi?: number;
}
export interface PlantUmlGostInstance {
    useCaseDiagram(): UseCaseBuilder;
    classDiagram(): ClassDiagramBuilder;
    sequenceDiagram(): SequenceBuilder;
    stateDiagram(): StateBuilder;
    activityDiagram(): ActivityBuilder;
    componentDiagram(): ComponentBuilder;
    deploymentDiagram(): DeploymentBuilder;
    objectDiagram(): ObjectBuilder;
    erDiagram(): ERBuilder;
    timingDiagram(): TimingBuilder;
    mindMap(): MindMapBuilder;
    ganttChart(): GanttBuilder;
    /** Рендерит puml-строку, возвращает PNG Buffer */
    render(puml: string, opts?: RenderDiagramOpts & SkinparamOpts): Promise<Buffer>;
    /** Размер PNG для DOCX; sourceDpi по умолчанию равен DPI экземпляра */
    autoImageSize(buffer: Buffer, maxWidth?: number, sourceDpi?: number, fit?: ImageFit): {
        width: number;
        height: number;
    };
}
export declare class DiagramBuilder {
    protected readonly lines: string[];
    /** Добавить произвольную строку PlantUML (escape hatch) */
    add(line: string): this;
    /** Добавить пустую строку для визуального разделения */
    blank(): this;
    /** Собрать итоговую строку @startuml...@enduml */
    build(): string;
}
export declare class UseCaseBuilder extends DiagramBuilder {
    /** Объявить актора */
    actor(name: string, alias?: string): this;
    /** Объявить прецедент */
    usecase(name: string, alias?: string): this;
    /** Стрелка связи от from к to */
    arrow(from: string, to: string, label?: string): this;
    /** Отношение <<extend>> */
    extend(base: string, extension: string): this;
    /** Отношение <<include>> */
    include(base: string, included: string): this;
    /** Сгруппировать прецеденты в прямоугольник системы */
    package(name: string, fn: (b: UseCaseBuilder) => void): this;
}
export declare class ClassDiagramBuilder extends DiagramBuilder {
    /** build всегда добавляет hide circle (ГОСТ стиль) */
    build(): string;
    /** Объявить класс с необязательными членами */
    class(name: string, members?: string[]): this;
    /** Объявить абстрактный класс */
    abstract(name: string, members?: string[]): this;
    /** Объявить интерфейс */
    interface(name: string, members?: string[]): this;
    /** Объявить перечисление */
    enum(name: string, values: string[]): this;
    /** Наследование: child --|> parent */
    extends(child: string, parent: string): this;
    /** Реализация интерфейса: cls ..|> iface */
    implements(cls: string, iface: string): this;
    /** Ассоциация: from --> to */
    association(from: string, to: string, label?: string): this;
    /** Зависимость: from ..> to */
    dependency(from: string, to: string, label?: string): this;
    /** Композиция: from *-- to */
    composition(from: string, to: string, label?: string): this;
    /** Агрегация: from o-- to */
    aggregation(from: string, to: string, label?: string): this;
    /** Сгруппировать классы в пакет */
    package(name: string, fn: (b: ClassDiagramBuilder) => void): this;
}
export declare class SequenceBuilder extends DiagramBuilder {
    /** Объявить участника */
    participant(name: string, alias?: string): this;
    /** Объявить актора */
    actor(name: string, alias?: string): this;
    /** Синхронная стрелка from -> to */
    arrow(from: string, to: string, label: string): this;
    /** Пунктирная возвратная стрелка from --> to */
    return(from: string, to: string, label: string): this;
    /** Активировать участника */
    activate(name: string): this;
    /** Деактивировать участника */
    deactivate(name: string): this;
    /** Заметка рядом с участником */
    note(text: string, side: "left" | "right", target: string): this;
    /** Разделитель с подписью */
    divider(text?: string): this;
    /** Группа с меткой */
    group(label: string, fn: (b: SequenceBuilder) => void): this;
}
export declare class StateBuilder extends DiagramBuilder {
    /** Объявить состояние */
    state(name: string, label?: string): this;
    /** Переход между состояниями с явным направлением */
    transition(from: string, to: string, label?: string, direction?: "down" | "up" | "left" | "right"): this;
    /** Начальное состояние */
    initial(to: string): this;
    /** Конечное состояние */
    final(from: string): this;
}
export declare class ActivityBuilder extends DiagramBuilder {
    /** Начало диаграммы */
    start(): this;
    /** Нормальное завершение (stop-узел) */
    stop(): this;
    /** Конечный узел (end-узел c завершением потока) */
    end(): this;
    /** Действие — прямоугольник с текстом */
    action(text: string): this;
    /** Заметка рядом с текущим действием */
    note(text: string, side?: "right" | "left"): this;
    /** Условное ветвление. noFn и метки опциональны */
    if(condition: string, yesFn: (b: ActivityBuilder) => void, noFn?: (b: ActivityBuilder) => void, yesLabel?: string, noLabel?: string): this;
    /** Цикл while */
    while(condition: string, fn: (b: ActivityBuilder) => void, exitLabel?: string): this;
    /** Параллельное ветвление: каждый элемент массива — одна ветвь */
    fork(...branches: Array<(b: ActivityBuilder) => void>): this;
    /** Swimlane / раздел */
    partition(name: string, fn: (b: ActivityBuilder) => void): this;
}
export declare class ComponentBuilder extends DiagramBuilder {
    /** Компонент */
    component(name: string, alias?: string): this;
    /** Интерфейс */
    interface(name: string, alias?: string): this;
    /** База данных */
    database(name: string, alias?: string): this;
    /** Облако / внешняя система */
    cloud(name: string, alias?: string): this;
    /** Направленная зависимость */
    arrow(from: string, to: string, label?: string): this;
    /** Ненаправленная линия связи */
    link(from: string, to: string, label?: string): this;
    /** Сгруппировать в пакет / подсистему */
    package(name: string, fn: (b: ComponentBuilder) => void): this;
}
export declare class DeploymentBuilder extends DiagramBuilder {
    /** Физический узел (сервер, устройство) с опциональным вложением */
    node(name: string, alias?: string, fn?: (b: DeploymentBuilder) => void): this;
    /** Компонент внутри узла */
    component(name: string, alias?: string): this;
    /** База данных */
    database(name: string, alias?: string): this;
    /** Артефакт (jar, war, исполняемый файл) */
    artifact(name: string, alias?: string): this;
    /** Облачная зона с опциональным вложением */
    cloud(name: string, fn?: (b: DeploymentBuilder) => void): this;
    /** Направленное соединение */
    arrow(from: string, to: string, label?: string): this;
    /** Физическое соединение без стрелки */
    link(from: string, to: string, label?: string): this;
}
export declare class ObjectBuilder extends DiagramBuilder {
    /**
     * Объект-экземпляр.
     * @param name   - идентификатор (используется в link/arrow). Если содержит
     *                 пробелы или двоеточие — автоматически оборачивается в кавычки,
     *                 а для связей нужно передать alias.
     * @param alias  - короткий идентификатор для link/arrow когда name содержит спецсимволы
     * @param fields - поля в формате { key: value }
     */
    object(name: string, alias?: string, fields?: Record<string, string | number>): this;
    /** Связь между объектами */
    link(from: string, to: string, label?: string): this;
}
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
export declare const ER: {
    /** || -- ||  один к одному */
    readonly ONE_TO_ONE: "||--||";
    /** || -- o{  один к нулю-или-многим (самый частый) */
    readonly ONE_TO_MANY: "||--o{";
    /** || -- |{  один к одному-или-многим */
    readonly ONE_TO_MANY_REQ: "||--|{";
    /** |o -- o{  ноль-или-один к нулю-или-многим */
    readonly OPT_TO_MANY: "|o--o{";
    /** }o -- o{  многие ко многим */
    readonly MANY_TO_MANY: "}o--o{";
};
export declare class ERBuilder extends DiagramBuilder {
    /**
     * Объявить сущность.
     * @param pkFields - поля первичного ключа (выделяются * и отделяются чертой)
     * @param fields   - обычные поля
     */
    entity(name: string, pkFields: string[], fields?: string[]): this;
    /**
     * Связь между сущностями.
     * @param rel - строка кардинальности, используй константы ER.* или свою строку
     * @example er.relation("User", ER.ONE_TO_MANY, "Order", "делает")
     */
    relation(from: string, rel: string, to: string, label?: string): this;
}
export declare class TimingBuilder extends DiagramBuilder {
    /** Участник типа concise — переключается между дискретными состояниями */
    concise(name: string, alias?: string): this;
    /** Участник типа robust — аналоговый сигнал с длительностью переходов */
    robust(name: string, alias?: string): this;
    /** Тактовый сигнал с периодом */
    clock(name: string, period: number): this;
    /** Временна́я точка — все последующие state() привязаны к этому моменту */
    at(time: number | string): this;
    /** Состояние участника в текущей временно́й точке */
    state(participant: string, value: string): this;
    /** Сообщение между участниками */
    arrow(from: string, to: string, label: string): this;
    /**
     * Выделить временной отрезок цветом (поддерживается в PlantUML 1.2021+).
     * Синтаксис: highlight start to end #Color : label
     */
    highlight(fromTime: number, toTime: number, color?: string, label?: string): this;
}
export declare class MindMapBuilder extends DiagramBuilder {
    /** MindMap использует собственные теги вместо @startuml */
    build(): string;
    /**
     * Узел карты.
     * @param level - глубина: 1 = корень, 2 = ветвь, 3 = лист, ...
     * @param text  - текст узла
     * @param side  - "right" (по умолчанию) или "left" (ветви идут влево от корня)
     */
    node(level: number, text: string, side?: "right" | "left"): this;
}
export declare class GanttBuilder extends DiagramBuilder {
    /** Gantt использует собственные теги вместо @startuml */
    build(): string;
    /** Дата начала проекта в формате YYYY-MM-DD */
    startDate(date: string): this;
    /** Задача с длительностью в днях. Начинается сразу после предыдущей */
    task(name: string, duration: number): this;
    /** Задача, стартующая сразу после окончания другой */
    after(name: string, afterName: string, duration: number): this;
    /** Веха — нулевая длительность в момент окончания задачи */
    milestone(name: string, afterTask: string): this;
    /** Раздел / фаза проекта */
    section(name: string): this;
}
export declare function createPlantUmlGost(opts?: PlantUmlGostOptions): PlantUmlGostInstance;
export { autoImageSize } from "./plantuml-size";
export { renderDiagram, wrapWithSkin } from "./plantuml-render";
//# sourceMappingURL=plantuml-gost.d.ts.map