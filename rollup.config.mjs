import path from 'node:path';

import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { camelCase, isEmpty } from 'lodash';

/**
 * @typedef {import("rollup").RollupOptionsFunction} RollupOptionsFunction
 * @typedef {import("rollup").ModuleFormat} ModuleFormat
 * @typedef {import("rollup").OutputOptions} OutputOptions
 * @typedef {import("rollup").GlobalsOption} GlobalsOption
 */

const pkgName = 'statofu-react';
const inputDir = 'src';
const inputs = ['src/index.ts'];
const outputDir = 'dist';

/**
 * @type {GlobalsOption}
 */
const globals = {
  react: 'React',
  statofu: 'statofu',
};

/**
 * @type {RollupOptionsFunction}
 */
export default (cliArgs) => {
  /** @type {ModuleFormat} */
  const format = cliArgs.format;

  return inputs.map((input) => {
    const inputName = evaluateInputName(input);
    const outputFilePrefix = evaluateOutputFilePrefix(input, format);

    /** @type {OutputOptions} */
    const outputCommon = {
      globals,
      format,
      name: inputName,
      sourcemap: true,
    };

    /** @type {OutputOptions} */
    const outputNormal = {
      ...outputCommon,
      file: `${outputFilePrefix}.js`,
      plugins: [
        terser({
          format: { comments: false, beautify: true },
          compress: false,
          mangle: false,
        }),
      ],
    };

    /** @type {OutputOptions} */
    const outputCompressed = {
      ...outputCommon,
      file: `${outputFilePrefix}.min.js`,
      plugins: [
        terser({
          format: { comments: false },
          mangle: {
            properties: { regex: /^_/ },
          },
        }),
      ],
    };

    return {
      input,
      output: [outputNormal, outputCompressed],
      external: Object.keys(globals),
      plugins: [
        nodeResolve(),
        commonjs(),
        typescript({
          compilerOptions: {
            ...(format === 'umd' ? { target: 'es5' } : {}),
          },
        }),
      ],
    };
  });
};

/**
 * @param {string} input
 * @returns {string}
 */
function evaluateInputName(input) {
  const { dir, name } = path.parse(path.relative(inputDir, input));
  return camelCase(
    [
      pkgName,
      ...(isEmpty(dir) ? [] : dir.split(/[\\/]/)),
      ...(name === 'index' ? [] : [name]),
    ].join('-')
  );
}

/**
 * @param {string} input
 * @param {ModuleFormat} format
 * @returns {string}
 */
function evaluateOutputFilePrefix(input, format) {
  const { dir, name } = path.parse(path.relative(inputDir, input));

  const parentInfo = isEmpty(dir) ? pkgName : [pkgName, dir].join('-');

  const namePrefix = `${name === 'index' ? parentInfo : [parentInfo, name].join('-')}.${format}`;

  return path.join(outputDir, namePrefix);
}
