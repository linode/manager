import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { dashboardFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PORTS_ERROR_MESSAGE, PORTS_HELPER_TEXT } from '../Utils/constants';
import { CloudPulsePortFilter } from './CloudPulsePortFilter';

import type { CloudPulsePortFilterProps } from './CloudPulsePortFilter';

const mockHandlePortChange = vi.fn();

const defaultProps: CloudPulsePortFilterProps = {
  dashboard: dashboardFactory.build(),
  handlePortChange: mockHandlePortChange,
  label: 'Port',
  savePreferences: false,
};

describe('CloudPulsePortFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', () => {
    renderWithTheme(<CloudPulsePortFilter {...defaultProps} />);

    expect(screen.getByLabelText('Port')).toBeVisible();
    expect(screen.getByText(PORTS_HELPER_TEXT)).toBeVisible();
    expect(screen.getByPlaceholderText('e.g., 80,443,3000')).toBeVisible();
  });

  it('should initialize with default value', () => {
    const propsWithDefault = {
      ...defaultProps,
      defaultValue: '80,443',
    };
    renderWithTheme(<CloudPulsePortFilter {...propsWithDefault} />);

    const input = screen.getByLabelText('Port');
    expect(input).toHaveValue('80,443');
  });

  it('should not show error for valid digits and commas', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CloudPulsePortFilter {...defaultProps} />);

    const input = screen.getByLabelText('Port');
    await user.type(input, '80,443');
    expect(input).toHaveValue('80,443');
    expect(screen.queryByText(PORTS_ERROR_MESSAGE)).not.toBeInTheDocument();
  });

  it('should show error for non-numeric characters', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CloudPulsePortFilter {...defaultProps} />);

    const input = screen.getByLabelText('Port');
    await user.type(input, 'a');
    expect(screen.getByText(PORTS_ERROR_MESSAGE)).toBeVisible();
  });

  it('should not call handlePortChange immediately while typing', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CloudPulsePortFilter {...defaultProps} />);

    const input = screen.getByLabelText('Port');
    await user.type(input, '8');
    expect(mockHandlePortChange).not.toHaveBeenCalled();
  });
});
