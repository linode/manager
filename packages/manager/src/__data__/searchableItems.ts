export const searchableItems = [
  {
    data: { tags: ['my-app'] },
    entityType: 'linode',
    label: 'test-linode-001',
    value: 1,
  },
  {
    data: { tags: ['my-app2', 'production'] },
    entityType: 'linode',
    label: 'test-linode-002',
    value: 2,
  },
  {
    data: { tags: ['unrelated-app', 'production'] },
    entityType: 'linode',
    label: 'test-linode-003',
    value: 3,
  },
  { data: { tags: [] }, entityType: 'domain', label: 'my-app', value: 4 },
];
