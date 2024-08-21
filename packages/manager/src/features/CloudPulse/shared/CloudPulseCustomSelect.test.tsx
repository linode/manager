import { fireEvent } from '@testing-library/react';
import React from 'react';

import { databaseQueries } from 'src/queries/databases/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseSelectTypes } from '../Utils/models';
import { CloudPulseCustomSelect } from './CloudPulseCustomSelect';

import type { CloudPulseServiceTypeFiltersOptions } from '../Utils/models';

const mockOptions: CloudPulseServiceTypeFiltersOptions[] = [
  {
    id: '1',
    label: 'Test1',
  },
  {
    id: '2',
    label: 'Test2',
  },
];

const queryMocks = vi.hoisted(() => ({
  useGetCustomFiltersQuery: vi.fn().mockReturnValue({
    data: [
      {
        id: '1',
        label: 'Test1',
      },
      {
        id: '2',
        label: 'Test2',
      },
    ],
    isError: false,
    isLoading: false,
    status: 'success',
  }),
}));

vi.mock('src/queries/cloudpulse/customfilters', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/customfilters');
  return {
    ...actual,
    useGetCustomFiltersQuery: queryMocks.useGetCustomFiltersQuery,
  };
});

const testfilter = 'Select a Test Filter';

describe('CloudPulseCustomSelect component tests', () => {
  it('should render a component successfully with required props static', () => {
    const screen = renderWithTheme(
      <CloudPulseCustomSelect
        filterKey="testfilter"
        filterType="number"
        handleSelectionChange={vi.fn()}
        options={mockOptions}
        placeholder={testfilter}
        type={CloudPulseSelectTypes.static}
      />
    );

    expect(screen.getByPlaceholderText('Select a Test Filter')).toBeDefined();
    const keyDown = screen.getByTestId('KeyboardArrowDownIcon');
    fireEvent.click(keyDown);
    fireEvent.click(screen.getByText('Test1'));
    const textField = screen.getByTestId('textfield-input');
    expect(textField.getAttribute('value')).toEqual('Test1');
  });

  it('should render a component successfully with required props static with multi select', () => {
    const screen = renderWithTheme(
      <CloudPulseCustomSelect
        filterKey="testfilter"
        filterType="number"
        handleSelectionChange={vi.fn()}
        isMultiSelect={true}
        options={[...mockOptions]}
        placeholder={testfilter}
        type={CloudPulseSelectTypes.static}
      />
    );

    expect(screen.getByPlaceholderText(testfilter)).toBeDefined();
    const keyDown = screen.getByTestId('KeyboardArrowDownIcon');
    fireEvent.click(keyDown);
    expect(screen.getAllByText('Test1').length).toEqual(2); // here it should be 2
    expect(screen.getAllByText('Test2').length).toEqual(1); // since we didn't select this option it should be 1
    fireEvent.click(screen.getByText('Test2'));

    expect(screen.getAllByText('Test1').length).toEqual(2); // here it should be 2
    expect(screen.getAllByText('Test2').length).toEqual(2); // since we did select this option it should be 2

    fireEvent.click(keyDown); // close the drop down

    expect(screen.getAllByText('Test1').length).toEqual(1);
    expect(screen.getAllByText('Test2').length).toEqual(1);
  });

  it('should render a component successfully with required props dynamic', () => {
    const selectionChnage = vi.fn();
    const screen = renderWithTheme(
      <CloudPulseCustomSelect
        apiV4QueryKey={databaseQueries.engines}
        filterKey="testfilter"
        filterType="number"
        handleSelectionChange={selectionChnage}
        placeholder={testfilter}
        type={CloudPulseSelectTypes.dynamic}
      />
    );
    expect(screen.getByPlaceholderText(testfilter)).toBeDefined();
    const keyDown = screen.getByTestId('KeyboardArrowDownIcon');
    fireEvent.click(keyDown);
    fireEvent.click(screen.getByText('Test1'));
    const textField = screen.getByTestId('textfield-input');
    expect(textField.getAttribute('value')).toEqual('Test1');
    expect(selectionChnage).toHaveBeenCalledTimes(1);
  });

  it('should render a component successfully with required props dynamic multi select', () => {
    const selectionChnage = vi.fn();
    const screen = renderWithTheme(
      <CloudPulseCustomSelect
        apiV4QueryKey={databaseQueries.engines}
        filterKey="testfilter"
        filterType="number"
        handleSelectionChange={selectionChnage}
        isMultiSelect={true}
        placeholder={testfilter}
        type={CloudPulseSelectTypes.dynamic}
      />
    );
    expect(screen.getByPlaceholderText(testfilter)).toBeDefined();
    const keyDown = screen.getByTestId('KeyboardArrowDownIcon');
    fireEvent.click(keyDown);
    fireEvent.click(screen.getByText('Test1'));
    expect(screen.getAllByText('Test1').length).toEqual(2); // here it should be 2
    expect(screen.getAllByText('Test2').length).toEqual(1); // since we didn't select this option it should be 1
    fireEvent.click(screen.getByText('Test2'));

    expect(screen.getAllByText('Test1').length).toEqual(2); // here it should be 2
    expect(screen.getAllByText('Test2').length).toEqual(2); // since we did select this option it should be 2

    fireEvent.click(keyDown); // close the drop down

    expect(screen.getAllByText('Test1').length).toEqual(1);
    expect(screen.getAllByText('Test2').length).toEqual(1);
    expect(selectionChnage).toHaveBeenCalledTimes(2); // check if selection change is called twice as we selected two options
  });
});
