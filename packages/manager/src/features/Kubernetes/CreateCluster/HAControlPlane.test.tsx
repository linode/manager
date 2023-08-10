import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { HAControlPlane, Props } from './HAControlPlane';

/*
  This mock might not be required anymore since we are passing the value of
  HIGH_AVAILABILITY_PRICE as a prop.
*/
// jest.mock('src/constants', () => ({
//   __esModule: true,
//   ...(jest.requireActual('src/constants') as any),
//   HIGH_AVAILABILITY_PRICE: 60,
// }));

const props: Props = {
  HIGH_AVAILABILITY_PRICE: 60,
  highAvailability: undefined,
  setHighAvailability: jest.fn(),
};

describe('HAControlPlane', () => {
  it('the component should render', () => {
    const { getByTestId } = renderWithTheme(<HAControlPlane {...props} />);

    expect(getByTestId('ha-control-plane-form')).toBeVisible();
  });

  it('should call the handleChange function on change', () => {
    const { getByTestId } = renderWithTheme(<HAControlPlane {...props} />);
    const haRadioButton = getByTestId('ha-radio-button-yes');

    fireEvent.click(haRadioButton);
    expect(props.setHighAvailability).toHaveBeenCalled();
  });
});
