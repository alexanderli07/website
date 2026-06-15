/**
 * Generates a minimal, VALID one-page PDF at public/resume.pdf so the "Résumé"
 * button works out of the box. Replace public/resume.pdf with your real résumé.
 *
 * Run:  node scripts/make-placeholder-resume.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";

const objs = [];
objs.push("<< /Type /Catalog /Pages 2 0 R >>");
objs.push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
objs.push(
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
);
const content =
  "BT /F1 26 Tf 72 706 Td (Alexander Li) Tj " +
  "/F1 13 Tf 0 -30 Td (Resume placeholder) Tj " +
  "0 -22 Td (Replace public/resume.pdf with your real resume PDF.) Tj ET";
objs.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
objs.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

let pdf = "%PDF-1.4\n";
const offsets = [];
objs.forEach((o, i) => {
  offsets.push(pdf.length);
  pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
});
const xrefPos = pdf.length;
pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
offsets.forEach((off) => {
  pdf += String(off).padStart(10, "0") + " 00000 n \n";
});
pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

mkdirSync("public", { recursive: true });
writeFileSync("public/resume.pdf", Buffer.from(pdf, "latin1"));
console.log("Wrote public/resume.pdf (" + pdf.length + " bytes)");
