import * as React from 'react';
import { cleanup } from 'react-testing-library';

import { users } from 'src/__data__/userSSHKeyObjects';
import { renderWithTheme } from 'src/utilities/testHelpers';

import UserSSHKeyPanel, {
  getSSHKeyString,
  MAX_SSH_KEYS_DISPLAY
} from './UserSSHKeyPanel';

const manyKeys: string[] = [];
for (let i = 0; i < MAX_SSH_KEYS_DISPLAY + 20; i++) {
  manyKeys.push(`key-${i}`);
}

const props = {
  onKeyAddSuccess: jest.fn()
};

afterEach(cleanup);

describe('UserSSHKeyPanel', () => {
  describe('getSSHKeyString helper function', () => {
    it('should truncate a long list of keys', () => {
      expect(getSSHKeyString(manyKeys)).toMatch(/...and 20 more/);
    });

    it('should comma-separate a short list of keys', () => {
      expect(getSSHKeyString(['key-1', 'key-2', 'key-3'])).toEqual(
        'key-1, key-2, key-3'
      );
    });
  });

  describe('SSH panel', () => {
    it('should render an empty state', () => {
      const { queryByTestId } = renderWithTheme(
        <UserSSHKeyPanel users={[]} {...props} />
      );
      expect(queryByTestId('ssh-public-key')).toBeNull();
      expect(queryByTestId('table-row-empty')).toBeInTheDocument();
    });

    it('should render a list of SSH keys', () => {
      const { queryAllByTestId } = renderWithTheme(
        <UserSSHKeyPanel users={users} {...props} />
      );
      expect(queryAllByTestId('ssh-public-key')).toHaveLength(users.length);
    });

    it('should include a button to add a new key', () => {
      const { queryByText } = renderWithTheme(
        <UserSSHKeyPanel {...props} users={[]} />
      );
      expect(queryByText(/Add/i)).toBeInTheDocument();
    });
  });
});
