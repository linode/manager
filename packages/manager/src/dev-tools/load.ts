// Thanks to https://kentcdodds.com/blog/make-your-own-dev-tools

function loadDevTools(callback: () => any) {
  // we want it enabled by default everywhere but production and we also want
  // to support the dev tools in production (to make us more productive triaging production issues).
  // you can enable the DevTools via localStorage or the query string.
  if (devToolsEnabled()) {
    // use a dynamic import so the dev-tools code isn't bundled with the regular
    // app code so we don't worry about bundle size.
    import('./dev-tools')
      .then((devTools) => devTools.install())
      .finally(callback);
  } else {
    // if we don't need the DevTools, call the callback immediately.
    callback();
  }
}
export default loadDevTools;

// Defaults to FALSE in production builds, but can be explicity enabled with
// query param or local storage.
//
// Defaults to TRUE in development mode, but can be explicity disabled with
// query param or local storage.
export const devToolsEnabled = () => {
  const explicitlyDisabled =
    window.location.search.includes('dev-tools=false') ||
    window.localStorage.getItem('dev-tools') === 'false';
  const explicitlyEnabled =
    window.location.search.includes('dev-tools=true') ||
    window.localStorage.getItem('dev-tools') === 'true';

  return (
    !explicitlyDisabled &&
    (process.env.NODE_ENV === 'development' || explicitlyEnabled)
  );
};
