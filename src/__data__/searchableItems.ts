export const searchableItems = [
  {
    value: 1,
    label: 'test-linode-001',
    entityType: 'linode',
    data: { tags: ['my-app'] }
  },
  {
    value: 2,
    label: 'test-linode-002',
    entityType: 'linode',
    data: { tags: ['my-app2', 'production'] }
  },
  {
    value: 3,
    label: 'test-linode-003',
    entityType: 'linode',
    data: { tags: ['unrelated-app', 'production'] }
  },
  { value: 4, label: 'my-app', entityType: 'domain', data: { tags: [] } }
];
