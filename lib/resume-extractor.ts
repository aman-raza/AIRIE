import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

function stripXmlTags(value: string) {
  return value
    .replace(/<w:p[^>]*>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim();
}

async function runFirstAvailable(
  commands: Array<{ bin: string; args: string[] }>,
): Promise<string | null> {
  for (const command of commands) {
    try {
      const { stdout } = await execFileAsync(command.bin, command.args, {
        maxBuffer: 6 * 1024 * 1024,
      });
      if (stdout?.trim()) {
        return stdout.trim();
      }
    } catch {
      continue;
    }
  }

  return null;
}

async function extractPdfText(filePath: string) {
  return runFirstAvailable([{ bin: "pdftotext", args: [filePath, "-"] }]);
}

async function extractDocText(filePath: string) {
  return runFirstAvailable([
    { bin: "antiword", args: [filePath] },
    { bin: "catdoc", args: [filePath] },
  ]);
}

async function extractDocxText(filePath: string) {
  const xml = await runFirstAvailable([{ bin: "unzip", args: ["-p", filePath, "word/document.xml"] }]);
  if (!xml) {
    return null;
  }

  return stripXmlTags(xml);
}

export async function extractResumeText(file: File) {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("File too large. Max upload size is 8 MB.");
  }

  const extension = path.extname(file.name).toLowerCase();
  const tmpPath = path.join(os.tmpdir(), `${randomUUID()}${extension}`);

  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(tmpPath, Buffer.from(arrayBuffer));

  try {
    let text: string | null = null;

    if (extension === ".pdf") {
      text = await extractPdfText(tmpPath);
    } else if (extension === ".docx") {
      text = await extractDocxText(tmpPath);
    } else if (extension === ".doc") {
      text = await extractDocText(tmpPath);
    } else {
      throw new Error("Unsupported file type. Upload a PDF, DOC, or DOCX file.");
    }

    if (!text) {
      throw new Error("Could not extract text from this file in the current environment.");
    }

    return text;
  } finally {
    await fs.unlink(tmpPath).catch(() => undefined);
  }
}
