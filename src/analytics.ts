/* tslint:disable */
function gaInit(i: any, s: any, o: any, g: any, r: any, a: any, m: any) {
  const currdate: any = new Date();
  i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
    (i[r].q = i[r].q || []).push(arguments)
  }, i[r].l = 1 * currdate; a = s.createElement(o),
    m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
};
/* tslint:enable */

export default function init(gaId?: string, production: boolean = false) {
  if (!gaId) {
    return;
  }

  const url = production
    ? 'https://www.google-analytics.com/analytics.js'
    : 'https://www.google-analytics.com/analytics_debug.js';

  gaInit(window, document, 'script', url, 'ga', {}, {});

  (window as any).ga('create', gaId, 'auto');
  (window as any).ga('send', 'pageview');
}
