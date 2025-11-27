import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import * as shared from '../../shared';
import { MultiplePrefixListSelect } from './MutiplePrefixListSelect';

const queryMocks = vi.hoisted(() => ({
  useAllFirewallPrefixListsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllFirewallPrefixListsQuery: queryMocks.useAllFirewallPrefixListsQuery,
  };
});

const spy = vi.spyOn(shared, 'useIsFirewallRulesetsPrefixlistsEnabled');
describe('MultiplePrefixListSelect', () => {
  beforeEach(() => {
    spy.mockReturnValue({
      isFirewallRulesetsPrefixlistsFeatureEnabled: true,
      isFirewallRulesetsPrefixListsBetaEnabled: false,
      isFirewallRulesetsPrefixListsLAEnabled: false,
      isFirewallRulesetsPrefixListsGAEnabled: false,
    });
  });

  const onChange = vi.fn();

  const mockPrefixLists = [
    {
      name: 'pl::supports-both',
      ipv4: ['192.168.0.0/24'],
      ipv6: ['2001:db8::/128'],
    }, // PL supported (supports both)
    {
      name: 'pl::supports-only-ipv6',
      ipv4: null,
      ipv6: ['2001:db8:1::/128'],
    }, // supported (supports only ipv6)
    {
      name: 'pl:system:supports-only-ipv4',
      ipv4: ['10.0.0.0/16'],
      ipv6: null,
    }, // supported (supports only ipv4)
    { name: 'pl:system:supports-both', ipv4: [], ipv6: [] }, // supported (supports both)
    { name: 'pl:system:not-supported', ipv4: null, ipv6: null }, // unsupported
  ];

  queryMocks.useAllFirewallPrefixListsQuery.mockReturnValue({
    data: mockPrefixLists,
    isFetching: false,
    error: null,
  });

  it('should render the title only when at least one PL row is added', () => {
    const { getByText } = renderWithTheme(
      <MultiplePrefixListSelect
        onChange={vi.fn()}
        pls={[{ address: '', inIPv4Rule: false, inIPv6Rule: false }]}
      />
    );
    expect(getByText('Prefix List')).toBeVisible();
  });

  it('should not render the title when no PL row is added', () => {
    const { queryByText } = renderWithTheme(
      <MultiplePrefixListSelect onChange={vi.fn()} pls={[]} />
    );
    expect(queryByText('Prefix List')).not.toBeInTheDocument();
  });

  it('should add a new PL row (empty state) when clicking "Add a Prefix List"', async () => {
    const { getByText } = renderWithTheme(
      <MultiplePrefixListSelect onChange={onChange} pls={[]} />
    );

    await userEvent.click(getByText('Add a Prefix List'));
    expect(onChange).toHaveBeenCalledWith([
      { address: '', inIPv4Rule: false, inIPv6Rule: false },
    ]);
  });

  it('should remove a PL row when clicking delete (X)', async () => {
    const onChange = vi.fn();
    const pls = [
      {
        address: 'pl::supports-both',
        inIPv4Rule: true,
        inIPv6Rule: false,
      },
    ];
    const { getByTestId } = renderWithTheme(
      <MultiplePrefixListSelect onChange={onChange} pls={pls} />
    );

    await userEvent.click(getByTestId('delete-pl-0'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('filters out unsupported PLs from dropdown', async () => {
    const pls = [{ address: '', inIPv4Rule: false, inIPv6Rule: false }];
    const { getByRole, queryByText } = renderWithTheme(
      <MultiplePrefixListSelect onChange={onChange} pls={pls} />
    );

    const input = getByRole('combobox');
    await userEvent.type(input, 'pl:system:not-supported');

    expect(queryByText('pl:system:not-supported')).not.toBeInTheDocument();
  });

  it('prevents duplicate selection of PLs', async () => {
    const selectedPLs = [
      {
        address: 'pl::supports-both',
        inIPv4Rule: true,
        inIPv6Rule: false,
      },
      {
        address: 'pl::supports-only-ipv6',
        inIPv4Rule: false,
        inIPv6Rule: true,
      },
      { address: '', inIPv4Rule: false, inIPv6Rule: false },
    ];
    const { getAllByRole, findByText } = renderWithTheme(
      <MultiplePrefixListSelect onChange={onChange} pls={selectedPLs} />
    );

    const inputs = getAllByRole('combobox');
    const lastEmptyInput = inputs[inputs.length - 1];

    // Try to search already selected Prefix List
    await userEvent.type(lastEmptyInput, 'pl::supports-only-ipv6');

    // Display no option available message for already selected Prefix List in dropdown
    const noOptionsMessage = await findByText(
      'You have no options to choose from'
    );
    expect(noOptionsMessage).toBeInTheDocument();
  });

  it('should render a PL select field for each string in PLs', () => {
    const pls = [
      {
        address: 'pl::supports-both',
        inIPv4Rule: true,
        inIPv6Rule: false,
      },
      {
        address: 'pl::supports-only-ipv6',
        inIPv4Rule: false,
        inIPv6Rule: true,
      },
      {
        address: 'pl:system:supports-only-ipv4',
        inIPv6Rule: false,
        inIPv4Rule: true,
      },
    ];
    const { getByDisplayValue, queryAllByTestId } = renderWithTheme(
      <MultiplePrefixListSelect onChange={onChange} pls={pls} />
    );

    expect(queryAllByTestId('prefixlist-select')).toHaveLength(3);
    getByDisplayValue('pl::supports-both');
    getByDisplayValue('pl::supports-only-ipv6');
    getByDisplayValue('pl:system:supports-only-ipv4');
  });

  it('defaults to IPv4 selected and IPv6 unselected when choosing a PL that supports both', async () => {
    const pls = [{ address: '', inIPv4Rule: false, inIPv6Rule: false }];
    const { findByText, getByRole } = renderWithTheme(
      <MultiplePrefixListSelect onChange={onChange} pls={pls} />
    );

    const input = getByRole('combobox');

    // Type the PL name to filter the dropdown
    await userEvent.type(input, 'pl::supports-both');

    // Select the option from the autocomplete dropdown
    const option = await findByText('pl::supports-both');
    await userEvent.click(option);

    expect(onChange).toHaveBeenCalledWith([
      {
        address: 'pl::supports-both',
        inIPv4Rule: true,
        inIPv6Rule: false,
      },
    ]);
  });

  it('defaults to IPv4 selected and IPv6 unselected when choosing a PL that supports only IPv4', async () => {
    const pls = [{ address: '', inIPv4Rule: false, inIPv6Rule: false }];
    const { findByText, getByRole } = renderWithTheme(
      <MultiplePrefixListSelect onChange={onChange} pls={pls} />
    );

    const input = getByRole('combobox');

    // Type the PL name to filter the dropdown
    await userEvent.type(input, 'pl:system:supports-only-ipv4');

    // Select the option from the autocomplete dropdown
    const option = await findByText('pl:system:supports-only-ipv4');
    await userEvent.click(option);

    expect(onChange).toHaveBeenCalledWith([
      {
        address: 'pl:system:supports-only-ipv4',
        inIPv4Rule: true,
        inIPv6Rule: false,
      },
    ]);
  });

  it('defaults to IPv4 unselected and IPv6 selected when choosing a PL that supports only IPv6', async () => {
    const pls = [{ address: '', inIPv4Rule: false, inIPv6Rule: false }];
    const { findByText, getByRole } = renderWithTheme(
      <MultiplePrefixListSelect onChange={onChange} pls={pls} />
    );

    const input = getByRole('combobox');

    // Type the PL name to filter the dropdown
    await userEvent.type(input, 'pl::supports-only-ipv6');

    // Select the option from the autocomplete dropdown
    const option = await findByText('pl::supports-only-ipv6');
    await userEvent.click(option);

    expect(onChange).toHaveBeenCalledWith([
      {
        address: 'pl::supports-only-ipv6',
        inIPv4Rule: false,
        inIPv6Rule: true,
      },
    ]);
  });

  it('renders IPv4 checked + disabled, and IPv6 unchecked + enabled when a prefix list supports both but is only referenced in IPv4 Rule', async () => {
    const pls = [
      { address: 'pl::supports-both', inIPv4Rule: true, inIPv6Rule: false },
    ];
    const { findByTestId } = renderWithTheme(
      <MultiplePrefixListSelect onChange={onChange} pls={pls} />
    );

    const ipv4CheckboxWrapper = await findByTestId('ipv4-checkbox-0');
    const ipv6CheckboxWrapper = await findByTestId('ipv6-checkbox-0');

    const ipv4Checkbox = within(ipv4CheckboxWrapper).getByRole('checkbox');
    const ipv6Checkbox = within(ipv6CheckboxWrapper).getByRole('checkbox');

    // IPv4 Checked and Disabled
    expect(ipv4Checkbox).toBeChecked();
    expect(ipv4Checkbox).toBeDisabled();

    // IPv6 Unchecked and enabled (User can check/select IPv6 since this prefix list supports both IPv4 and IPv6)
    expect(ipv6Checkbox).not.toBeChecked();
    expect(ipv6Checkbox).toBeEnabled();
  });

  it('renders IPv6 checked + disabled, and IPv4 unchecked + enabled when a prefix list supports both but is only referenced in IPv6 Rule', async () => {
    const pls = [
      { address: 'pl::supports-both', inIPv4Rule: false, inIPv6Rule: true },
    ];
    const { findByTestId } = renderWithTheme(
      <MultiplePrefixListSelect onChange={onChange} pls={pls} />
    );

    const ipv4CheckboxWrapper = await findByTestId('ipv4-checkbox-0');
    const ipv6CheckboxWrapper = await findByTestId('ipv6-checkbox-0');

    const ipv4Checkbox = within(ipv4CheckboxWrapper).getByRole('checkbox');
    const ipv6Checkbox = within(ipv6CheckboxWrapper).getByRole('checkbox');

    // IPv4 Unchecked and Enabled (User can check/select IPv4 since this prefix list supports both IPv4 and IPv6)
    expect(ipv4Checkbox).not.toBeChecked();
    expect(ipv4Checkbox).toBeEnabled();

    // IPv6 Checked and Disabled
    expect(ipv6Checkbox).toBeChecked();
    expect(ipv6Checkbox).toBeDisabled();
  });

  it('renders both IPv4 and IPv6 as checked and enabled when the prefix list supports both and is referenced in both IPv4 & IPv6 Rule', async () => {
    const pls = [
      { address: 'pl::supports-both', inIPv4Rule: true, inIPv6Rule: true },
    ];
    const { findByTestId } = renderWithTheme(
      <MultiplePrefixListSelect onChange={onChange} pls={pls} />
    );

    const ipv4CheckboxWrapper = await findByTestId('ipv4-checkbox-0');
    const ipv6CheckboxWrapper = await findByTestId('ipv6-checkbox-0');

    const ipv4Checkbox = within(ipv4CheckboxWrapper).getByRole('checkbox');
    const ipv6Checkbox = within(ipv6CheckboxWrapper).getByRole('checkbox');

    // IPv4 Checked and Enabled
    expect(ipv4Checkbox).toBeChecked();
    expect(ipv4Checkbox).toBeEnabled();

    // IPv6 Checked and Enabled
    expect(ipv6Checkbox).toBeChecked();
    expect(ipv6Checkbox).toBeEnabled();
  });

  it('renders IPv6 unchecked + disabled, and IPv4 checked + disabled when PL only supports IPv4', async () => {
    const pls = [
      {
        address: 'pl:system:supports-only-ipv4',
        inIPv4Rule: true,
        inIPv6Rule: false,
      },
    ];
    const { findByTestId } = renderWithTheme(
      <MultiplePrefixListSelect onChange={onChange} pls={pls} />
    );

    const ipv4CheckboxWrapper = await findByTestId('ipv4-checkbox-0');
    const ipv6CheckboxWrapper = await findByTestId('ipv6-checkbox-0');

    const ipv4Checkbox = within(ipv4CheckboxWrapper).getByRole('checkbox');
    const ipv6Checkbox = within(ipv6CheckboxWrapper).getByRole('checkbox');

    // IPv4 Checked and Disabled
    expect(ipv4Checkbox).toBeChecked();
    expect(ipv4Checkbox).toBeDisabled();

    // IPV6 Unchecked and Disabled
    expect(ipv6Checkbox).not.toBeChecked();
    expect(ipv6Checkbox).toBeDisabled();
  });

  it('renders IPv4 checkbox unchecked + disabled, and IPv6 checked + disabled when PL only supports IPv6', async () => {
    const pls = [
      {
        address: 'pl::supports-only-ipv6',
        inIPv4Rule: false,
        inIPv6Rule: true,
      },
    ];
    const { findByTestId } = renderWithTheme(
      <MultiplePrefixListSelect onChange={onChange} pls={pls} />
    );

    const ipv4CheckboxWrapper = await findByTestId('ipv4-checkbox-0');
    const ipv6CheckboxWrapper = await findByTestId('ipv6-checkbox-0');

    const ipv4Checkbox = within(ipv4CheckboxWrapper).getByRole('checkbox');
    const ipv6Checkbox = within(ipv6CheckboxWrapper).getByRole('checkbox');

    // IPv4 Unchecked and Disabled
    expect(ipv4Checkbox).not.toBeChecked();
    expect(ipv4Checkbox).toBeDisabled();

    // IPV6 Checked and Disabled
    expect(ipv6Checkbox).toBeChecked();
    expect(ipv6Checkbox).toBeDisabled();
  });

  // Toggling of Checkbox is allowed only when PL supports both IPv4 & IPv6
  it('calls onChange with updated values when toggling checkboxes', async () => {
    const pls = [
      { address: 'pl::supports-both', inIPv4Rule: true, inIPv6Rule: false },
    ];
    const { findByTestId } = renderWithTheme(
      <MultiplePrefixListSelect onChange={onChange} pls={pls} />
    );

    const ipv6Checkbox = await findByTestId('ipv6-checkbox-0');
    await userEvent.click(ipv6Checkbox);

    expect(onChange).toHaveBeenCalledWith([
      { address: 'pl::supports-both', inIPv4Rule: true, inIPv6Rule: true },
    ]);
  });
});
