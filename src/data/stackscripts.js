export const apiTestStackScript = {
  id: 37,
  label: 'Example StackScript',
  description: 'Installs the Linode API bindings',
  distributions: [
    {},
    {},
  ],
  deployments_total: 150,
  deployments_active: 42,
  is_public: true,
  created: '2015-09-29T11:21:01',
  updated: '2015-10-15T10:02:01',
  rev_note: 'Initial import',
  script: '#!/bin/bash',
  user_defined_fields: [
    {},
    {},
  ],
};

export const testStackScript = {
  ...apiTestStackScript,
  _polling: false,
};

export const testStackScript2 = {
  ...testStackScript,
  id: 38,
  label: 'Example 2',
  is_public: false,
};

export const stackscripts = [
  testStackScript,
  testStackScript2,
];
