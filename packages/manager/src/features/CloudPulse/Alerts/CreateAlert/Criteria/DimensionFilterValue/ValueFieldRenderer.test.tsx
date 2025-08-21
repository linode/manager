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

vi.mock('./useFetchOptions', () => ({
  useFetchOptions: () => [
    { label: 'TCP', value: 'tcp' },
    { label: 'UDP', value: 'udp' },
  ],
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
    errorText: '',
    onBlur: vi.fn(),
    onChange: vi.fn(),
    operator: EQ,
    value: null,
    values: null,
  };

  it('renders a TextField if config type is textfield', () => {
    const props = {
      ...defaultProps,
      dimensionLabel: 'port', // assuming this maps to textfield in valueFieldConfig
      operator: EQ,
    };

    renderWithTheme(<ValueFieldRenderer {...props} />);
    expect(screen.getByLabelText('Value')).toBeVisible();
    expect(screen.getByTestId('textfield-input')).toBeVisible();
  });

  it('renders an Autocomplete if config type is autocomplete', () => {
    const props = {
      ...defaultProps,
      dimensionLabel: 'protocol', // assuming this maps to autocomplete
      operator: IN,
      values: ['tcp', 'udp'],
    };

    renderWithTheme(<ValueFieldRenderer {...props} />);
    expect(screen.getByRole('combobox')).toBeVisible();
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
      operator: IN,
      onBlur,
    };

    renderWithTheme(<ValueFieldRenderer {...props} />);
    const input = screen.getByLabelText('Value');
    await user.click(input);
    await user.tab(); // blur
    expect(onBlur).toHaveBeenCalled();
  });

  it('calls onChange from Autocomplete', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const props = {
      ...defaultProps,
      dimensionLabel: 'protocol',
      operator: IN,
      onChange,
      values: ['tcp', 'udp'],
    };

    renderWithTheme(<ValueFieldRenderer {...props} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'TCP');
    await user.click(await screen.findByText('TCP'));

    expect(onChange).toHaveBeenLastCalledWith('tcp');
  });

  it('returns TextField when no config and no operator is found', () => {
    // fallback case
    const props = {
      ...defaultProps,
      dimensionLabel: 'nonexistent',
      operator: null,
    };

    renderWithTheme(<ValueFieldRenderer {...props} />);
    expect(screen.getByTestId('textfield-input')).toBeVisible();
  });
});
