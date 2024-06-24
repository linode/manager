import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { UNKNOWN_PRICE } from 'src/utilities/pricing/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { HAControlPlane } from './HAControlPlane';

import type { HAControlPlaneProps } from './HAControlPlane';

const props: HAControlPlaneProps = {
  highAvailabilityPrice: '60.00',
  isErrorKubernetesTypes: false,
  isLoadingKubernetesTypes: false,
  selectedRegionId: 'us-southeast',
  setHighAvailability: vi.fn(),
};

describe('HAControlPlane', () => {
  it('the component should render', () => {
    const { getByTestId } = renderWithTheme(<HAControlPlane {...props} />);

    expect(getByTestId('ha-control-plane-form')).toBeVisible();
  });

  it('should not render an HA price when there is a price error', () => {
    const { getByText } = renderWithTheme(
      <HAControlPlane
        {...props}
        highAvailabilityPrice={UNKNOWN_PRICE}
        isErrorKubernetesTypes={true}
      />
    );

    getByText(/The cost for HA control plane is not available at this time./);
    getByText(/For this region, HA control plane costs \$--.--\/month./);
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
