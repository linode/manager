// Add file names to this list for their actions and reducers to be exported.
const generics = [
  'distributions', 'regions', 'types', 'linodes', 'volumes', 'stackscripts', 'kernels', 'domains',
  'nodebalancers', 'profile', 'account', 'events', 'tokens', 'clients', 'users', 'tickets', 'apps',
];

// eslint-disable-next-line global-require
const modules = generics.map((name) => require(`./${name}`));

export function exportWith(exporter) {
  const exports = {};

  modules.forEach(function (module, i) {
    const name = generics[i];
    exports[name] = exporter(module);
  });

  return exports;
}
