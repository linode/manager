import * as React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from 'src/utilities/testHelpers';
import AddFirewallDrawer, { CombinedProps } from './AddFirewallDrawer';
import { rest, server } from 'src/mocks/testServer';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { linodeFactory } from 'src/factories/linodes';
import { profileFactory } from 'src/factories';
import { grantsFactory } from 'src/factories/grants';
import { QueryClient } from 'react-query';

jest.mock('src/components/EnhancedSelect/Select');

const props: CombinedProps = {
  onClose: jest.fn(),
  onSubmit: jest.fn().mockResolvedValue({}),
  title: 'Create Firewall',
  open: true,
};

describe('Create Firewall Drawer', () => {
  it('should render a title', () => {
    renderWithTheme(<AddFirewallDrawer {...props} />);
    const title = within(screen.getByTestId('drawer-title')).getByText(
      'Create Firewall'
    );
    expect(title).toBeVisible();
  });

  it('should validate the form on submit', async () => {
    renderWithTheme(<AddFirewallDrawer {...props} />);
    userEvent.type(screen.getByLabelText('Label'), 'a');
    userEvent.click(screen.getByTestId('create-firewall-submit'));
    const error = await screen.findByText(
      /Label must be between 3 and 32 characters./i
    );
    expect(error).toBeInTheDocument();
  });

  it('should default inbound and outbound policy to ACCEPT', async () => {
    renderWithTheme(<AddFirewallDrawer {...props} />);
    const label = '123abc!@#';
    userEvent.type(screen.getByLabelText('Label'), label);
    userEvent.click(screen.getByTestId('create-firewall-submit'));
    await waitFor(() =>
      expect(props.onSubmit).toHaveBeenCalledWith({
        devices: {
          linodes: [],
        },
        label,
        rules: {
          inbound_policy: 'ACCEPT',
          outbound_policy: 'ACCEPT',
        },
      })
    );
  });

  describe('restricted user support', () => {
    it('should not show a read only linode for a restricted user', async () => {
      server.use(
        rest.get('*/linode/instances', (req, res, ctx) => {
          return res(
            ctx.json(
              makeResourcePage([
                linodeFactory.build({ id: 0, label: 'linode-0' }),
                linodeFactory.build({ id: 1, label: 'linode-1' }),
              ])
            )
          );
        }),
        rest.get('*/profile', (req, res, ctx) => {
          return res(ctx.json(profileFactory.build({ restricted: true })));
        }),
        rest.get('*/profile/grants', (req, res, ctx) => {
          return res(
            ctx.json(
              grantsFactory.build({
                global: { add_firewalls: true },
                linode: [
                  { id: 0, permissions: 'read_write' },
                  { id: 1, permissions: 'read_only' },
                ],
              })
            )
          );
        })
      );

      const { queryByText } = renderWithTheme(
        <AddFirewallDrawer {...props} />,
        { queryClient: new QueryClient() }
      );

      await waitFor(() => expect(queryByText('linode-0')).toBeInTheDocument());
      expect(queryByText('linode-1')).not.toBeInTheDocument();
    });
  });
});
