import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import NodeBalancerCreate from './NodeBalancerCreate';

const createNodeBalancerMock = vi.fn().mockResolvedValue({
  id: 1,
  region: 'us-east',
});
const createNodeBalancerBetaMock = vi.fn().mockResolvedValue({
  id: 2,
  region: 'us-east',
});

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => vi.fn()),
  useFlags: vi.fn().mockReturnValue({}),
  useIsReserveIpEnabled: vi.fn(() => ({ isReserveIpEnabled: true })),
  useParams: vi.fn().mockReturnValue({ id: undefined }),
  userPermissions: vi.fn(() => ({
    data: {
      create_firewall: true,
      create_nodebalancer: true,
    },
  })),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useNodebalancerCreateMutation: vi.fn(() => ({
      error: null,
      isPending: false,
      mutateAsync: createNodeBalancerMock,
    })),
    useNodebalancerCreateBetaMutation: vi.fn(() => ({
      error: null,
      isPending: false,
      mutateAsync: createNodeBalancerBetaMock,
    })),
    useMutateAccountAgreements: vi.fn(() => ({
      mutateAsync: vi.fn().mockResolvedValue({}),
    })),
  };
});

vi.mock('../ReservedIps/IPAddressSelection/IPAddressSelection', () => ({
  IPAddressSelection: ({ onIPModeChange, onReservedIPSelect }: any) => (
    <div>
      <button onClick={() => onIPModeChange?.('reserved')}>
        Switch to Reserved IP
      </button>
      <button
        onClick={() =>
          onReservedIPSelect?.({
            address: '192.0.2.123',
          })
        }
      >
        Select Reserved IP
      </button>
    </div>
  ),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useParams: queryMocks.useParams,
  };
});

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('src/features/ReservedIps/utils', () => ({
  useIsReserveIpEnabled: queryMocks.useIsReserveIpEnabled,
}));

// Note: see nodeblaancers-create-in-complex-form.spec.ts for an e2e test of this flow
describe('NodeBalancerCreate', () => {
  queryMocks.useFlags.mockReturnValue({
    nodebalancerVpc: true,
  });
  queryMocks.useParams.mockReturnValue({ id: undefined });

  beforeEach(() => {
    createNodeBalancerMock.mockClear();
    createNodeBalancerBetaMock.mockClear();
    queryMocks.useIsReserveIpEnabled.mockReturnValue({
      isReserveIpEnabled: true,
    });
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_firewall: true,
        create_nodebalancer: true,
      },
    });
  });

  const getCreatePayload = () => {
    const [createCall] = createNodeBalancerMock.mock.calls;
    const [createBetaCall] = createNodeBalancerBetaMock.mock.calls;
    return createCall?.[0] ?? createBetaCall?.[0];
  };

  it('renders all parts of the NodeBalancerCreate page', () => {
    const { getAllByText, getByLabelText, getByText } = renderWithTheme(
      <NodeBalancerCreate />
    );

    // confirm nodebalancer fields render
    expect(getByLabelText('NodeBalancer Label')).toBeVisible();
    expect(getByLabelText('Add Tags')).toBeVisible();
    expect(getByLabelText('Region')).toBeVisible();

    // confirm Firewall panel renders
    expect(getByLabelText('Assign Firewall')).toBeVisible();
    expect(getByText('Create Firewall')).toBeVisible();
    expect(
      getByText(
        /Assign an existing Firewall to this NodeBalancer to control inbound network traffic./
      )
    ).toBeVisible();

    // confirm VPC Panel renders
    expect(getByLabelText('VPC')).toBeVisible();

    // confirm default configuration renders - only confirming headers, as we have additional
    // unit tests to check the functionality of the NodeBalancerConfigPanel
    expect(getByText('Configuration - Port 80')).toBeVisible();
    expect(getByText('Active Health Checks')).toBeVisible();
    expect(getAllByText('Passive Checks')).toHaveLength(2);
    expect(getByText('Backend Nodes')).toBeVisible();

    // confirm summary renders
    expect(getByText('Summary')).toBeVisible();
    expect(getByText('Configs')).toBeVisible();
    expect(getByText('Nodes')).toBeVisible();
    expect(getByText('Create NodeBalancer')).toBeVisible();
  });

  it('should disable "Create NodeBalancer" button if user lacks permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_firewall: false,
        create_nodebalancer: false,
      },
    });
    const { getByText } = renderWithTheme(<NodeBalancerCreate />);

    const createButton = getByText('Create NodeBalancer');
    expect(createButton).toBeDisabled();
  });

  it('includes ipv4 in the create payload when reserve IP feature is enabled and reserved mode is selected', async () => {
    const { getByText } = renderWithTheme(<NodeBalancerCreate />);

    await userEvent.click(getByText('Switch to Reserved IP'));
    await userEvent.click(getByText('Select Reserved IP'));
    await userEvent.click(getByText('Create NodeBalancer'));

    await waitFor(() => {
      expect(
        createNodeBalancerMock.mock.calls.length +
          createNodeBalancerBetaMock.mock.calls.length
      ).toBe(1);
    });

    expect(getCreatePayload()).toEqual(
      expect.objectContaining({
        ipv4: '192.0.2.123',
      })
    );
  });

  it('does not include ipv4 in the create payload when reserve IP feature is enabled and mode remains auto', async () => {
    const { getByText } = renderWithTheme(<NodeBalancerCreate />);

    await userEvent.click(getByText('Create NodeBalancer'));

    await waitFor(() => {
      expect(
        createNodeBalancerMock.mock.calls.length +
          createNodeBalancerBetaMock.mock.calls.length
      ).toBe(1);
    });

    const createPayload = getCreatePayload();
    expect(createPayload).not.toHaveProperty('ipv4');
  });

  it('does not include ipv4 in the create payload when reserve IP feature is disabled', async () => {
    queryMocks.useIsReserveIpEnabled.mockReturnValue({
      isReserveIpEnabled: false,
    });

    const { getByText, queryByText } = renderWithTheme(<NodeBalancerCreate />);

    expect(queryByText('Switch to Reserved IP')).not.toBeInTheDocument();
    expect(queryByText('Select Reserved IP')).not.toBeInTheDocument();

    await userEvent.click(getByText('Create NodeBalancer'));

    await waitFor(() => {
      expect(
        createNodeBalancerMock.mock.calls.length +
          createNodeBalancerBetaMock.mock.calls.length
      ).toBe(1);
    });

    const createPayload = getCreatePayload();
    expect(createPayload).not.toHaveProperty('ipv4');
  });
});
