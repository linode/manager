import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DebouncedSearchTextField } from './DebouncedSearchTextField';

const labelVal = 'Search textfield label';
const textfieldId = 'textfield-input';
const props = {
  isSearching: false,
  label: labelVal,
  onSearch: vi.fn(),
  value: '',
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

  it('calls isSearching', async () => {
    const screen = renderWithTheme(
      <DebouncedSearchTextField {...props} debounceTime={250} />
    );

    const textfield = screen.getByTestId(textfieldId);
    await userEvent.type(textfield, 'test');

    await waitFor(() => expect(props.onSearch).toHaveBeenCalled());
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
