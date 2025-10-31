import { nodeBalancerFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerDeleteDialog } from './NodeBalancerDeleteDialog';

import type { ManagerPreferences } from '@linode/utilities';

const props = {
  isFetching: false,
  nodeBalancerError: null,
  open: true,
  selectedNodeBalancer: nodeBalancerFactory.build(),
};

const preference: ManagerPreferences['type_to_confirm'] = true;

const navigate = vi.fn();
const queryMocks = vi.hoisted(() => ({
  useMatch: vi.fn(() => ({})),
  useNavigate: vi.fn(() => navigate),
  usePreferences: vi.fn().mockReturnValue({}),
  userPermissions: vi.fn(() => ({
    data: {
      delete_nodebalancer: true,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    usePreferences: queryMocks.usePreferences,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useMatch: queryMocks.useMatch,
    useNavigate: queryMocks.useNavigate,
  };
});

queryMocks.usePreferences.mockReturnValue({
  data: preference,
});

describe('NodeBalancerDeleteDialog', () => {
  it('renders the NodeBalancerDeleteDialog', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });

    const { getByText } = renderWithTheme(
      <NodeBalancerDeleteDialog {...props} />
    );

    expect(
      getByText('Deleting this NodeBalancer is permanent and can’t be undone.')
    ).toBeVisible();
    expect(
      getByText(
        'Traffic will no longer be routed through this NodeBalancer. Please check your DNS settings and either provide the IP address of another active NodeBalancer, or route traffic directly to your Linode.'
      )
    ).toBeVisible();
    expect(getByText('Delete nodebalancer-id-1?')).toBeVisible();
    expect(getByText('NodeBalancer Label')).toBeVisible();
    expect(getByText('Cancel')).toBeVisible();
    expect(getByText('Delete')).toBeVisible();
  });

  it('calls the onClose function of the dialog', async () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerDeleteDialog {...props} />
    );

    await userEvent.click(getByText('Cancel'));
    expect(navigate).toHaveBeenCalled();
  });

  it('enables inputs and buttons if there is a delete_nodebalancer permissions', () => {
    const { getByTestId } = renderWithTheme(
      <NodeBalancerDeleteDialog {...props} />
    );

    expect(getByTestId('textfield-input')).toBeEnabled();
  });

  it('disables inputs and buttons if no delete_nodebalancer permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        delete_nodebalancer: false,
      },
    });
    const { getByTestId } = renderWithTheme(
      <NodeBalancerDeleteDialog {...props} />
    );

    expect(getByTestId('confirm')).toBeDisabled();
    expect(getByTestId('textfield-input')).toBeDisabled();
  });
});
