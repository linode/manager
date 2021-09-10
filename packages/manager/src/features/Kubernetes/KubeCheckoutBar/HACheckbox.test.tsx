import { fireEvent } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import HACheckbox, { Props } from './HACheckbox';

const props: Props = {
  haPrice: 1,
  checked: false,
  onChange: jest.fn(),
};

describe('HACheckbox', () => {
  it('the component should render', () => {
    const { getByTestId } = renderWithTheme(<HACheckbox {...props} />);

    expect(getByTestId('ha-checkbox')).toBeVisible();
  });

  it('should call the onChange function on click', () => {
    const { container } = renderWithTheme(<HACheckbox {...props} />);

    const checkbox = container.querySelector('input');

    if (!checkbox) {
      fail('Checkbox input not found');
    }

    fireEvent.click(checkbox);

    expect(props.onChange).toHaveBeenCalled();
  });
});
