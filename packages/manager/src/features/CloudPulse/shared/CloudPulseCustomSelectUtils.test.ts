import {
  getInitialDefaultSelections,
  handleCustomSelectionChange,
} from './CloudPulseCustomSelectUtils';

import type { CloudPulseServiceTypeFiltersOptions } from '../Utils/models';

it('test handleCustomSelectionChange method for single selection', () => {
  const selectedValue: CloudPulseServiceTypeFiltersOptions = {
    id: '1',
    label: 'Test',
  };
  const handleSelectionChange = vi.fn();
  const result = handleCustomSelectionChange({
    clearSelections: [],
    filterKey: 'test',
    handleSelectionChange,
    value: selectedValue,
  });

  expect(result).toBeDefined();
  expect(result).toEqual(selectedValue);
  expect(handleSelectionChange).toBeCalledTimes(1);
});

it('test handleCustomSelectionChange method for multiple selection', () => {
  const selectedValue: CloudPulseServiceTypeFiltersOptions[] = [
    {
      id: '1',
      label: 'Test',
    },
  ];
  const handleSelectionChange = vi.fn();
  const result = handleCustomSelectionChange({
    clearSelections: [],
    filterKey: 'test',
    handleSelectionChange,
    value: selectedValue,
  });

  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);
  expect(result).toEqual(selectedValue);
  expect(handleSelectionChange).toBeCalledTimes(1);
});

it('test getInitialDefaultSelections method for single selection', () => {
  const handleSelectionChange = vi.fn();

  const options: CloudPulseServiceTypeFiltersOptions[] = [
    {
      id: '1',
      label: 'Test',
    },
  ];

  let result = getInitialDefaultSelections({
    defaultValue: '1',
    filterKey: 'test',
    handleSelectionChange,
    isMultiSelect: false,
    options,
    savePreferences: true,
  });

  expect(Array.isArray(result)).toBe(false);
  expect(result).toEqual(options[0]);
  expect(handleSelectionChange).toBeCalledTimes(1);

  result = getInitialDefaultSelections({
    filterKey: 'test',
    handleSelectionChange,
    isMultiSelect: false,
    options,
    preferences: {
      test: '2',
    },
    savePreferences: true,
  });
  expect(result).toEqual(undefined);
  expect(handleSelectionChange).toBeCalledTimes(2);
});

it('test getInitialDefaultSelections method for multi selection', () => {
  const handleSelectionChange = vi.fn();

  const options: CloudPulseServiceTypeFiltersOptions[] = [
    {
      id: '1',
      label: 'Test',
    },
  ];

  let result = getInitialDefaultSelections({
    defaultValue: ['1'],
    filterKey: 'test',
    handleSelectionChange,
    isMultiSelect: true,
    options,
    savePreferences: true,
  });

  expect(Array.isArray(result)).toBe(true);
  expect(result).toEqual(options);
  expect(handleSelectionChange).toBeCalledTimes(1);

  result = getInitialDefaultSelections({
    filterKey: 'test',
    handleSelectionChange,
    isMultiSelect: false,
    options,
    preferences: {
      test: '2',
    },
    savePreferences: true,
  });
  expect(result).toEqual(undefined);
  expect(handleSelectionChange).toBeCalledTimes(2);
});
