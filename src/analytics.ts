/* tslint:disable */
const gaInit = (i: any, s: any, o: any, g: any, r: any, a: any, m: any) => {
  const currdate: any = new Date();
  i['GoogleAnalyticsObject'] = r;
  (i[r] =
    i[r] ||
    function() {
      (i[r].q = i[r].q || []).push(arguments);
    }),
    (i[r].l = 1 * currdate);
  (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m);
};

const initGTM = (w: any, d: any, s: any, l: any, i: any) => {
  w[l] = w[l] || [];
  w[l].push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != 'dataLayer' ? '&l=' + l : '';
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  f.parentNode.insertBefore(j, f);
};
/* tslint:enable */

interface Tracker {
  id?: string;
  name?: string;
}

/**
 * Initiates Google Analytics Tracking Script.
 * Should be called when the app loads
 *
 * @param gaId Your Google Analytics Tracking ID
 * @param production current environment of the app
 */
export const initAnalytics = (production: boolean, ...gaIDs: Tracker[]) => {
  /** if no GA IDs exist */
  if (gaIDs.every(eachID => !eachID)) {
    return;
  }

  const url = production
    ? 'https://www.google-analytics.com/analytics.js'
    : 'https://www.google-analytics.com/analytics_debug.js';

  gaInit(window, document, 'script', url, 'ga', {}, {});

  gaIDs.forEach(eachID => {
    /** if we don't have an ID, don't init GA */
    if (!eachID.id) {
      return;
    }

    const trackerSend = eachID.name ? `${eachID.name}.send` : 'send';

    (window as any).ga('create', eachID.id, 'auto', eachID.name);
    (window as any).ga(trackerSend, 'pageview');
  });
};

/**
 * Initiates Google Tag Manager Tracking Script.
 * Should be called when the app loads
 *
 * @param gtmId Your Google Tag Manager Tracking ID
 */
export const initTagManager = (gtmId?: string) => {
  if (!gtmId) {
    return;
  }

  initGTM(window, document, 'script', 'dataLayer', gtmId);
};
