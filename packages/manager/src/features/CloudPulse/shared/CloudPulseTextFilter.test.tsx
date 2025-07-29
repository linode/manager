import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  INTERFACE_IDS_ERROR_MESSAGE,
  INTERFACE_IDS_HELPER_TEXT,
  INTERFACE_IDS_PLACEHOLDER_TEXT,
  PORTS_ERROR_MESSAGE,
  PORTS_HELPER_TEXT,
  PORTS_PLACEHOLDER_TEXT,
} from '../Utils/constants';
import { CloudPulseTextFilter } from './CloudPulseTextFilter';

import type { CloudPulseTextFilterProps } from './CloudPulseTextFilter';

const filterLabelPort = 'Port (optional)';
const filterLabelInterfaceId = 'Interface IDs (optional)';

const mockHandleTextFilterChange = vi.fn();

const defaultPropsPort: CloudPulseTextFilterProps = {
  handleTextFilterChange: mockHandleTextFilterChange,
  label: 'Port',
  savePreferences: false,
  filterKey: 'port',
  placeholder: PORTS_PLACEHOLDER_TEXT,
  optional: true,
};

const defaultPropsInterfaceId: CloudPulseTextFilterProps = {
  handleTextFilterChange: mockHandleTextFilterChange,
  label: 'Interface IDs',
  savePreferences: false,
  filterKey: 'interface_id',
  placeholder: INTERFACE_IDS_PLACEHOLDER_TEXT,
  optional: true,
};

describe('CloudPulseTextFilter for port', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', () => {
    renderWithTheme(<CloudPulseTextFilter {...defaultPropsPort} />);

    expect(screen.getByLabelText(filterLabelPort)).toBeVisible();
    expect(screen.getByText(PORTS_HELPER_TEXT)).toBeVisible();
    expect(screen.getByPlaceholderText('e.g., 80,443,3000')).toBeVisible();
  });

  it('should initialize with default value', () => {
    const propsWithDefault = {
      ...defaultPropsPort,
      defaultValue: '80,443',
    };
    renderWithTheme(<CloudPulseTextFilter {...propsWithDefault} />);

    const input = screen.getByLabelText('Port (optional)');
    expect(input).toHaveValue('80,443');
  });

  it('should not show error for valid digits and commas', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CloudPulseTextFilter {...defaultPropsPort} />);

    const input = screen.getByLabelText(filterLabelPort);
    await user.type(input, '80,443');
    expect(input).toHaveValue('80,443');
    expect(screen.queryByText(PORTS_ERROR_MESSAGE)).not.toBeInTheDocument();
  });

  it('should show error for non-numeric characters', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CloudPulseTextFilter {...defaultPropsPort} />);

    const input = screen.getByLabelText(filterLabelPort);
    await user.type(input, 'a');
    expect(screen.getByText(PORTS_ERROR_MESSAGE)).toBeVisible();
  });

  it('should not call handleTextFilterChange immediately while typing', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CloudPulseTextFilter {...defaultPropsPort} />);

    const input = screen.getByLabelText(filterLabelPort);
    await user.type(input, '8');
    expect(mockHandleTextFilterChange).not.toHaveBeenCalled();
  });

  it('should call handleTextFilterChange when input is blurred', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CloudPulseTextFilter {...defaultPropsPort} />);

    const input = screen.getByLabelText(filterLabelPort);
    await user.type(input, '8');
    await user.tab();
    expect(mockHandleTextFilterChange).toHaveBeenCalled();
  });
});

describe('CloudPulseTextFilter for interface_id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', () => {
    renderWithTheme(<CloudPulseTextFilter {...defaultPropsInterfaceId} />);

    expect(screen.getByLabelText(filterLabelInterfaceId)).toBeVisible();
    expect(screen.getByText(INTERFACE_IDS_HELPER_TEXT)).toBeVisible();
    expect(
      screen.getByPlaceholderText(INTERFACE_IDS_PLACEHOLDER_TEXT)
    ).toBeVisible();
  });

  it('should initialize with default value', () => {
    const propsWithDefaultValue = {
      ...defaultPropsInterfaceId,
      defaultValue: '0,2',
    };
    renderWithTheme(<CloudPulseTextFilter {...propsWithDefaultValue} />);

    const input = screen.getByLabelText('Interface IDs (optional)');
    expect(input).toHaveValue('0,2');
  });

  it('should not show error for valid digits and commas', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CloudPulseTextFilter {...defaultPropsInterfaceId} />);

    const input = screen.getByLabelText(filterLabelInterfaceId);
    await user.type(input, '0,2');
    expect(input).toHaveValue('0,2');
    expect(
      screen.queryByText(INTERFACE_IDS_ERROR_MESSAGE)
    ).not.toBeInTheDocument();
  });

  it('should show error for non-numeric characters', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CloudPulseTextFilter {...defaultPropsInterfaceId} />);

    const input = screen.getByLabelText(filterLabelInterfaceId);
    await user.type(input, 'a');
    expect(screen.getByText(INTERFACE_IDS_ERROR_MESSAGE)).toBeVisible();
  });

  it('should call handleTextFilterChange when input is blurred', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CloudPulseTextFilter {...defaultPropsInterfaceId} />);

    const input = screen.getByLabelText(filterLabelInterfaceId);
    await user.type(input, '8');
    await user.tab();
    expect(mockHandleTextFilterChange).toHaveBeenCalled();
  });
});
