import { screen } from '@testing-library/react';
import React from 'react';

import { dashboardFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { GlobalGroupByRenderer } from './GlobalGroupByRenderer';

import type { GroupByOption } from './CloudPulseGroupByDrawer';

const handleChange = vi.fn();
const dashboard = dashboardFactory.build();

const mocks = vi.hoisted(() => ({
  useGlobalDimensions: vi.fn(),
}));

const mockGroupByOptions: GroupByOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

vi.mock('./utils', async () => {
  const actual = await vi.importActual('./utils');

  return {
    ...actual,
    useGlobalDimensions: mocks.useGlobalDimensions,
  };
});

describe('Global Group By Renderer Component', () => {
  it('should render group by icon in disabled mode on undefined dashboard', () => {
    mocks.useGlobalDimensions.mockReturnValue({
      isLoading: true,
      options: [],
      defaultValue: [],
    });
    renderWithTheme(
      <GlobalGroupByRenderer
        handleChange={handleChange}
        selectedDashboard={undefined}
      />
    );

    const groupByIcon = screen.getByTestId('group-by');
    expect(groupByIcon).toBeDisabled();
  });

  it('should render group by icon in disabled mode on data loading', () => {
    mocks.useGlobalDimensions.mockReturnValue({
      isLoading: true,
      options: [],
      defaultValue: [],
    });
    renderWithTheme(
      <GlobalGroupByRenderer
        handleChange={handleChange}
        selectedDashboard={dashboard}
      />
    );

    const groupByIcon = screen.getByTestId('group-by');
    expect(groupByIcon).toBeDisabled();
  });

  it('Should render group by icon as enabled and open drawer on click', async () => {
    mocks.useGlobalDimensions.mockReturnValue({
      isLoading: false,
      options: mockGroupByOptions,
      defaultValue: [],
    });
    renderWithTheme(
      <GlobalGroupByRenderer
        handleChange={handleChange}
        selectedDashboard={dashboard}
      />
    );

    const groupByIcon = screen.getByTestId('group-by');
    expect(groupByIcon).toBeEnabled();

    await groupByIcon.click();

    const drawer = screen.getByTestId('drawer');
    expect(drawer).toBeInTheDocument();

    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('Should not open drawer but group by icon should be enabled', async () => {
    mocks.useGlobalDimensions.mockReturnValue({
      isLoading: false,
      options: mockGroupByOptions,
      defaultValue: [],
    });
    renderWithTheme(
      <GlobalGroupByRenderer
        handleChange={handleChange}
        selectedDashboard={dashboard}
      />
    );

    const groupByIcon = screen.getByTestId('group-by');
    expect(groupByIcon).toBeEnabled();

    const drawer = screen.queryByTestId('drawer');
    expect(drawer).not.toBeInTheDocument();
  });

  it('Should open drawer on group by icon click and have default selected values', async () => {
    const defaultValue = [mockGroupByOptions[0]];

    mocks.useGlobalDimensions.mockReturnValue({
      isLoading: false,
      options: mockGroupByOptions,
      defaultValue,
    });
    renderWithTheme(
      <GlobalGroupByRenderer
        handleChange={handleChange}
        selectedDashboard={dashboard}
      />
    );

    const groupByIcon = screen.getByTestId('group-by');

    await groupByIcon.click();

    const drawer = screen.getByTestId('drawer');
    expect(drawer).toBeInTheDocument();

    expect(handleChange).toHaveBeenCalledWith([defaultValue[0].value]);

    defaultValue.forEach((value) => {
      const option = screen.getByRole('button', { name: value.label });
      expect(option).toBeInTheDocument();
    });
  });
});
