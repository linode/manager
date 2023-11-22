import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { QueryClient } from '@tanstack/react-query';

import { profileFactory, sshKeyFactory } from 'src/factories';
import { accountUserFactory } from 'src/factories/accountUsers';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import UserSSHKeyPanel from './UserSSHKeyPanel';

describe('UserSSHKeyPanel', () => {
  describe('restricted user', () => {
    it('should render an empty state', async () => {
      // Mock a lot of API calls to simulate what a restricted user would get
      server.use(
        rest.get('*/profile', (req, res, ctx) => {
          return res(ctx.json(profileFactory.build({ restricted: true })));
        }),
        rest.get('*/profile/sshkeys', (req, res, ctx) => {
          return res(ctx.json(makeResourcePage([])));
        }),
        rest.get('*/account/users', (req, res, ctx) => {
          return res(ctx.status(401), ctx.json(makeResourcePage([])));
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
        rest.get('*/profile', (req, res, ctx) => {
          return res(ctx.json(profileFactory.build({ restricted: true })));
        }),
        rest.get('*/profile/sshkeys', (req, res, ctx) => {
          const sshKeys = [
            sshKeyFactory.build({ label: 'my-ssh-key' }),
            sshKeyFactory.build({ label: 'my-other-ssh-key' }),
          ];
          return res(ctx.json(makeResourcePage(sshKeys)));
        }),
        rest.get('*/account/users', (req, res, ctx) => {
          return res(ctx.status(401), ctx.json(makeResourcePage([])));
        })
      );
      const { getByText } = renderWithTheme(
        <UserSSHKeyPanel authorizedUsers={[]} setAuthorizedUsers={vi.fn()} />,
        { queryClient: new QueryClient() }
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
        rest.get('*/profile', (req, res, ctx) => {
          return res(ctx.json(profileFactory.build({ restricted: false })));
        }),
        rest.get('*/account/users', (req, res, ctx) => {
          const users = [accountUserFactory.build({ username: 'test-user' })];
          return res(ctx.json(makeResourcePage(users)));
        })
      );
      const { getByText } = renderWithTheme(
        <UserSSHKeyPanel authorizedUsers={[]} setAuthorizedUsers={vi.fn()} />,
        { queryClient: new QueryClient() }
      );
      await waitFor(() => {
        expect(getByText('test-user', { exact: false })).toBeInTheDocument();
      });
    });
    it('should call the update handler when a user is checked', async () => {
      server.use(
        rest.get('*/profile', (req, res, ctx) => {
          return res(ctx.json(profileFactory.build({ restricted: false })));
        }),
        rest.get('*/account/users', (req, res, ctx) => {
          const users = [
            accountUserFactory.build({
              ssh_keys: ['ssh-key'],
              username: 'test-user',
            }),
          ];
          return res(ctx.json(makeResourcePage(users)));
        })
      );

      const props = {
        authorizedUsers: [],
        setAuthorizedUsers: vi.fn(),
      };

      const { getByRole, getByText } = renderWithTheme(
        <UserSSHKeyPanel {...props} />,
        { queryClient: new QueryClient() }
      );
      await waitFor(() => {
        expect(getByText('test-user')).toBeInTheDocument();
        expect(getByText('ssh-key')).toBeInTheDocument();
      });
      userEvent.click(getByRole('checkbox'));
      expect(props.setAuthorizedUsers).toBeCalledWith(['test-user']);
    });
  });
});
