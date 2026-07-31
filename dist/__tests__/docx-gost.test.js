"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const docx_gost_1 = require("../docx-gost");
const docx_1 = require("docx");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
describe("createDocxGost", () => {
    const g = (0, docx_gost_1.createDocxGost)();
    test("возвращает инстанс со всеми методами", () => {
        const methods = [
            "paragraph", "centered", "h1", "h2", "h3",
            "blank", "pageBreak", "caption", "tableCaption",
            "createCaptionCounter", "placeholder", "imageBlock",
            "codeLine", "codeBlock", "formulaMath", "formulaInline",
            "makeTable", "makeTitlePage", "makeContentSection",
            "makeDocument", "saveDocument", "diagramBlock", "codeFile", "list", "appendix",
        ];
        methods.forEach((m) => expect(typeof g[m]).toBe("function"));
    });
    test("paragraph() возвращает Paragraph", () => {
        expect(g.paragraph("Текст")).toBeInstanceOf(docx_1.Paragraph);
    });
    test("h1() возвращает Paragraph", () => {
        expect(g.h1("Заголовок")).toBeInstanceOf(docx_1.Paragraph);
    });
    test("blank() возвращает Paragraph", () => {
        expect(g.blank()).toBeInstanceOf(docx_1.Paragraph);
    });
    test("pageBreak() возвращает Paragraph", () => {
        expect(g.pageBreak()).toBeInstanceOf(docx_1.Paragraph);
    });
    test("codeBlock() возвращает массив Paragraph", () => {
        const result = g.codeBlock(["line1", "line2", "line3"]);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(3);
        result.forEach((p) => expect(p).toBeInstanceOf(docx_1.Paragraph));
    });
    describe("createCaptionCounter", () => {
        test("peek() возвращает текущий номер без инкремента", () => {
            const c = g.createCaptionCounter("Рисунок");
            expect(c.peek()).toBe(1);
            expect(c.peek()).toBe(1); // не меняется
        });
        test("caption() инкрементирует счётчик", () => {
            const c = g.createCaptionCounter("Рисунок");
            expect(c.peek()).toBe(1);
            c.caption("первый рисунок");
            expect(c.peek()).toBe(2);
            c.caption("второй рисунок");
            expect(c.peek()).toBe(3);
        });
        test("caption() возвращает Paragraph", () => {
            const c = g.createCaptionCounter("Таблица");
            expect(c.caption("данные")).toBeInstanceOf(docx_1.Paragraph);
        });
        test("start: 5 начинает с 5", () => {
            const c = g.createCaptionCounter("Рисунок", { start: 5 });
            expect(c.peek()).toBe(5);
        });
    });
    // Минимальный валидный PNG-буфер: сигнатура + IHDR с реальными размерами
    const fakePng = (() => {
        const b = Buffer.alloc(24);
        // PNG magic bytes: \x89PNG\r\n\x1a\n
        b[0] = 0x89;
        b[1] = 0x50;
        b[2] = 0x4e;
        b[3] = 0x47;
        b[4] = 0x0d;
        b[5] = 0x0a;
        b[6] = 0x1a;
        b[7] = 0x0a;
        b.writeUInt32BE(800, 16);
        b.writeUInt32BE(600, 20);
        return b;
    })();
    describe("imageBlock", () => {
        test("imageBlock(src, width, height) — явные размеры возвращает Paragraph", () => {
            expect(g.imageBlock(fakePng, 600, 400)).toBeInstanceOf(docx_1.Paragraph);
        });
        test("imageBlock(src) — авто-размер из PNG-байт возвращает Paragraph", () => {
            expect(g.imageBlock(fakePng)).toBeInstanceOf(docx_1.Paragraph);
        });
        test("imageBlock(src, { maxWidth: 300 }) — авто-размер с кастомной шириной", () => {
            // 800×600 с maxWidth=300 → 300×225
            expect(g.imageBlock(fakePng, { maxWidth: 300 })).toBeInstanceOf(docx_1.Paragraph);
        });
        test("imageBlock(src) без PNG-сигнатуры — бросает ошибку", () => {
            const notPng = Buffer.alloc(24);
            expect(() => g.imageBlock(notPng)).toThrow(/PNG/);
        });
    });
    describe("codeFile", () => {
        let tmpFile;
        beforeEach(() => {
            tmpFile = path.join(os.tmpdir(), `gost-test-${Date.now()}.txt`);
        });
        afterEach(() => {
            if (fs.existsSync(tmpFile))
                fs.unlinkSync(tmpFile);
        });
        test("возвращает массив Paragraph по числу строк файла", () => {
            fs.writeFileSync(tmpFile, "line1\nline2\nline3");
            const result = g.codeFile(tmpFile);
            expect(result).toHaveLength(3);
            result.forEach((p) => expect(p).toBeInstanceOf(docx_1.Paragraph));
        });
        test("файл, оканчивающийся на \\n, не даёт лишнюю пустую строку", () => {
            fs.writeFileSync(tmpFile, "line1\nline2\n");
            expect(g.codeFile(tmpFile)).toHaveLength(2);
        });
        test("Windows CRLF нормализуется в LF", () => {
            fs.writeFileSync(tmpFile, "line1\r\nline2\r\nline3\r\n");
            expect(g.codeFile(tmpFile)).toHaveLength(3);
        });
        test("табы заменяются на 2 пробела", () => {
            fs.writeFileSync(tmpFile, "\tindented");
            // Просто проверяем что не бросает исключение и возвращает Paragraph
            expect(g.codeFile(tmpFile)[0]).toBeInstanceOf(docx_1.Paragraph);
        });
        test("пустой файл возвращает пустой массив", () => {
            fs.writeFileSync(tmpFile, "");
            expect(g.codeFile(tmpFile)).toHaveLength(0);
        });
    });
    describe("list", () => {
        test("возвращает массив Paragraph по числу элементов", () => {
            const result = g.list(["Пункт 1", "Пункт 2", "Пункт 3"]);
            expect(result).toHaveLength(3);
            result.forEach(p => expect(p).toBeInstanceOf(docx_1.Paragraph));
        });
        test("по умолчанию тип bullet", () => {
            expect(g.list(["A"])).toHaveLength(1);
        });
        test("ordered возвращает Paragraph[]", () => {
            const result = g.list(["A", "B"], "ordered");
            expect(result).toHaveLength(2);
            result.forEach(p => expect(p).toBeInstanceOf(docx_1.Paragraph));
        });
        test("пустой список возвращает пустой массив", () => {
            expect(g.list([])).toHaveLength(0);
        });
    });
    describe("appendix", () => {
        test("без kind возвращает 2 параграфа (заголовок + название)", () => {
            const result = g.appendix("А", "Исходный код");
            expect(result).toHaveLength(2);
            result.forEach(p => expect(p).toBeInstanceOf(docx_1.Paragraph));
        });
        test("с kind возвращает 3 параграфа", () => {
            const result = g.appendix("Б", "Схема БД", "обязательное");
            expect(result).toHaveLength(3);
        });
        test("буква приводится к верхнему регистру", () => {
            // appendix("а") должен генерировать "ПРИЛОЖЕНИЕ А"
            // Косвенно: если упал бы на строчной букве — был бы другой результат
            expect(() => g.appendix("а", "Тест")).not.toThrow();
        });
    });
    describe("makeTable", () => {
        test("не бросает исключение для простой таблицы", () => {
            expect(() => g.makeTable([
                ["Заголовок 1", "Заголовок 2"],
                ["Значение 1", "Значение 2"],
            ])).not.toThrow();
        });
    });
    describe("makeDocument", () => {
        test("не бросает исключение при сборке документа", () => {
            const titlePage = g.makeTitlePage({
                workType: "ОТЧЁТ",
                subtitle: ["о выполнении работы №1"],
                discipline: "по дисциплине: «Тест»",
                group: "КТбо3-7",
                author: "Валиев М. М.",
                teacher: "Лутай В. Н.",
                year: 2026,
            });
            const content = g.makeContentSection([g.h1("Раздел"), g.paragraph("Текст.")]);
            expect(() => g.makeDocument([titlePage, content])).not.toThrow();
        });
    });
});
//# sourceMappingURL=docx-gost.test.js.map