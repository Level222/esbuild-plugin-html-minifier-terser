# esbuild-plugin-html-minifier-terser

esbuild plugin to minify html files

## Features

- Using [HTMLMinifier](https://github.com/DanielRuf/html-minifier-terser)
- Minify HTML files output by other plugins such as `@craftamap/esbuild-plugin-html` and `esbuild-plugin-copy`.

## Installation

```shell
npm i -D html-minifier-terser
npm i -D esbuild-plugin-html-minifier-terser
```

## Options

### `include`

Type:  `string | string[]`

Default: `'**/*.html'`

Glob patterns of files to be minified.

### `baseDir`

Type: `'outdir' | 'workingDir'`

Default: `'outdir'`

Base directory for `include` option.

### `minifierOptions`

Type: `import('html-minifier-terser').Options`

Default:

```javascript
{
  caseSensitive: true,
  collapseWhitespace: true,
  keepClosingSlash: true,
  minifyCSS: true,
  minifyJS: true,
  removeComments: true,
}
```

HTMLMinifier options.
Not merged with the default `minifierOptions` object.

## Examples

### Use With `@craftamap/esbuild-plugin-html`

By default, `include` is `'**/*.html'` and `baseDir` is `'outdir'`, so all files with `.html` extension output in the `dist` directory will be minified.

```javascript
// build.js
import esbuild from 'esbuild';
import { htmlPlugin } from '@craftamap/esbuild-plugin-html';
import htmlMinifierPlugin from 'esbuild-plugin-html-minifier-terser';

esbuild.build({
  entryPoints: ['src/main.js'],
  outdir: 'dist',
  metafile: true,
  plugins: [
    htmlPlugin({
      files: [
        {
          entryPoints: ['src/main.js'],
          filename: 'index.html',
        },
      ],
    }),
    htmlMinifierPlugin(),
  ],
});
```

```text
./
  src/
    main.js
  dist/
    main.js
    index.html (will be minified)
  build.js
```

### Minify Specific Files

To minify only specific files, set the glob pattern to `include`. If you need to minify files that are not in `outdir`, set `baseDir` to `'workingDir'`.

```javascript
// build.js
import esbuild from 'esbuild';
import htmlMinifierPlugin from 'esbuild-plugin-html-minifier-terser';

esbuild.build({
  plugins: [
    htmlMinifierPlugin({
      include: 'public/main.html',
      baseDir: 'workingDir',
    }),
  ],
});
```

```text
./
  public/
    main.html (will be minified)
    sub.html
  build.js
```

### Use Custom Options for HTMLMinifier

Customized `minifierOptions` will NOT be merged with the default object.

```javascript
import esbuild from 'esbuild';
import htmlMinifierPlugin from 'esbuild-plugin-html-minifier-terser';

esbuild.build({
  ...
  plugins: [
    htmlMinifierPlugin({
      minifierOptions: {
        collapseWhitespace: true,
        useShortDoctype: true,
      },
    }),
  ],
});
```
