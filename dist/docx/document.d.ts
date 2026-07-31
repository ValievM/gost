import { Document, Paragraph, Table } from "docx";
import type { DocxStyleConfig, TitlePageOpts, DocxSection, CaptionCounter, DiagramBlockOpts } from "./types";
export declare function makeTitlePageImpl(st: DocxStyleConfig, opts: TitlePageOpts): DocxSection;
export declare function makeContentSectionImpl(st: DocxStyleConfig, children: Array<Paragraph | Table>): DocxSection;
export declare function makeDocumentImpl(st: DocxStyleConfig, sections: DocxSection[], opts?: {
    styles?: object;
}): Document;
export declare function saveDocumentImpl(doc: Document, outputPath: string): Promise<void>;
export declare function diagramBlockImpl(st: DocxStyleConfig, pumlSource: string, counter: CaptionCounter, captionText: string, opts?: DiagramBlockOpts): Promise<Paragraph[]>;
