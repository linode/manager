import {
  handleCustomSelectionChange,
  getInitialDefaultSelections,
} from './CloudPulseCustomSelectUtils';

import type { CloudPulseServiceTypeFiltersOptions } from '../Utils/models';

const queryMocks = vi.hoisted(() => ({
  getUserPreferenceObject: vi.fn().mockReturnValue({
    test: '1',
  }),
}));

vi.mock('../Utils/UserPreference', async () => {
  const actual = await vi.importActual('../Utils/UserPreference');
  return {
    ...actual,
    getUserPreferenceObject: queryMocks.getUserPreferenceObject,
  };
});

it('test callSelectionChangeAndUpdateGlobalFilters method for single selection', () => {
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

it('test callSelectionChangeAndUpdateGlobalFilters method for multiple selection', () => {
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

it('test getDefaultSelectionsFromPreferencesAndPublishSelectionChanges method for single selection', () => {
  const handleSelectionChange = vi.fn();

  const options: CloudPulseServiceTypeFiltersOptions[] = [
    {
      id: '1',
      label: 'Test',
    },
  ];

  let result = getInitialDefaultSelections({
    filterKey: 'test',
    handleSelectionChange,
    isMultiSelect: false,
    options,
    savePreferences: true,
  });

  expect(Array.isArray(result)).toBe(false);
  expect(result).toEqual(options[0]);
  expect(handleSelectionChange).toBeCalledTimes(1);
  queryMocks.getUserPreferenceObject.mockReturnValue({
    test: '2',
  });

  result = getInitialDefaultSelections({
    filterKey: 'test',
    handleSelectionChange,
    isMultiSelect: false,
    options,
    savePreferences: true,
  });
  expect(result).toEqual(undefined);
  expect(handleSelectionChange).toBeCalledTimes(2);
});

it('test getDefaultSelectionsFromPreferencesAndPublishSelectionChanges method for multi selection', () => {
  const handleSelectionChange = vi.fn();

  queryMocks.getUserPreferenceObject.mockReturnValue({
    test: '1',
  });

  const options: CloudPulseServiceTypeFiltersOptions[] = [
    {
      id: '1',
      label: 'Test',
    },
  ];

  let result = getInitialDefaultSelections({
    filterKey: 'test',
    handleSelectionChange,
    isMultiSelect: true,
    options,
    savePreferences: true,
  });

  expect(Array.isArray(result)).toBe(true);
  expect(result).toEqual(options);
  expect(handleSelectionChange).toBeCalledTimes(1);
  queryMocks.getUserPreferenceObject.mockReturnValue({
    test: '2',
  });

  result = getInitialDefaultSelections({
    filterKey: 'test',
    handleSelectionChange,
    isMultiSelect: false,
    options,
    savePreferences: true,
  });
  expect(result).toEqual(undefined);
  expect(handleSelectionChange).toBeCalledTimes(2);
});
