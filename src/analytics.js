import { EVENTS } from 'linode-components/utils';

import { store } from '~/store';


function loadGA(debug = false) {
  /* eslint-disable */
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script',`https://www.google-analytics.com/analytics${debug && '_debug' || ''}.js`,'ga');
  /* eslint-enable */
}

function handleEvent(eventName) {
  document.addEventListener(eventName, async function (e) {
    const objectPath = await store.dispatch((_, getState) => getState().analytics.category) || [];
    const { category, action, label, value } = e.detail;
    window.ga('send', 'event', {
      eventCategory: category,
      eventAction: action,
      eventLabel: `${objectPath.join(':')}:${label}`,
      eventValue: value,
    });
  }, false);
}

export function init(environment, GA_ID) {
  if (environment === 'debug') {
    loadGA(true);
    window.ga_debug = { trace: true };
    window.ga('create', GA_ID, { cookieDomain: 'none', debug: true });
  } else {
    loadGA();
    window.ga('create', GA_ID, 'auto');
  }

  EVENTS.map(handleEvent);
}
