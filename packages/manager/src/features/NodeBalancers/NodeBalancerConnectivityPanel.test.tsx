import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerConnectivityPanel } from './NodeBalancerConnectivityPanel';

import type { NodeBalancerFieldsState } from './NodeBalancerCreate';

vi.mock('../ReservedIps/IPAddressSelection/IPAddressSelection', () => ({
  IPAddressSelection: ({
    error,
    label,
    onIPModeChange,
    onReservedIPSelect,
  }: any) => (
    <div data-testid="ip-address-selection">
      <span>{label}</span>
      <button onClick={() => onIPModeChange?.('reserved')}>
        Switch to Reserved IP
      </button>
      <button onClick={() => onReservedIPSelect?.({ address: '192.0.2.10' })}>
        Select Reserved IP
      </button>
      {error ? <div>{error}</div> : null}
    </div>
  ),
}));

const baseFields: NodeBalancerFieldsState = {
  configs: [],
  region: 'us-east',
};

const makeProps = (
  overrides: Partial<
    React.ComponentProps<typeof NodeBalancerConnectivityPanel>
  > = {}
) => ({
  frontendIPMode: 'auto' as const,
  nodeBalancerFields: baseFields,
  onBackendIPModeChange: vi.fn(),
  onFrontendIPModeChange: vi.fn(),
  onReservedIPSelect: vi.fn(),
  reservedIPSectionRef: React.createRef<HTMLDivElement>(),
  selectedFrontendIP: null,
  ...overrides,
});

describe('NodeBalancerConnectivityPanel', () => {
  it('renders only the frontend IP selection when premium NodeBalancer is disabled', () => {
    const { getByTestId, queryByText } = renderWithTheme(
      <NodeBalancerConnectivityPanel {...makeProps()} />
    );

    expect(getByTestId('ip-address-selection')).toBeVisible();
    // The "Frontend IP Address" label is used when premium is disabled
    expect(queryByText('Frontend IP Address')).toBeInTheDocument();
    // The Networking heading & backend section only show when premium is enabled
    expect(queryByText('Networking')).not.toBeInTheDocument();
    expect(queryByText('Backend Connectivity')).not.toBeInTheDocument();
    expect(queryByText('VPC')).not.toBeInTheDocument();
    expect(queryByText('IPv6')).not.toBeInTheDocument();
    expect(queryByText('Legacy')).not.toBeInTheDocument();
  });

  it('renders the Networking section and backend radios when premium NodeBalancer is enabled', () => {
    const { getByText, getByLabelText } = renderWithTheme(
      <NodeBalancerConnectivityPanel
        {...makeProps({ isPremiumNodebalancerEnabled: true })}
      />
    );

    expect(getByText('Networking')).toBeVisible();
    expect(
      getByText(
        'Choose how your NodeBalancer connects to the public internet and backend nodes.'
      )
    ).toBeVisible();
    // The IP selection label changes to "Frontend Connectivity" when premium is enabled
    expect(getByText('Frontend Connectivity')).toBeInTheDocument();
    expect(getByText('Backend Connectivity')).toBeVisible();
    expect(getByLabelText('VPC')).toBeInTheDocument();
    expect(getByLabelText('IPv6')).toBeInTheDocument();
    expect(getByLabelText('Legacy')).toBeInTheDocument();
  });

  it('hides the Legacy backend option when NodeBalancer tier is premium', () => {
    const { getByLabelText, queryByLabelText } = renderWithTheme(
      <NodeBalancerConnectivityPanel
        {...makeProps({
          isPremiumNodebalancerEnabled: true,
          nodeBalancerFields: { ...baseFields, type: 'premium' },
        })}
      />
    );

    expect(getByLabelText('VPC')).toBeInTheDocument();
    expect(getByLabelText('IPv6')).toBeInTheDocument();
    expect(queryByLabelText('Legacy')).not.toBeInTheDocument();
  });

  it('reflects the selected backend connectivity option', () => {
    const { getByTestId } = renderWithTheme(
      <NodeBalancerConnectivityPanel
        {...makeProps({
          isPremiumNodebalancerEnabled: true,
          nodeBalancerFields: {
            ...baseFields,
            backend_connectivity: 'ipv6',
          },
        })}
      />
    );

    // <cds-radio-button> exposes `checked` as an element property (set by the
    // @lit/react wrapper), so assert on that rather than a native input.
    expect((getByTestId('backend-connectivity-vpc-radio') as any).checked).toBe(
      false
    );
    expect(
      (getByTestId('backend-connectivity-ipv6-radio') as any).checked
    ).toBe(true);
    expect(
      (getByTestId('backend-connectivity-legacy-radio') as any).checked
    ).toBe(false);
  });

  it('calls onBackendIPModeChange when a backend radio is clicked', async () => {
    const onBackendIPModeChange = vi.fn();
    const { getByTestId } = renderWithTheme(
      <NodeBalancerConnectivityPanel
        {...makeProps({
          isPremiumNodebalancerEnabled: true,
          onBackendIPModeChange,
        })}
      />
    );

    const fireBackendChange = (value: string) => {
      const radio = getByTestId(`backend-connectivity-${value}-radio`);
      fireEvent(
        radio,
        new CustomEvent('change', {
          bubbles: true,
          composed: true,
          detail: { value },
        })
      );
    };

    fireBackendChange('vpc');
    expect(onBackendIPModeChange).toHaveBeenCalledWith('vpc');

    fireBackendChange('ipv6');
    expect(onBackendIPModeChange).toHaveBeenCalledWith('ipv6');

    fireBackendChange('legacy');
    expect(onBackendIPModeChange).toHaveBeenCalledWith('legacy');
  });

  it('disables the backend radios when disabled is true', () => {
    const { getByTestId } = renderWithTheme(
      <NodeBalancerConnectivityPanel
        {...makeProps({
          disabled: true,
          isPremiumNodebalancerEnabled: true,
        })}
      />
    );

    expect(
      (getByTestId('backend-connectivity-vpc-radio') as any).disabled
    ).toBe(true);
    expect(
      (getByTestId('backend-connectivity-ipv6-radio') as any).disabled
    ).toBe(true);
    expect(
      (getByTestId('backend-connectivity-legacy-radio') as any).disabled
    ).toBe(true);
  });

  it('renders the backend connectivity error notice when provided', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerConnectivityPanel
        {...makeProps({
          backendConnectivityError: 'Backend mode is required',
          isPremiumNodebalancerEnabled: true,
        })}
      />
    );

    expect(getByText('Backend mode is required')).toBeVisible();
  });

  it('does not render a backend connectivity error notice when not provided', () => {
    const { queryByText } = renderWithTheme(
      <NodeBalancerConnectivityPanel
        {...makeProps({ isPremiumNodebalancerEnabled: true })}
      />
    );

    expect(queryByText('Backend mode is required')).not.toBeInTheDocument();
  });
});
