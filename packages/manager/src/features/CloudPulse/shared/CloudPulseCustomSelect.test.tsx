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

const testFilter = 'Select a Test Filter';
const keyboardArrowDownIcon = 'KeyboardArrowDownIcon';

describe('CloudPulseCustomSelect component tests', () => {
  it('should render a component successfully with required props static', () => {
    const screen = renderWithTheme(
      <CloudPulseCustomSelect
        filterKey="testfilter"
        filterType="number"
        handleSelectionChange={vi.fn()}
        label="Test"
        options={mockOptions}
        placeholder={testFilter}
        type={CloudPulseSelectTypes.static}
      />
    );
    expect(screen.queryByPlaceholderText(testFilter)).toBeNull();
    expect(screen.getByLabelText('Test')).toBeInTheDocument();
    const keyDown = screen.getByTestId(keyboardArrowDownIcon);
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
        label="CustomTest"
        options={[...mockOptions]}
        placeholder={testFilter}
        type={CloudPulseSelectTypes.static}
      />
    );
    expect(screen.queryByPlaceholderText(testFilter)).toBeNull();
    expect(screen.getByLabelText('CustomTest')).toBeInTheDocument();
    const keyDown = screen.getByTestId(keyboardArrowDownIcon);
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
        label="Test"
        placeholder={testFilter}
        type={CloudPulseSelectTypes.dynamic}
      />
    );
    expect(screen.queryByPlaceholderText(testFilter)).toBeNull();
    expect(screen.getByLabelText('Test')).toBeInTheDocument();
    const keyDown = screen.getByTestId(keyboardArrowDownIcon);
    fireEvent.click(keyDown);
    fireEvent.click(screen.getByText('Test1'));
    const textField = screen.getByTestId('textfield-input');
    expect(textField.getAttribute('value')).toEqual('Test1');
    expect(selectionChnage).toHaveBeenCalledTimes(1);

    // if we click on clear icon , placeholder should appear for single select
    fireEvent.click(screen.getByTitle('Clear'));
    expect(screen.getByPlaceholderText(testFilter)).toBeDefined();
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
        label="Test"
        placeholder={testFilter}
        type={CloudPulseSelectTypes.dynamic}
      />
    );
    expect(screen.queryByPlaceholderText(testFilter)).toBeNull();
    expect(screen.getByLabelText('Test')).toBeInTheDocument();
    const keyDown = screen.getByTestId(keyboardArrowDownIcon);
    fireEvent.click(keyDown);
    expect(screen.getAllByText('Test1').length).toEqual(2); // here it should be 2
    expect(screen.getAllByText('Test2').length).toEqual(1); // since we didn't select this option it should be 1
    fireEvent.click(screen.getByText('Test2'));

    expect(screen.getAllByText('Test1').length).toEqual(2); // here it should be 2
    expect(screen.getAllByText('Test2').length).toEqual(2); // since we did select this option it should be 2

    fireEvent.click(keyDown); // close the drop down

    expect(screen.getAllByText('Test1').length).toEqual(1);
    expect(screen.getAllByText('Test2').length).toEqual(1);
    expect(selectionChnage).toHaveBeenCalledTimes(2); // check if selection change is called twice as we selected two options

    // if we click on clear icon , placeholder should appear
    fireEvent.click(screen.getByTitle('Clear'));
    expect(screen.getByPlaceholderText(testFilter)).toBeDefined();
  });
});
