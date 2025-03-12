import { regionFactory } from '@linode/utilities';
import * as React from 'react';

// @todo: modularization - replace 'testHelpers' with 'testHelpers' from the shared package once available.
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RegionSelect } from './RegionSelect';

import type { RegionSelectProps } from './RegionSelect.types';
import type { Region } from '@linode/api-v4';

describe('RegionSelect', () => {
  const regions: Region[] = regionFactory.buildList(3);

  const props: RegionSelectProps = {
    accountAvailabilityData: [],
    accountAvailabilityLoading: false,
    currentCapability: 'Linodes',
    disabled: false,
    errorText: '',
    flags: {},
    helperText: '',
    label: '',
    onChange: vi.fn(),
    regions,
    required: false,
    tooltipText: '',
    value: '',
    width: 100,
  };

  it('should render a Select component', () => {
    const { getByTestId } = renderWithTheme(<RegionSelect {...props} />);
    expect(getByTestId('region-select')).toBeInTheDocument();
  });

  it('should render a Select component with the correct label', () => {
    const { getByText } = renderWithTheme(
      <RegionSelect {...props} label="Region" />
    );
    expect(getByText('Region')).toBeInTheDocument();
  });

  it('should render a Select component with the correct helper text', () => {
    const { getByText } = renderWithTheme(
      <RegionSelect {...props} helperText="helper text" />
    );
    expect(getByText('helper text')).toBeInTheDocument();
  });

  it('should render a Select component with the correct error text', () => {
    const { getByText } = renderWithTheme(
      <RegionSelect {...props} errorText="error text" />
    );
    expect(getByText('error text')).toBeInTheDocument();
  });

  it('should render a Select component with the correct required text', () => {
    const { getByTestId } = renderWithTheme(
      <RegionSelect {...props} required={true} />
    );
    expect(getByTestId('textfield-input')).toHaveAttribute('required');
  });

  it('should render a Select component with the correct disabled state', () => {
    const { getByTestId } = renderWithTheme(
      <RegionSelect {...props} disabled={true} />
    );
    expect(getByTestId('textfield-input')).toBeDisabled();
  });
});
