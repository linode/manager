import { cleanup, fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import EnhancedNumberInput from './EnhancedNumberInput';

const setValue = jest.fn();

const props = {
  value: 1,
  setValue
};

const disabledProps = {
  ...props,
  disabled: true
};

afterEach(cleanup);

describe('EnhancedNumberInput', () => {
  it("should increment the input's value by 1 when the plus button is clicked", () => {
    const { getByTestId } = render(
      wrapWithTheme(<EnhancedNumberInput {...props} />)
    );

    const addButton = getByTestId('increment-button');

    fireEvent.click(addButton);
    expect(setValue).toHaveBeenCalled();
    // expect(getByTestId('textfield-input')).toHaveValue(2);
  });

  it("should decrement the input's value by 1 when the minus button is clicked", () => {
    const { getByTestId } = render(
      wrapWithTheme(<EnhancedNumberInput {...props} />)
    );

    const subtractButton = getByTestId('decrement-button');

    fireEvent.click(subtractButton);
    expect(setValue).toHaveBeenCalled();
    // expect(getByTestId('textfield-input')).toHaveValue(0);
  });

  it('should display buttons and input as disabled when given the corresponding prop', () => {
    const { getByTestId } = render(
      wrapWithTheme(<EnhancedNumberInput {...disabledProps} />)
    );
    expect(getByTestId('textfield-input')).toHaveAttribute('disabled');
    expect(getByTestId('decrement-button')).toHaveAttribute('disabled');
    expect(getByTestId('increment-button')).toHaveAttribute('disabled');
  });
});
