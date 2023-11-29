import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { wrapWithTheme } from 'src/utilities/testHelpers';

const setValue = vi.fn();

const props = {
  setValue,
  value: 1,
};

const disabledProps = {
  ...props,
  disabled: true,
};

beforeEach(vi.clearAllMocks);

describe('EnhancedNumberInput', () => {
  it("should increment the input's value by 1 when the plus button is clicked", () => {
    const { getByTestId } = render(
      wrapWithTheme(<EnhancedNumberInput {...props} />)
    );

    const addButton = getByTestId('increment-button');

    fireEvent.click(addButton);
    expect(setValue).toHaveBeenCalledWith(2);
  });

  it("should decrement the input's value by 1 when the minus button is clicked", () => {
    const { getByTestId } = render(
      wrapWithTheme(<EnhancedNumberInput {...props} />)
    );

    const subtractButton = getByTestId('decrement-button');

    fireEvent.click(subtractButton);
    expect(setValue).toHaveBeenCalledWith(0);
  });

  it('should update the input if the user manually adds numeric text', () => {
    const { getByTestId } = render(
      wrapWithTheme(<EnhancedNumberInput {...props} />)
    );

    const input = getByTestId('textfield-input');
    fireEvent.change(input, { target: { value: '100' } });
    expect(setValue).toHaveBeenCalledWith(100);
  });

  it('should set the value to 0 if the user inputs invalid data', () => {
    const { getByTestId } = render(
      wrapWithTheme(<EnhancedNumberInput {...props} />)
    );

    const input = getByTestId('textfield-input');
    fireEvent.change(input, { target: { value: 'prestidigitation' } });
    expect(setValue).toHaveBeenCalledWith(0);
  });

  it('should respect min values', () => {
    const { getByTestId } = render(
      wrapWithTheme(<EnhancedNumberInput {...props} min={1} value={0} />)
    );

    const input = getByTestId('textfield-input') as HTMLInputElement;
    expect(input.value).toBe('1');
    expect(getByTestId('decrement-button')).toHaveAttribute('disabled');
  });

  it('should respect max values', () => {
    const { getByTestId } = render(
      wrapWithTheme(<EnhancedNumberInput {...props} max={5} value={6} />)
    );

    const input = getByTestId('textfield-input') as HTMLInputElement;
    expect(input.value).toBe('5');
    expect(getByTestId('increment-button')).toHaveAttribute('disabled');
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
