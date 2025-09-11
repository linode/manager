import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { WidgetFilterGroupByRenderer } from './WidgetFilterGroupByRenderer';

import type { GroupByOption } from './CloudPulseGroupByDrawer';
import type { CloudPulseServiceType } from '@linode/api-v4';

const mocks = vi.hoisted(() => ({
  useGlobalDimensions: vi.fn(),
  useWidgetDimension: vi.fn(),
}));

vi.mock('./useGroupByDimension', () => {
  return {
    ...mocks,
  };
});
const handleChange = vi.fn();
const props = {
  dashboardId: 1,
  serviceType: 'linode' as CloudPulseServiceType,
  label: 'Label 1',
  metric: 'metric-1',
  handleChange,
};

const globalDimension = {
  isLoading: false,
  options: [],
  defaultValue: [],
};

const widgetGroupBy: GroupByOption[] = [
  { value: 'value-1', label: 'Value 1' },
  { value: 'value-2', label: 'Value 2' },
  { value: 'value-3', label: 'Value 3' },
];

const component = <WidgetFilterGroupByRenderer {...props} />;

describe('Widget Group By Renderer', () => {
  beforeAll(() => {
    mocks.useGlobalDimensions.mockRejectedValue(globalDimension);
  });
  it('Should render group by icon in disabled mode', async () => {
    mocks.useWidgetDimension.mockReturnValue({
      isLoading: true,
      options: [],
      defaultValue: [],
    });
    renderWithTheme(component);

    const groupByIcon = screen.getByTestId('group-by');
    expect(groupByIcon).toBeInTheDocument();
    expect(groupByIcon).toBeDisabled();

    await groupByIcon.click();

    const drawer = screen.queryByTestId('drawer');
    expect(drawer).not.toBeInTheDocument();
  });

  it('Should open drawer on click of group by icon', async () => {
    mocks.useWidgetDimension.mockReturnValue({
      isLoading: false,
      options: widgetGroupBy,
      defaultValue: [],
    });

    renderWithTheme(component);

    const groupByIcon = screen.getByTestId('group-by');

    await groupByIcon.click();

    const drawer = screen.getByTestId('drawer');
    expect(drawer).toBeInTheDocument();

    const labelText = screen.getByText('Label 1');
    expect(labelText).toBeInTheDocument();

    const title = screen.getByText('Group By');
    expect(title).toBeInTheDocument();

    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('Should not open drawer but group by icon should be enabled', async () => {
    mocks.useWidgetDimension.mockReturnValue({
      isLoading: false,
      options: widgetGroupBy,
      defaultValue: [],
    });
    renderWithTheme(component);

    const groupByIcon = screen.getByTestId('group-by');
    expect(groupByIcon).toBeEnabled();

    const drawer = screen.queryByTestId('drawer');
    expect(drawer).not.toBeInTheDocument();
  });

  it('Should open drawer on group by icon click and have default selected values', async () => {
    const defaultValue = [widgetGroupBy[0]];

    mocks.useWidgetDimension.mockReturnValue({
      isLoading: false,
      options: widgetGroupBy,
      defaultValue,
    });
    renderWithTheme(component);

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
