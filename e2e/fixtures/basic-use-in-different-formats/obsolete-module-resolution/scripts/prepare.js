const fs = require('node:fs');

const toCopy = {
  '../../src/appLogics.tsx': '../src/appLogics.tsx',
  '../../global.d.ts': '../global.d.ts',
  '../../jest.config.js': '../jest.config.js',
  '../../webpack.config.js': '../webpack.config.js',
};

for (const [k, v] of Object.entries(toCopy)) {
  fs.copyFileSync(`${__dirname}/${k}`, `${__dirname}/${v}`);
}
