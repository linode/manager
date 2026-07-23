import { breakpoints } from '@linode/ui';
import { nodeBalancerFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme, resizeScreenSize } from 'src/utilities/testHelpers';

import { NodeBalancerTableRow } from './NodeBalancerTableRow';

const navigate = vi.fn();
const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => navigate),
  userPermissions: vi.fn(() => ({
    data: {
      delete_nodebalancer: false,
    },
  })),
  useAllNodeBalancerConfigsQuery: vi.fn().mockReturnValue({ data: null }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllNodeBalancerConfigsQuery: queryMocks.useAllNodeBalancerConfigsQuery,
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

const props = {
  ...nodeBalancerFactory.build(),
  onDelete: vi.fn(),
};

describe('NodeBalancerTableRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the NodeBalancer table row', () => {
    const { getByText } = renderWithTheme(<NodeBalancerTableRow {...props} />);

    expect(getByText('nodebalancer-id-1')).toBeVisible();
    expect(getByText('0.0.0.0')).toBeVisible();
    expect(getByText('Configurations')).toBeVisible();
    expect(getByText('Settings')).toBeVisible();
    expect(getByText('Delete')).toBeVisible();
  });

  it('renders the hidden columns when the screen width is large enough', () => {
    resizeScreenSize(breakpoints.values.lg);
    const { getByText } = renderWithTheme(<NodeBalancerTableRow {...props} />);

    expect(getByText('nodebalancer-id-1')).toBeVisible();
    expect(getByText('0 up - 0 down')).toBeVisible();
    expect(getByText('0 bytes')).toBeVisible();
    expect(getByText('0.0.0.0')).toBeVisible();
    expect(getByText('us-east')).toBeVisible();
  });

  it.each([
    ['legacy', 'IPv4'],
    ['ipv6', 'IPv6'],
    ['vpc', 'VPC'],
  ] as const)(
    'renders the backend connectivity column as "%s" -> "%s"',
    (backendConnectivity, expected) => {
      resizeScreenSize(breakpoints.values.lg);
      const { getByText } = renderWithTheme(
        <NodeBalancerTableRow
          {...props}
          backend_connectivity={backendConnectivity}
        />
      );

      expect(getByText(expected)).toBeVisible();
    }
  );

  it('renders a dash for the backend connectivity column when it is undefined', () => {
    resizeScreenSize(breakpoints.values.lg);
    const { getByText } = renderWithTheme(
      <NodeBalancerTableRow {...props} backend_connectivity={undefined} />
    );

    expect(getByText('-')).toBeVisible();
  });

  it('deletes the NodeBalancer', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        delete_nodebalancer: true,
      },
    });
    const { getByText } = renderWithTheme(<NodeBalancerTableRow {...props} />);

    const deleteButton = getByText('Delete');
    await userEvent.click(deleteButton);
    expect(navigate).toHaveBeenCalled();
  });

  it('does not delete the NodeBalancer if the delete button is disabled', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        delete_nodebalancer: false,
      },
    });

    const { getByText } = renderWithTheme(<NodeBalancerTableRow {...props} />);

    const deleteButton = getByText('Delete');
    expect(deleteButton).toBeDisabled(); // Add this assertion

    await userEvent.click(deleteButton);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('renders the Premium badge for a premium NodeBalancer', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerTableRow {...props} type="premium" />,
      { flags: { premiumNodebalancer: true } }
    );

    expect(getByText('Premium')).toBeVisible();
  });

  it('shows the no-config tooltip when a NodeBalancer has no configurations', async () => {
    queryMocks.useAllNodeBalancerConfigsQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { getByTestId } = renderWithTheme(
      <NodeBalancerTableRow {...props} />,
      { flags: { premiumNodebalancer: true } }
    );

    const tooltip = getByTestId('no-config-tooltip');

    expect(tooltip).toBeVisible();

    await userEvent.hover(tooltip);

    // Tooltip copy is inside cds-tooltip shadow DOM
    await waitFor(() => {
      expect(tooltip?.shadowRoot?.textContent ?? '').toContain(
        'To serve traffic, add a port configuration and at least one backend node.'
      );
    });
  });

  it('renders both the Premium badge and the no-config tooltip for a premium NodeBalancer with no configurations', () => {
    queryMocks.useAllNodeBalancerConfigsQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { getByText, getByTestId } = renderWithTheme(
      <NodeBalancerTableRow {...props} type="premium" />,
      { flags: { premiumNodebalancer: true } }
    );

    expect(getByText('Premium')).toBeVisible();
    expect(getByTestId('no-config-tooltip')).toBeVisible();
  });

  it('does not render the no-config tooltip while Nodebalancer configs are loading', () => {
    queryMocks.useAllNodeBalancerConfigsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { queryByTestId } = renderWithTheme(
      <NodeBalancerTableRow {...props} />,
      { flags: { premiumNodebalancer: true } }
    );

    expect(queryByTestId('no-config-tooltip')).not.toBeInTheDocument();
  });
});
