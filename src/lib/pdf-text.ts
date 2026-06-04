import PDFParser from "pdf2json";

export type PdfExtractionSource = "Text PDF";

export type PdfTextExtraction = {
  text: string;
  source: PdfExtractionSource;
};

type Pdf2JsonTextRun = {
  T?: string;
};

type Pdf2JsonText = {
  R?: Pdf2JsonTextRun[];
};

type Pdf2JsonPage = {
  Texts?: Pdf2JsonText[];
};

type Pdf2JsonData = {
  Pages?: Pdf2JsonPage[];
};

function cleanExtractedText(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function hasMeaningfulText(text: string) {
  const letters = text.match(/[a-z]/gi)?.length ?? 0;
  const words = text.match(/\b[a-z][a-z'-]{2,}\b/gi)?.length ?? 0;

  return letters >= 30 && words >= 5;
}

function getParserErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "parserError" in error &&
    error.parserError instanceof Error
  ) {
    return error.parserError.message;
  }

  return String(error);
}

function decodePdfText(text: string) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

function extractTextFromJson(pdfData: Pdf2JsonData) {
  return cleanExtractedText(
    (pdfData.Pages ?? [])
      .map((page) =>
        (page.Texts ?? [])
          .map((textBlock) =>
            (textBlock.R ?? [])
              .map((run) => (run.T ? decodePdfText(run.T) : ""))
              .join("")
          )
          .filter(Boolean)
          .join(" ")
      )
      .filter(Boolean)
      .join("\n\n")
  );
}

async function parsePdfBuffer(buffer: Buffer) {
  return new Promise<{ rawText: string; jsonText: string }>((resolve, reject) => {
    const parser = new PDFParser(null, true);

    parser.once("pdfParser_dataError", (error) => {
      parser.destroy();
      reject(new Error(getParserErrorMessage(error)));
    });

    parser.once("pdfParser_dataReady", (pdfData) => {
      const rawText = cleanExtractedText(parser.getRawTextContent());
      const jsonText = extractTextFromJson(pdfData);

      parser.destroy();
      resolve({ rawText, jsonText });
    });

    parser.parseBuffer(buffer, 0);
  });
}

export async function extractPdfText(
  buffer: Buffer
): Promise<PdfTextExtraction> {
  const { rawText, jsonText } = await parsePdfBuffer(buffer);
  const text = hasMeaningfulText(rawText) ? rawText : jsonText;

  return {
    text: hasMeaningfulText(text) ? text : "",
    source: "Text PDF",
  };
}
