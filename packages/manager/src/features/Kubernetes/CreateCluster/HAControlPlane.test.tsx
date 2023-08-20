import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { LKE_HA_PRICE } from 'src/utilities/pricing/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { HAControlPlane, Props } from './HAControlPlane';

const props: Props = {
  highAvailabilityPrice: LKE_HA_PRICE,
  setHighAvailability: jest.fn(),
};

describe('HAControlPlane', () => {
  it('the component should render', () => {
    const { getByTestId } = renderWithTheme(<HAControlPlane {...props} />);

    expect(getByTestId('ha-control-plane-form')).toBeVisible();
  });

  it('should not render an HA price when the price is undefined', () => {
    const { queryAllByText } = renderWithTheme(
      <HAControlPlane {...props} highAvailabilityPrice={undefined} />
    );

    expect(queryAllByText(/\$60\.00/)).toHaveLength(0);
  });

  it('should render an HA price when the price is a number', async () => {
    const { findByText } = renderWithTheme(<HAControlPlane {...props} />);

    await findByText(/\$60\.00/);
  });

  it('should call the handleChange function on change', () => {
    const { getByTestId } = renderWithTheme(<HAControlPlane {...props} />);
    const haRadioButton = getByTestId('ha-radio-button-yes');

    fireEvent.click(haRadioButton);
    expect(props.setHighAvailability).toHaveBeenCalled();
  });
});
