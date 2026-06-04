import { PDFParse } from "pdf-parse";

export async function extractPdfText(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text.replace(/\u0000/g, "").trim();
  } finally {
    await parser.destroy();
  }
}
