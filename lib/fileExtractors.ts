import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extract text from PDF
 */
export async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer); // Node.js buffer
  const data = await pdfParse(buffer);
  return data.text;
}

/**
 * Extract text from DOCX
 */
export async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}
