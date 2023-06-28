import fs from 'node:fs';
import os from 'node:os';

import crossSpawn from 'cross-spawn';
import { globSync } from 'glob';

import { PKG_NAME, SERVE_ORIGIN, throwErrIfNpmErr, VERDACCIO_ORIGIN } from './helpers';

const PREV_DIR = process.cwd();

const BASE_DIR = 'e2e/fixtures/basic-use-in-different-formats';

const BASE_URL = `${SERVE_ORIGIN}/${BASE_DIR}`;

beforeAll(() => {
  process.chdir(BASE_DIR);
  throwErrIfNpmErr(
    crossSpawn.sync('npm', ['uninstall', '--no-save', PKG_NAME]),
    `Failed to uninstall '${PKG_NAME}'`
  );
  ['dist', 'package-lock.json'].forEach((p) => {
    try {
      fs.rmSync(p, { recursive: true });
    } catch {}
  });
  throwErrIfNpmErr(
    crossSpawn.sync('npm', ['i', '--registry', VERDACCIO_ORIGIN]),
    'Failed to install deps'
  );
  appendLogsToStatofuReactInNodeModules();
  throwErrIfNpmErr(crossSpawn.sync('npx', ['webpack']), 'Webpack failure');

  ['obsolete-module-resolution'].forEach((subdir) => {
    try {
      fs.rmSync(`${subdir}/dist`, { recursive: true });
    } catch {}
    throwErrIfNpmErr(
      crossSpawn.sync('node', [`${subdir}/scripts/prepare.js`]),
      `Failed to prepare dir '${subdir}'`
    );
    throwErrIfNpmErr(
      crossSpawn.sync('npx', [
        'webpack',
        '--config',
        `./${subdir}/webpack.config.js`,
        '--config',
        `./${subdir}/webpack.merge.config.js`,
      ]),
      `Webpack failure (in subdir '${subdir}')`
    );
  });
});

afterAll(() => {
  process.chdir(PREV_DIR);
});

describe('on browser', () => {
  [
    'bundle-cjs',
    'bundle-esm-by-default',
    'bundle-umd',
    'plain-script-umd',
    'obsolete-module-resolution/bundle-esm-by-default',
  ].forEach((fullFormat) => {
    test(`in format '${fullFormat}', runs well with the correct files imported`, async () => {
      const { importedFormat, subdirEndingWithSlash, mainFileFormat } = parseFullFormat(fullFormat);
      const consoleLogs: string[] = [];
      page.on('console', (cm) => consoleLogs.push(cm.text()));
      await page.goto(
        `${BASE_URL}/${subdirEndingWithSlash}public/index.browser-${mainFileFormat}.html`
      );
      const logsAsText = consoleLogs.join(os.EOL);
      expect(logsAsText).toInclude(`statofu-react/dist/statofu-react.${importedFormat}.min.js`);
      await expect(page).toMatchElement('#root', { text: 'success', timeout: 2000 });
    });
  });
});

describe('on node', () => {
  ['import-cjs-by-default', 'require-cjs-by-default'].forEach((fullFormat) => {
    test(`in format '${fullFormat}', runs well with the correct files imported`, () => {
      const { importedFormat, subdirEndingWithSlash, mainFileFormat } = parseFullFormat(fullFormat);
      const mainFilePrefix = `${subdirEndingWithSlash}src/index.node-${mainFileFormat}`;
      const mainFile = [`${mainFilePrefix}.js`, `${mainFilePrefix}.mjs`].find((p) =>
        fs.existsSync(p)
      );
      if (!mainFile) {
        throw new Error('Main file not found');
      }
      const { stdout } = crossSpawn.sync('node', [mainFile], { encoding: 'utf8' });
      expect(stdout).toInclude(`statofu-react/dist/statofu-react.${importedFormat}.min.js`);
      expect(stdout).toMatch('success');
    });
  });
});

describe('on test runner', () => {
  ['import-cjs-by-default', 'obsolete-module-resolution/import-cjs-by-default'].forEach(
    (fullFormat) => {
      test(`in format '${fullFormat}', runs well with the correct files imported`, () => {
        const { importedFormat, subdirEndingWithSlash, mainFileFormat } =
          parseFullFormat(fullFormat);
        const { stdout, stderr, error } = crossSpawn.sync(
          'npx',
          [
            'jest',
            '--config',
            `./${subdirEndingWithSlash}jest.config.js`,
            `${subdirEndingWithSlash}src/index.test-${mainFileFormat}.ts`,
          ],
          { encoding: 'utf8' }
        );
        expect(error).toBeFalsy();
        const logsAsText = [stdout, stderr].join(os.EOL);
        expect(logsAsText).toInclude(`statofu-react/dist/statofu-react.${importedFormat}.min.js`);
        expect(logsAsText).toMatch('success');
      });
    }
  );
});

function appendLogsToStatofuReactInNodeModules() {
  globSync('node_modules/statofu-react/dist/*.js', { absolute: true }).forEach((file) => {
    const log = file.replace(/\\/g, '/');
    fs.appendFileSync(file, `${os.EOL}console.log('${log}');${os.EOL}`, 'utf8');
  });
}

function parseFullFormat(fullFormat: string) {
  const importedFormat = fullFormat.match(/(bundle|script|import|require)-(\w+)-?/)?.[2];
  const subdirEndingWithSlash = fullFormat.match(/[\w-]+\//)?.[0] ?? '';
  const mainFileFormat = fullFormat.match(/[\w-]+$/)?.[0];
  return { importedFormat, subdirEndingWithSlash, mainFileFormat };
}
