import { fireEvent } from '@testing-library/react';
import * as React from 'react';
import { HIGH_AVAILABILITY_PRICE } from 'src/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';
import HACheckbox, { Props } from './HACheckbox';

const props: Props = {
  checked: false,
  onChange: jest.fn(),
};

const shouldRender = HIGH_AVAILABILITY_PRICE !== undefined;

describe('HACheckbox', () => {
  it('the component should render', () => {
    const { getByTestId, container } = renderWithTheme(
      <HACheckbox {...props} />
    );

    if (shouldRender) {
      expect(getByTestId('ha-checkbox')).toBeVisible();
    } else {
      expect(container).toBeEmptyDOMElement();
    }
  });

  it('should call the onChange function on click', () => {
    const { container } = renderWithTheme(<HACheckbox {...props} />);

    const checkbox = container.querySelector('input');

    if (!checkbox && shouldRender) {
      fail('Checkbox input not found');
    }

    if (checkbox && !shouldRender) {
      fail(
        'High Availability Checkbox was rendered, but no price was provided.'
      );
    }

    if (checkbox) {
      fireEvent.click(checkbox);

      expect(props.onChange).toHaveBeenCalled();
    }
  });
});
