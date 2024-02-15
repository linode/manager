import { CypressPlugin } from './plugin';

// Dependencies used in hooks have to use `require()` syntax.
const { readdirSync, rmSync } = require('fs'); // eslint-disable-line

export const downloadProcess: CypressPlugin = (on, _config): void => {
  on('task', {
    cleanUpFolder(folderPath) {
      console.log('cleaning up folder %s', folderPath);

      return new Promise((resolve, reject) => {
        try {
          readdirSync(folderPath).forEach((file) => {
            rmSync(`${folderPath}/${file}`, { recursive: true });
          });
          resolve(null);
        } catch (err) {
          reject(err);
        }
      });
    },
  });
};
