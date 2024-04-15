import esbuild, { Plugin } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import htmlMinifierPlugin, { defaultOptions } from '../htmlMinifierPlugin';
import mockFs from 'mock-fs';

describe('htmlMinifierPlugin', () => {
  const copyFilePlugin = (from: string, to: string): Plugin => ({
    name: 'copy-file',
    setup(build) {
      build.onEnd(async () => {
        const baseDirPath = build.initialOptions.absWorkingDir ?? process.cwd();
        await fs.cp(path.join(baseDirPath, from), path.join(baseDirPath, to));
      });
    },
  });

  const sourceDir = 'test-src';
  const sourceFile = path.join(sourceDir, 'page.html');
  const outdir = 'dist';
  const outFile = path.join(outdir, 'page.html');

  const sourceContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Document</title>
      </head>
      <body>
        <p>Hello, world!</p>
      </body>
    </html>
  `;

  const baseOut = '<html lang="en"><head><title>Document</title></head><body><p>Hello, world!</p></body></html>';
  const normalOut = `<!DOCTYPE html>${baseOut}`;
  const shortDoctypeOut = `<!doctype html>${baseOut}`;

  const esbuildPath = path.join(__dirname, '../../node_modules/esbuild');
  const esbuildScopePath = path.join(__dirname, '../../node_modules/@esbuild');

  beforeEach(() => {
    mockFs({
      [path.join(__dirname, sourceFile)]: sourceContent,
      [esbuildPath]: mockFs.load(esbuildPath),
      [esbuildScopePath]: mockFs.load(esbuildScopePath),
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it('should minify files in outdir', async () => {
    await esbuild.build({
      absWorkingDir: __dirname,
      outdir,
      plugins: [
        copyFilePlugin(sourceFile, outFile),
        htmlMinifierPlugin(),
      ],
    });

    const minifiedFilePath = path.join(__dirname, outFile);
    const minified = (await fs.readFile(minifiedFilePath)).toString();
    expect(minified).toBe(normalOut);
  });

  it('should minify files in a specific directory', async () => {
    await esbuild.build({
      absWorkingDir: __dirname,
      plugins: [
        copyFilePlugin(sourceFile, outFile),
        htmlMinifierPlugin({
          include: [`${outdir}/**/*.html`],
          baseDir: 'workingDir',
        }),
      ],
    });

    const minifiedFilePath = path.join(__dirname, outFile);
    const minified = (await fs.readFile(minifiedFilePath)).toString();
    expect(minified).toBe(normalOut);
  });

  it('should minify files while using short doctype', async () => {
    await esbuild.build({
      absWorkingDir: __dirname,
      outdir,
      plugins: [
        copyFilePlugin(sourceFile, outFile),
        htmlMinifierPlugin({
          minifierOptions: {
            ...defaultOptions.minifierOptions,
            useShortDoctype: true,
          },
        }),
      ],
    });

    const minifiedFilePath = path.join(__dirname, outFile);
    const minified = (await fs.readFile(minifiedFilePath)).toString();
    expect(minified).toBe(shortDoctypeOut);
  });

  it('should throw when the buildOptions.baseDir is "outdir" and the outdir option is missing', async () => {
    const building = esbuild.build({
      absWorkingDir: __dirname,
      plugins: [
        htmlMinifierPlugin(),
      ],
    });

    await expect(building).rejects.toThrow(/Must set buildOptions\.outdir if baseDir is "outdir"/);
  });
});
