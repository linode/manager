import type { Plugin } from 'vite';

/**
 * This is a polyfill for the URL.canParse method, meant to be used with our vite.config.ts file.
 * url.canParse is not supported in older browsers such as Safari <=16 or chrome <=119.
 *
 * see: https://caniuse.com/mdn-api_url_canparse_static
 *
 */
export const urlCanParsePolyfill = (): Plugin => {
  return {
    name: 'url-can-parse-polyfill',
    transformIndexHtml(html: string) {
      return html.replace(
        '<head>',
        `<head>
        <script>
          if (!URL.canParse) {
            URL.canParse = function (url) {
              try {
                new URL(url);
                return true;
              } catch (e) {
                return false;
              }
            };
          }
        </script>`
      );
    },
  };
};
