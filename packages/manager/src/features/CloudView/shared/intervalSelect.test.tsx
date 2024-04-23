import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  CloudViewIntervalSelect,
  CloudViewIntervalSelectProps,
} from './IntervalSelect';

const handleIntervalChange = vi.fn();
describe('IntervalSelect', () => {
  const props: CloudViewIntervalSelectProps = {
    handleIntervalChange,
  };

  it('should render a Select component with the correct label', () => {
    const { getByTestId } = renderWithTheme(
      <CloudViewIntervalSelect {...props} />
    );
    expect(getByTestId('cloudview-interval-select')).toBeInTheDocument();

    const inputElement = screen.getByRole('combobox');
    fireEvent.focus(inputElement);
    fireEvent.change(inputElement, { target: { value: '5 min' } });

    const optionElement = screen.getByText('5 min');
    fireEvent.click(optionElement);

    fireEvent.focus(inputElement);
    fireEvent.change(inputElement, { target: { value: '2 hrs' } });

    const optionElement2 = screen.getByText('2 hrs');
    fireEvent.click(optionElement2);

    const selectOption2 = handleIntervalChange.mock.calls;
    expect(selectOption2).toEqual([['1minute'], ['5minute'], ['2hour']]);
  });
});
