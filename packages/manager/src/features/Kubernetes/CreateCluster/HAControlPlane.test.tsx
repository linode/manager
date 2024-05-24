import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { HAControlPlane, HAControlPlaneProps } from './HAControlPlane';

const props: HAControlPlaneProps = {
  hasHAPriceError: false,
  highAvailabilityPrice: '60',
  selectedRegionId: 'us-southeast',
  setHighAvailability: vi.fn(),
};

describe('HAControlPlane', () => {
  it('the component should render', () => {
    const { getByTestId } = renderWithTheme(<HAControlPlane {...props} />);

    expect(getByTestId('ha-control-plane-form')).toBeVisible();
  });

  it('should not render an HA price when the price is undefined', () => {
    const highAvailabilityPriceError = '--.--';

    const { queryAllByText } = renderWithTheme(
      <HAControlPlane
        {...props}
        highAvailabilityPrice={highAvailabilityPriceError}
      />
    );

    expect(queryAllByText(/\$--\.--/)).toHaveLength(1);
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
