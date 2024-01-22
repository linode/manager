import userEvent from '@testing-library/user-event';
import { debounce } from 'lodash';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DebouncedSearchTextField } from './DebouncedSearchTextField';

vi.useFakeTimers();

const labelVal = 'Search textfield label';
const textfieldId = 'textfield-input';
const props = {
  isSearching: false,
  label: labelVal,
  onSearch: vi.fn(),
};

describe('Debounced Search Text Field', () => {
  it('renders the search field', () => {
    const screen = renderWithTheme(<DebouncedSearchTextField {...props} />);

    const label = screen.getByText(labelVal);
    const textfield = screen.getByTestId(textfieldId);
    const searchIcon = screen.getByTestId('SearchIcon');

    expect(label).toBeVisible();
    expect(textfield).toBeVisible();
    expect(textfield).toEqual(
      screen.container.querySelector('[placeholder="Filter by query"]')
    );
    expect(searchIcon).toBeVisible();

    // circle icon is not visible
    const circleIcon = screen.queryByTestId('circle-progress');
    expect(circleIcon).not.toBeInTheDocument();
  });

  it('renders a loading icon if isSearching is true', () => {
    const screen = renderWithTheme(
      <DebouncedSearchTextField {...props} isSearching={true} />
    );

    const circleIcon = screen.queryByTestId('circle-progress');
    expect(circleIcon).toBeInTheDocument();
  });

  it('calls isSearching', () => {
    const debouncedOnSearch = debounce(props.onSearch, 250);
    const screen = renderWithTheme(
      <DebouncedSearchTextField
        {...props}
        debounceTime={250}
        onSearch={debouncedOnSearch}
      />
    );

    const textfield = screen.getByTestId(textfieldId);
    userEvent.type(textfield, 'test');
    vi.runAllTimers();
    expect(props.onSearch).toHaveBeenCalled();
  });

  it('renders the expected placeholder', () => {
    const screen = renderWithTheme(
      <DebouncedSearchTextField
        {...props}
        placeholder="this is a placeholder"
      />
    );

    const placeholderTextfield = screen.container.querySelector(
      '[placeholder="this is a placeholder"]'
    );
    expect(placeholderTextfield).toEqual(screen.getByTestId(textfieldId));
  });

  it('hides the label', () => {
    const { getByTestId } = renderWithTheme(
      <DebouncedSearchTextField {...props} hideLabel={true} />
    );

    const label = getByTestId('inputLabelWrapper');
    expect(label).toBeInTheDocument();
    expect(label?.className).toContain('visually-hidden');
  });
});
