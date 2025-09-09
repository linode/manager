import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerActionMenu } from './NodeBalancerActionMenu';

const navigate = vi.fn();
const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => navigate),
  useRouter: vi.fn(() => vi.fn()),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useRouter: queryMocks.useRouter,
  };
});

const props = {
  label: 'nodebalancer-1',
  nodeBalancerId: 1,
  toggleDialog: vi.fn(),
};

describe('NodeBalancerActionMenu', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the NodeBalancerActionMenu', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerActionMenu {...props} />
    );

    expect(getByText('Configurations')).toBeVisible();
    expect(getByText('Settings')).toBeVisible();
    expect(getByText('Delete')).toBeVisible();
  });

  it('triggers the action to delete the NodeBalancer', async () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerActionMenu {...props} />
    );

    const deleteButton = getByText('Delete');
    await userEvent.click(deleteButton);
    expect(navigate).toHaveBeenCalled();
  });
});
