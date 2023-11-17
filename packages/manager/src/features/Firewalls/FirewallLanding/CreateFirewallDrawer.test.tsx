import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  firewallFactory,
  linodeFactory,
  nodeBalancerFactory,
} from 'src/factories';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateFirewallDrawer } from './CreateFirewallDrawer';

const props = {
  onClose: vi.fn(),
  onFirewallCreated: vi.fn(),
  open: true,
};

describe('Create Firewall Drawer', () => {
  it('should close the drawer on cancel', () => {
    renderWithTheme(<CreateFirewallDrawer {...props} />);
    userEvent.click(screen.getByTestId('cancel'));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('should render a title', () => {
    renderWithTheme(<CreateFirewallDrawer {...props} />);
    const title = within(screen.getByTestId('drawer-title')).getByText(
      'Create Firewall'
    );
    expect(title).toBeVisible();
  });

  it('should validate the form on submit', async () => {
    renderWithTheme(<CreateFirewallDrawer {...props} />);
    userEvent.type(screen.getByLabelText('Label (required)'), 'a');
    userEvent.click(screen.getByTestId('submit'));
    const error = await screen.findByText(
      /Label must be between 3 and 32 characters./i
    );
    expect(error).toBeInTheDocument();
  });

  it('should be able to submit when fields are filled out correctly', async () => {
    const options = { label: 'test-label' };

    server.use(
      rest.post('*/networking/firewalls', (req, res, ctx) => {
        return res(ctx.json(firewallFactory.build({ label: options.label })));
      })
    );

    server.use(
      rest.get('*/nodebalancers', (req, res, ctx) => {
        return res(
          ctx.json(nodeBalancerFactory.buildList(1, { label: 'nodebalancer1' }))
        );
      })
    );

    server.use(
      rest.get('*/linode/instances/', (req, res, ctx) => {
        return res(ctx.json(linodeFactory.buildList(1, { label: 'linode1' })));
      })
    );

    const { getByTestId } = renderWithTheme(
      <CreateFirewallDrawer {...props} />
    );

    act(() => {
      userEvent.type(screen.getByLabelText('Label (required)'), options.label);
      userEvent.type(screen.getByLabelText('Linodes'), 'linode1');
      // userEvent.type(screen.getByLabelText('NodeBalancers'), 'nodebalancer1');

      userEvent.click(getByTestId('submit'));
    });

    await waitFor(() => expect(props.onClose).toHaveBeenCalledTimes(1));
  });
});
