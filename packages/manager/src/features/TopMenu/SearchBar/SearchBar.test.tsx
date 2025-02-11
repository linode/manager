import { createFinalOptions } from './utils';

import type { SearchResultItem } from './SearchBar';

const createMockItems = (numberOfItemsToCreate: number) => {
  const mockItems = [];
  for (let i = 0; i < numberOfItemsToCreate; i++) {
    mockItems.push({
      data: {
        searchText: `test-search-text-${i}`,
      },
      label: `test-label-${i}`,
      value: `test-value-${i}`,
    } as SearchResultItem);
  }
  return mockItems;
};

describe('createFinalOptions', () => {
  it('returns an empty array when there are no results', () => {
    expect(createFinalOptions([])).toEqual([]);
  });

  it('inserts a default option at the beginning if there is 1 or more result', () => {
    let mockItems = createMockItems(1);
    expect(createFinalOptions(mockItems, '')[0].value).toBe('redirect');

    mockItems = createMockItems(100);
    expect(createFinalOptions(mockItems, '')[0].value).toBe('redirect');
  });

  it('should include a default option with a message based on searchText', () => {
    const mockItems = createMockItems(3);
    expect(createFinalOptions(mockItems, 'my-search')[0].label).toBe(
      'View search results page for "my-search"'
    );
    expect(createFinalOptions(mockItems, '')[0].label).toBe(
      'View search results page for ""'
    );
    expect(createFinalOptions(mockItems, '  ')[0].label).toBe(
      'View search results page for "  "'
    );
  });

  it('appends a default option at the end only if there are more than 20 results', () => {
    let mockItems = createMockItems(20);
    let finalOptions = createFinalOptions(mockItems, '');
    let lastOption = finalOptions[finalOptions.length - 1];
    expect(lastOption.value).not.toBe('redirect');

    mockItems = createMockItems(21);
    finalOptions = createFinalOptions(mockItems, '');
    lastOption = finalOptions[finalOptions.length - 1];
    expect(lastOption.value).toBe('redirect');
    const secondToLastOption = finalOptions[finalOptions.length - 2];
    expect(secondToLastOption.value).toBe('test-value-19');

    mockItems = createMockItems(40);
    finalOptions = createFinalOptions(mockItems, '');
    lastOption = finalOptions[finalOptions.length - 1];
    expect(lastOption.value).toBe('redirect');
  });

  it('should include results length and searchText in the final default message', () => {
    let mockItems = createMockItems(22);
    let finalOptions = createFinalOptions(mockItems, 'my-search');
    let lastOption = finalOptions[finalOptions.length - 1];
    expect(lastOption.label).toBe('View all 22 results for "my-search"');

    mockItems = createMockItems(50);
    finalOptions = createFinalOptions(mockItems, ' ');
    lastOption = finalOptions[finalOptions.length - 1];
    expect(lastOption.label).toBe('View all 50 results for " "');
  });

  it('includes a maximum of 20 results (plus the default options)', () => {
    let mockItems = createMockItems(25);
    let finalOptions = createFinalOptions(mockItems, '');
    // Length should be 22 (20 results + 2 default options)
    expect(finalOptions.length).toBe(22);

    mockItems = createMockItems(100);
    finalOptions = createFinalOptions(mockItems, '');
    // Length should be 22 (20 results + 2 default options)
    expect(finalOptions.length).toBe(22);

    mockItems = createMockItems(15);
    finalOptions = createFinalOptions(mockItems, '');
    // Length should be 16 (15 results + 1 default option)
    expect(finalOptions.length).toBe(16);
  });

  it('returns an empty array if input is bad', () => {
    expect(createFinalOptions(undefined!, '')).toEqual([]);
  });
});
