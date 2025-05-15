import { profileFactory, sshKeyFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { accountUserFactory } from 'src/factories/accountUsers';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserSSHKeyPanel } from './UserSSHKeyPanel';

describe('UserSSHKeyPanel', () => {
  describe('restricted user', () => {
    it('should render an empty state', async () => {
      // Mock a lot of API calls to simulate what a restricted user would get
      server.use(
        http.get('*/profile', () => {
          return HttpResponse.json(profileFactory.build({ restricted: true }));
        }),
        http.get('*/profile/sshkeys', () => {
          return HttpResponse.json(makeResourcePage([]));
        }),
        http.get('*/account/users', () => {
          return HttpResponse.json(makeResourcePage([]), { status: 401 });
        })
      );
      const { queryByTestId } = renderWithTheme(
        <UserSSHKeyPanel authorizedUsers={[]} setAuthorizedUsers={vi.fn()} />
      );
      await waitFor(() => {
        expect(queryByTestId('table-row-empty')).toBeInTheDocument();
      });
    });
    it('should render the restricted users ssh key if they have one', async () => {
      // Mock a lot of API calls to simulate what a restricted user would get
      server.use(
        http.get('*/profile', () => {
          return HttpResponse.json(profileFactory.build({ restricted: true }));
        }),
        http.get('*/profile/sshkeys', () => {
          const sshKeys = [
            sshKeyFactory.build({ label: 'my-ssh-key' }),
            sshKeyFactory.build({ label: 'my-other-ssh-key' }),
          ];
          return HttpResponse.json(makeResourcePage(sshKeys));
        }),
        http.get('*/account/users', () => {
          return HttpResponse.json(makeResourcePage([]), { status: 401 });
        })
      );
      const { getByText } = renderWithTheme(
        <UserSSHKeyPanel authorizedUsers={[]} setAuthorizedUsers={vi.fn()} />
      );
      await waitFor(() => {
        expect(getByText('my-ssh-key', { exact: false })).toBeInTheDocument();
        expect(
          getByText('my-other-ssh-key', { exact: false })
        ).toBeInTheDocument();
      });
    });
  });

  describe('normal user', () => {
    it('should render a row for each user', async () => {
      server.use(
        http.get('*/profile', () => {
          return HttpResponse.json(profileFactory.build({ restricted: false }));
        }),
        http.get('*/account/users', () => {
          const users = [accountUserFactory.build({ username: 'test-user' })];
          return HttpResponse.json(makeResourcePage(users));
        })
      );
      const { getByText } = renderWithTheme(
        <UserSSHKeyPanel authorizedUsers={[]} setAuthorizedUsers={vi.fn()} />
      );
      await waitFor(() => {
        expect(getByText('test-user', { exact: false })).toBeInTheDocument();
      });
    });
    it('should call the update handler when a user is checked', async () => {
      server.use(
        http.get('*/profile', () => {
          return HttpResponse.json(profileFactory.build({ restricted: false }));
        }),
        http.get('*/account/users', () => {
          const users = [
            accountUserFactory.build({
              ssh_keys: ['ssh-key'],
              username: 'test-user',
            }),
          ];
          return HttpResponse.json(makeResourcePage(users));
        })
      );

      const props = {
        authorizedUsers: [],
        setAuthorizedUsers: vi.fn(),
      };

      const { getByRole, getByText } = renderWithTheme(
        <UserSSHKeyPanel {...props} />
      );
      await waitFor(() => {
        expect(getByText('test-user')).toBeInTheDocument();
        expect(getByText('ssh-key')).toBeInTheDocument();
      });
      await userEvent.click(getByRole('checkbox'));
      expect(props.setAuthorizedUsers).toBeCalledWith(['test-user']);
    });
  });
});
