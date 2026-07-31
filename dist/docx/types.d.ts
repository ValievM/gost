import { AlignmentType, BorderStyle, Document, Footer, Paragraph, Table, TextRun, TabStopType, Math as DocxMath } from "docx";
import type { LintIssue } from "../lint";
import type { ImageFit } from "../plantuml-size";
export type DocxBorder = {
    style: (typeof BorderStyle)[keyof typeof BorderStyle];
    size: number;
    color: string;
};
export type DocxBorders = {
    top: DocxBorder;
    bottom: DocxBorder;
    left: DocxBorder;
    right: DocxBorder;
};
export type TabStop = {
    type: (typeof TabStopType)[keyof typeof TabStopType];
    position: number;
};
export type MathComponent = any;
export type ParagraphChild = TextRun | DocxMath;
export interface DocxStyleConfig {
    FONT: string;
    SIZE: number;
    SIZE_TITLE: number;
    SIZE_HEADER: number;
    SIZE_CODE: number;
    INDENT: number;
    LINE: number;
    CONTENT_WIDTH: number;
    CODE_FONT: string;
    TABLE_CELL_LINE: number;
    TABLE_CELL_MARGINS: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    HEADING_COLOR: string;
    CAPTION_BEFORE: number;
    CAPTION_AFTER: number;
    TABLE_CAPTION_BEFORE: number;
    TABLE_CAPTION_AFTER: number;
    IMAGE_BEFORE: number;
    IMAGE_AFTER: number;
    FORMULA_BEFORE: number;
    FORMULA_AFTER: number;
    PAGE: {
        size: {
            width: number;
            height: number;
        };
        margin: {
            top: number;
            bottom: number;
            left: number;
            right: number;
        };
    };
    BORDER_SINGLE: DocxBorder;
    BORDERS_ALL: DocxBorders;
    TITLE_TAB_STOPS: TabStop[];
}
export type DocxPageOverrides = {
    size?: Partial<DocxStyleConfig["PAGE"]["size"]>;
    margin?: Partial<DocxStyleConfig["PAGE"]["margin"]>;
};
export type DocxStyleOverrides = Partial<Omit<DocxStyleConfig, "PAGE" | "TABLE_CELL_MARGINS">> & {
    PAGE?: DocxPageOverrides;
    TABLE_CELL_MARGINS?: Partial<DocxStyleConfig["TABLE_CELL_MARGINS"]>;
    font?: string;
    size?: number;
    sizeTitle?: number;
    sizeHeader?: number;
    sizeCode?: number;
    indent?: number;
    line?: number;
    contentWidth?: number;
    codeFont?: string;
    page?: DocxPageOverrides;
};
export interface DocxGostOptions {
    style?: DocxStyleOverrides;
}
export interface RunDescriptor {
    text: string;
    size?: number;
    bold?: boolean;
    italics?: boolean;
    allCaps?: boolean;
    underline?: boolean | object;
    color?: string;
    font?: string;
}
export type Content = string | number | Array<string | number | RunDescriptor>;
export interface ParagraphOpts {
    align?: (typeof AlignmentType)[keyof typeof AlignmentType] | string;
    noIndent?: boolean;
    indent?: number;
    line?: number;
    before?: number;
    after?: number;
    bold?: boolean;
    italics?: boolean;
    allCaps?: boolean;
    underline?: boolean | object;
    size?: number;
    color?: string;
    font?: string;
    keepNext?: boolean;
    keepLines?: boolean;
    imageType?: "png" | "jpg" | "gif" | "bmp";
}
export interface TableOpts {
    widths?: number[];
    headerRow?: number;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType] | string;
    centerHeader?: boolean;
    fontSize?: number;
    cellLine?: number;
    contentWidth?: number;
    borders?: DocxBorders;
}
export interface CaptionCounterOpts extends ParagraphOpts {
    start?: number;
    table?: boolean;
}
export interface CaptionCounter {
    peek: () => number;
    caption: (text: string) => Paragraph;
}
export interface CellDescriptor {
    text: CellValue | CellValue[];
    align?: (typeof AlignmentType)[keyof typeof AlignmentType] | string;
    bold?: boolean;
    italics?: boolean;
    size?: number;
    color?: string;
    font?: string;
    colspan?: number;
    rowspan?: number;
    shading?: object;
}
export type CellValue = string | number | CellDescriptor | MathComponent;
export interface TitlePageOpts {
    workType: string;
    subtitle?: string | string[];
    discipline: string;
    group: string;
    author: string;
    teacher: string;
    teacherTitle?: string;
    year: number | string;
}
export interface DocxSection {
    properties: {
        page: DocxStyleConfig["PAGE"];
    };
    footers: {
        default: Footer;
    };
    children: Array<Paragraph | Table>;
}
export interface DocxGostInstance {
    readonly style: DocxStyleConfig;
    run(text: string | number, opts?: ParagraphOpts): TextRun;
    paragraph(content: Content, opts?: ParagraphOpts): Paragraph;
    centered(content: Content, opts?: ParagraphOpts): Paragraph;
    paragraphWithMath(parts: Array<string | number | RunDescriptor | MathComponent>, opts?: ParagraphOpts): Paragraph;
    h1(text: string, opts?: ParagraphOpts): Paragraph;
    h2(text: string, opts?: ParagraphOpts): Paragraph;
    h3(text: string, opts?: ParagraphOpts): Paragraph;
    blank(opts?: ParagraphOpts): Paragraph;
    pageBreak(): Paragraph;
    caption(text: string, opts?: ParagraphOpts): Paragraph;
    tableCaption(text: string, opts?: ParagraphOpts): Paragraph;
    createCaptionCounter(prefix: string, opts?: CaptionCounterOpts): CaptionCounter;
    placeholder(label: string, opts?: ParagraphOpts): Paragraph;
    /** Явные размеры: imageBlock(src, 600, 400) или imageBlock(src, 600, 400, opts) */
    imageBlock(src: string | Buffer, width: number, height: number, opts?: ImageBlockOpts): Paragraph;
    /** Авто-размер из PNG-байт: imageBlock(src) или imageBlock(src, { maxWidth: 500 }) */
    imageBlock(src: string | Buffer, opts?: ImageBlockOpts): Paragraph;
    codeLine(text: string, opts?: ParagraphOpts): Paragraph;
    codeBlock(lines: string[], opts?: ParagraphOpts): Paragraph[];
    /**
     * Читает файл с диска, нормализует переводы строк и табы, возвращает массив
     * Paragraph в стиле кода. Эквивалентно codeBlock(readFileSync(p).split('\n')).
     */
    codeFile(filePath: string, opts?: ParagraphOpts): Paragraph[];
    /**
     * Нумерованный (ordered) или маркированный (bullet, тире –) список по ГОСТ.
     * Спредится в children: `...g.list(["Пункт 1", "Пункт 2"])`.
     */
    list(items: string[], type?: ListType, opts?: ParagraphOpts): Paragraph[];
    /**
     * Заголовок приложения по ГОСТ: «ПРИЛОЖЕНИЕ А» + опциональный тип + название.
     * Heading 1 — попадает в оглавление. Спредится в children: `...g.appendix("А", "Код")`.
     */
    appendix(letter: string, title: string, kind?: "обязательное" | "справочное"): Paragraph[];
    formulaMath(content: unknown, opts?: ParagraphOpts): Paragraph;
    formulaInline(label: string, mathContent: unknown, opts?: ParagraphOpts): Paragraph;
    makeTable(rows: CellValue[][], opts?: TableOpts): Table;
    makeTitlePage(opts: TitlePageOpts): DocxSection;
    makeContentSection(children: Array<Paragraph | Table>, opts?: object): DocxSection;
    makeDocument(sections: DocxSection[], opts?: {
        styles?: object;
    }): Document;
    saveDocument(doc: Document, outputPath: string): Promise<void>;
    /**
     * Рендерит puml-строку → авторазмер → imageBlock + подпись.
     * Спредится прямо в children: `...await g.diagramBlock(puml, figures, "заголовок")`
     */
    diagramBlock(pumlSource: string, counter: CaptionCounter, captionText: string, opts?: DiagramBlockOpts): Promise<Paragraph[]>;
    /**
     * Анализирует children на пустые страницы и ГОСТ-нарушения.
     * Возвращает список проблем и выводит их в консоль.
     * Вызывать перед makeDocument.
     */
    lint(children: Array<Paragraph | Table>): LintIssue[];
}
export interface ImageBlockOpts extends ParagraphOpts {
    /**
     * Максимальная ширина изображения в px при авто-определении размеров.
     * Применяется только когда width/height не переданы явно.
     * По умолчанию вычисляется из CONTENT_WIDTH (624 display px для стандартного стиля).
     */
    maxWidth?: number;
    /**
     * natural: не увеличивать маленькое изображение, большое ограничить maxWidth.
     * content: всегда отображать на maxWidth. По умолчанию: natural.
     */
    fit?: ImageFit;
    /**
     * DPI исходного PNG для расчёта естественного физического размера.
     * По умолчанию: 96.
     */
    sourceDpi?: number;
}
/** Тип списка: нумерованный или маркированный (тире по ГОСТ) */
export type ListType = "ordered" | "bullet";
export interface DiagramBlockOpts {
    /** DPI растеризации. По умолчанию: 150, для печати: 300 */
    dpi?: number;
    /**
     * Максимальная отображаемая ширина в DOCX display px (96 px = 1 inch).
     * По умолчанию вычисляется из CONTENT_WIDTH (624 px для стандартного стиля).
     */
    maxWidth?: number;
    /**
     * natural: сохранить естественный физический размер и только ограничить сверху.
     * content: растянуть до maxWidth. По умолчанию: natural.
     */
    fit?: ImageFit;
    /** Переопределение skinparam */
    skinparams?: Record<string, string>;
}
//# sourceMappingURL=types.d.ts.map