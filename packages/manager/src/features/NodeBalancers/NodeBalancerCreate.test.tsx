import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import NodeBalancerCreate from './NodeBalancerCreate';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => vi.fn()),
  useFlags: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

// Note: see nodeblaancers-create-in-complex-form.spec.ts for an e2e test of this flow
describe('NodeBalancerCreate', () => {
  queryMocks.useFlags.mockReturnValue({
    nodebalancerVpc: true,
  });
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
    expect(getByLabelText('Assign VPC')).toBeVisible();

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
});
