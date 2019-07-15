import { GroupImportProps } from 'src/store/selectors/getEntitiesWithGroupsToImport';

export const linodes: GroupImportProps[] = [
  {
    id: 123456,
    label: 'linode-1',
    tags: ['tag1', 'tag2'],
    group: 'group1'
  },
  {
    id: 234567,
    label: 'linode-2',
    tags: ['tag1', 'tag2'],
    group: 'group2'
  },
  {
    id: 345678,
    label: 'linode-2',
    tags: ['tag1', 'tag2'],
    group: 'group2'
  }
];

export const domains: GroupImportProps[] = [
  {
    id: 11111,
    label: 'domain-1',
    tags: ['tag1', 'tag2'],
    group: 'group1'
  },
  {
    id: 22222,
    label: 'domain-2',
    tags: ['tag1', 'tag2'],
    group: 'group2'
  }
];
