import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ValueFieldRenderer } from './ValueFieldRenderer';

import type {
  CloudPulseServiceType,
  DimensionFilterOperatorType,
} from '@linode/api-v4';

// Mock child components
vi.mock('./FirewallDimensionFilterAutocomplete', () => ({
  FirewallDimensionFilterAutocomplete: (props: any) => (
    <div data-testid="firewall-autocomplete" {...props}>
      Firewall Autocomplete
    </div>
  ),
}));

vi.mock('./ObjectStorageDimensionFilterAutocomplete', () => ({
  ObjectStorageDimensionFilterAutocomplete: (props: any) => (
    <div data-testid="objectstorage-autocomplete" {...props}>
      ObjectStorage Autocomplete
    </div>
  ),
}));

vi.mock('./DimensionFilterAutocomplete', () => ({
  DimensionFilterAutocomplete: (props: any) => (
    <div data-testid="dimensionfilter-autocomplete" {...props}>
      DimensionFilter Autocomplete
    </div>
  ),
}));

const EQ: DimensionFilterOperatorType = 'eq';
const IN: DimensionFilterOperatorType = 'in';
const NB: CloudPulseServiceType = 'nodebalancer';

describe('<ValueFieldRenderer />', () => {
  const defaultProps = {
    serviceType: NB,
    name: `rule_criteria.rules.${0}.dimension_filters.${0}`,
    dimensionLabel: 'protocol',
    disabled: false,
    entities: [],
    errorText: undefined,
    onBlur: vi.fn(),
    onChange: vi.fn(),
    operator: EQ,
    value: null,
    values: null,
  };

  it('renders a TextField if config type is textfield', () => {
    const props = {
      ...defaultProps,
      dimensionLabel: 'port', // maps to textfield in valueFieldConfig
      operator: EQ,
    };

    renderWithTheme(<ValueFieldRenderer {...props} />);
    expect(screen.getByLabelText('Value')).toBeVisible();
    expect(screen.getByTestId('textfield-input')).toBeVisible();
  });

  it('renders DimensionFilterAutocomplete if config type is autocomplete and no custom fetch', () => {
    const props = {
      ...defaultProps,
      dimensionLabel: 'protocol', // maps to autocomplete in valueFieldConfig
      operator: IN,
      values: ['tcp', 'udp'],
    };

    renderWithTheme(<ValueFieldRenderer {...props} />);
    expect(screen.getByTestId('dimensionfilter-autocomplete')).toBeVisible();
  });

  it('renders FirewallDimensionFilterAutocomplete if config.useCustomFetch = firewall', () => {
    const props = {
      ...defaultProps,
      dimensionLabel: 'linode_id', // assume this is configured with useCustomFetch: 'firewall'
      operator: IN,
    };

    renderWithTheme(<ValueFieldRenderer {...props} />);
    expect(screen.getByTestId('firewall-autocomplete')).toBeVisible();
  });

  it('renders ObjectStorageDimensionFilterAutocomplete if config.useCustomFetch = objectstorage', () => {
    const props = {
      ...defaultProps,
      dimensionLabel: 'endpoint', // assume this is configured with useCustomFetch: 'objectstorage'
      operator: IN,
    };

    renderWithTheme(<ValueFieldRenderer {...props} />);
    expect(screen.getByTestId('objectstorage-autocomplete')).toBeVisible();
  });

  it('calls onChange when typing into TextField', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const props = {
      ...defaultProps,
      dimensionLabel: 'port',
      operator: EQ,
      onChange,
    };

    renderWithTheme(<ValueFieldRenderer {...props} />);
    const input = screen.getByLabelText('Value');
    await user.type(input, '8080');
    expect(onChange).toHaveBeenLastCalledWith('8080');
  });

  it('calls onBlur from TextField', async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    const props = {
      ...defaultProps,
      dimensionLabel: 'port',
      operator: EQ,
      onBlur,
    };

    renderWithTheme(<ValueFieldRenderer {...props} />);
    const input = screen.getByLabelText('Value');
    await user.click(input);
    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  it('returns TextField when no config and no operator is found', () => {
    const props = {
      ...defaultProps,
      dimensionLabel: 'nonexistent',
      operator: null,
    };

    renderWithTheme(<ValueFieldRenderer {...props} />);
    expect(screen.getByTestId('textfield-input')).toBeVisible();
  });
});
