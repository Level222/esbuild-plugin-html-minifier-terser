import { BuildOptions, Plugin } from 'esbuild';
import { minify, Options as MinifierOptions } from 'html-minifier-terser';
import { globIterate } from 'glob';
import fs from 'node:fs/promises';
import path from 'node:path';

export type Options = {
  /**
   * Glob patterns of files to be minified.
   */
  include: string | string[];

  /**
   * Base directory for `include` option.
   */
  baseDir: 'outdir' | 'workingDir';

  /**
   * HTMLMinifier options.
   * Not merged with the default `minifierOptions` object.
   */
  minifierOptions: MinifierOptions;
};

export const defaultOptions: Options = {
  include: '**/*.html',
  baseDir: 'outdir',
  minifierOptions: {
    caseSensitive: true,
    collapseWhitespace: true,
    keepClosingSlash: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true,
  },
};

const minifyHTMLFile = async (filePath: string, options: MinifierOptions): Promise<void> => {
  const buffer = await fs.readFile(filePath);
  const content = buffer.toString();
  const minified = await minify(content, options);
  await fs.writeFile(filePath, minified);
};

const getBaseDirPath = (baseDirOption: Options['baseDir'], buildOptions: BuildOptions): string => {
  const workingDir = buildOptions.absWorkingDir ?? process.cwd();

  switch (baseDirOption) {
    case 'outdir':
      if (typeof buildOptions.outdir !== 'string') {
        throw new TypeError('Must set buildOptions.outdir if baseDir is "outdir"');
      }

      return path.join(workingDir, buildOptions.outdir);

    case 'workingDir':
      return workingDir;
  }
};

const htmlMinifierPlugin = (options?: Partial<Options>): Plugin => {
  const { include, baseDir, minifierOptions } = {
    ...defaultOptions,
    ...options,
  };

  return {
    name: 'esbuild-plugin-html-minifier-terser',
    setup(build) {
      build.onEnd(async () => {
        const baseDirPath = getBaseDirPath(baseDir, build.initialOptions);

        const minifyingPromises: Promise<void>[] = [];

        for await (const filePath of globIterate(include, { cwd: baseDirPath })) {
          const minifying = minifyHTMLFile(path.join(baseDirPath, filePath), minifierOptions);
          minifyingPromises.push(minifying);
        }

        await Promise.all(minifyingPromises);
      });
    },
  };
};

export default htmlMinifierPlugin;
