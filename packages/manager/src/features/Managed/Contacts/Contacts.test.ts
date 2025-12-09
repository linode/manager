import managedContacts, {
  contactWithoutGroup,
} from 'src/__data__/managedContacts';

import { generateGroupsFromContacts } from '../utils';

describe('groupsToContacts', () => {
  it('returns an element for each group represented in contacts', () => {
    const result = generateGroupsFromContacts(managedContacts);
    expect(result).toHaveLength(2);
    expect(result[0].groupName).toBe('DBA');
    expect(result[1].groupName).toBe('Web Server Admin');
  });

  it('ignores contacts without a group', () => {
    const result = generateGroupsFromContacts([
      ...managedContacts,
      contactWithoutGroup,
    ]);
    expect(result).toHaveLength(2);
  });
});
