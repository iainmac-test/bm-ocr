#!/usr/bin/env node
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const { resolve, dirname, basename, extname } = require('node:path');
const process = require('node:process');

function usageAndExit(msg, code = 1) {
  if (msg) console.error(`Error: ${msg}`);
  console.error(`\nUsage: bm-ocr \"/path/to/file.pdf\"\n`);
  process.exit(code);
}

const args = process.argv.slice(2);
if (args.length !== 1) usageAndExit('exactly one PDF path is required');

const inputArg = args[0];
const inputPath = resolve(process.cwd(), inputArg);

if (!existsSync(inputPath)) usageAndExit(`file not found: ${inputArg}`);
if (extname(inputPath).toLowerCase() !== '.pdf')
  usageAndExit('input must be a .pdf file');

const dir = dirname(inputPath);
const base = basename(inputPath, '.pdf');
const outputPath = resolve(dir, `${base}_BM_OCR.pdf`);

const flags = [
  '--force-ocr',
  '--rotate-pages',
  '--deskew',
  '--jobs',
  '4',
  '-l',
  'eng',
  '--tesseract-config',
  'keep-spaces.cfg',
  inputPath,
  outputPath,
];

const child = spawn('ocrmypdf', flags, { stdio: 'inherit', env: process.env });

child.on('error', (err) => {
  console.error(
    `\nFailed to start ocrmypdf. Is it installed and on your PATH?\n${err.message}`
  );
  console.error(
    `\nTry:\n  brew install ocrmypdf tesseract poppler ghostscript\n`
  );
  process.exit(1);
});

child.on('exit', (code) => {
  if (code === 0) console.log(`\n✅ Done: ${outputPath}`);
  else console.error(`\n❌ ocrmypdf exited with code ${code}`);
  process.exit(code ?? 1);
});
