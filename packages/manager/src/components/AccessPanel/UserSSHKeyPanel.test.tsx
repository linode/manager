import { cleanup } from '@testing-library/react';
import * as React from 'react';

import { users } from 'src/__data__/userSSHKeyObjects';
import { renderWithTheme } from 'src/utilities/testHelpers';

import UserSSHKeyPanel from './UserSSHKeyPanel';

const props = {
  onKeyAddSuccess: jest.fn()
};

afterEach(cleanup);

describe('UserSSHKeyPanel', () => {
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
