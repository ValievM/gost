import { Paragraph } from "docx";
import type { DocxStyleConfig, ParagraphOpts, ListType } from "./types";
export declare function defaultStyles(st: DocxStyleConfig): object;
/** Нумерация для list() — всегда включается в makeDocument */
export declare function defaultNumbering(st: DocxStyleConfig): {
    config: ({
        reference: string;
        levels: {
            level: number;
            format: "decimal";
            text: string;
            alignment: "start";
            style: {
                run: {
                    font: string;
                    size: number;
                };
                paragraph: {
                    indent: {
                        left: number;
                        hanging: number;
                    };
                };
            };
        }[];
    } | {
        reference: string;
        levels: {
            level: number;
            format: "bullet";
            text: string;
            alignment: "start";
            style: {
                run: {
                    font: string;
                    size: number;
                };
                paragraph: {
                    indent: {
                        left: number;
                        hanging: number;
                    };
                };
            };
        }[];
    })[];
};
export declare function h1Impl(st: DocxStyleConfig, text: string, opts?: ParagraphOpts): Paragraph;
export declare function h2Impl(st: DocxStyleConfig, text: string, opts?: ParagraphOpts): Paragraph;
export declare function h3Impl(st: DocxStyleConfig, text: string, opts?: ParagraphOpts): Paragraph;
export declare function listImpl(st: DocxStyleConfig, items: string[], type: ListType, opts?: ParagraphOpts): Paragraph[];
/**
 * Заголовок приложения по ГОСТ 7.32.
 * Возвращает массив параграфов: «ПРИЛОЖЕНИЕ А», опциональный тип и название.
 * @param letter - буква приложения: "А", "Б", ...
 * @param title  - название приложения
 * @param kind   - "(обязательное)" или "(справочное)"
 */
export declare function appendixImpl(st: DocxStyleConfig, letter: string, title: string, kind?: "обязательное" | "справочное"): Paragraph[];
//# sourceMappingURL=heading.d.ts.map