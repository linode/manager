import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { HAControlPlane, Props } from './HAControlPlane';

const props: Props = {
  HIGH_AVAILABILITY_PRICE: 60,
  setHighAvailability: jest.fn(),
};

describe('HAControlPlane', () => {
  it('the component should render', () => {
    const { getByTestId } = renderWithTheme(<HAControlPlane {...props} />);

    expect(getByTestId('ha-control-plane-form')).toBeVisible();
  });

  it('the component should not render when HIGH_AVAILABILITY_PRICE is undefined ', () => {
    const testProps: Props = {
      HIGH_AVAILABILITY_PRICE: undefined,
      setHighAvailability: jest.fn(),
    };
    const { queryByTestId } = renderWithTheme(
      <HAControlPlane {...testProps} />
    );

    expect(queryByTestId('ha-control-plane-form')).not.toBeInTheDocument();
  });

  it('should call the handleChange function on change', () => {
    const { getByTestId } = renderWithTheme(<HAControlPlane {...props} />);
    const haRadioButton = getByTestId('ha-radio-button-yes');

    fireEvent.click(haRadioButton);
    expect(props.setHighAvailability).toHaveBeenCalled();
  });
});
