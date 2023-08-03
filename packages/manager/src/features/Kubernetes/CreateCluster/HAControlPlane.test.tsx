// import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { HIGH_AVAILABILITY_PRICE } from 'src/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { HAControlPlane, Props } from './HAControlPlane';

const props: Props = {
  highAvailability: false,
  setHAControlPlaneSelection: jest.fn(),
  setHighAvailability: jest.fn(),
};

const shouldRender = HIGH_AVAILABILITY_PRICE !== undefined;

describe('HAControlPlane', () => {
  it('the component should render', () => {
    const { container, getByTestId } = renderWithTheme(
      <HAControlPlane {...props} />
    );

    if (shouldRender) {
      expect(getByTestId('ha-control-plane')).toBeVisible();
    } else {
      expect(container).toBeEmptyDOMElement();
    }
  });

  // it('should call the handleChange function on change', () => {
  //   const { getByTestId } = renderWithTheme(
  //     <HAControlPlane {...props} />
  //   );

  //   const haRadioButton = getByTestId('ha-radio-button-yes');

  //   if (!haRadioButton && shouldRender) {
  //     fail('Radio Buttons not found');
  //   }

  //   if (haRadioButton && !shouldRender) {
  //     fail(
  //       'High Availability control plane was rendered, but no price was provided.'
  //     );
  //   }

  //   if (haRadioButton) {
  //     fireEvent.change(haRadioButton);

  //     expect(props.setHighAvailability).toHaveBeenCalled();
  //   }
  // });
});
