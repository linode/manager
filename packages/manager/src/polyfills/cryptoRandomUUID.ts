import type { Plugin } from 'vite';

/**
 * This is a polyfill for the crypto.randomUUID method, meant to be used with our vite.config.ts file.
 * crypto.randomUUID is not supported in older browsers such as Safari <=16 or chrome <=119.
 *
 */
export const cryptoRandomUUIDPolyfill = (): Plugin => {
  return {
    name: 'crypto-randomUUID-polyfill',
    transformIndexHtml(html: string) {
      return html.replace(
        '<head>',
        `<head>
        <script>
          if (!window.crypto.randomUUID) {
            window.crypto.randomUUID = function () {
              return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
              });
            };
          }
        </script>`
      );
    },
  };
};
