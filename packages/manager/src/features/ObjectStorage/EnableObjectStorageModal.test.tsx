import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import {
  ENABLE_OBJ_ACCESS_KEYS_MESSAGE,
  OBJ_STORAGE_PRICE,
} from 'src/utilities/pricing/constants';
import { objectStoragePriceIncreaseMap } from 'src/utilities/pricing/dynamicPricing';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import {
  EnableObjectStorageModal,
  EnableObjectStorageProps,
} from './EnableObjectStorageModal';

const DC_SPECIFIC_PRICING_REGION_LABEL = 'Jakarta, ID';
const DC_SPECIFIC_PRICING_REGION = 'id-cgk';
const BASE_PRICING_REGION = 'us-east';

const handleSubmit = jest.fn();
const onClose = jest.fn();

const props: EnableObjectStorageProps = {
  handleSubmit,
  onClose,
  open: true,
};

describe('EnableObjectStorageModal', () => {
  it('includes a header', () => {
    const { getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />)
    );
    getByText('Just to confirm...');
  });

  // TODO: DC Pricing - M3-7073: Remove this test once dcSpecificPricing flag is cleaned up
  it('displays base prices for a region without price increases when the OBJ DC-specific pricing feature flag is off', () => {
    const { getByText } = render(
      wrapWithTheme(
        <EnableObjectStorageModal {...props} regionId={BASE_PRICING_REGION} />,
        { flags: { dcSpecificPricing: false } }
      )
    );
    getByText(`$${OBJ_STORAGE_PRICE.monthly}/month`, { exact: false });
    getByText(`$${OBJ_STORAGE_PRICE.storage_overage} per GB`, { exact: false });
  });

  // TODO: DC Pricing - M3-7073: Remove this test once dcSpecificPricing flag is cleaned up
  it('displays base prices for a region with price increases if the OBJ DC-specific pricing feature flag is off', () => {
    const { getByText } = render(
      wrapWithTheme(
        <EnableObjectStorageModal
          {...props}
          regionId={DC_SPECIFIC_PRICING_REGION}
        />,
        {
          flags: { dcSpecificPricing: false },
        }
      )
    );
    getByText(`${OBJ_STORAGE_PRICE.monthly}/month`, { exact: false });
    getByText(`$${OBJ_STORAGE_PRICE.storage_overage} per GB`, { exact: false });
  });

  it('displays base prices for a region without price increases when the OBJ DC-specific pricing feature flag is on', () => {
    const { getByText } = render(
      wrapWithTheme(
        <EnableObjectStorageModal {...props} regionId={BASE_PRICING_REGION} />,
        { flags: { dcSpecificPricing: true } }
      )
    );
    getByText(`$${OBJ_STORAGE_PRICE.monthly}/month`, { exact: false });
    getByText(`$${OBJ_STORAGE_PRICE.storage_overage} per GB`, { exact: false });
  });

  // TODO: DC Pricing - M3-6973: delete this test and replace it with the one below it when beta pricing ends.
  it('displays beta message with region label for a region with price increases when the OBJ DC-specific pricing flag is on', () => {
    const { getByText } = render(
      wrapWithTheme(
        <EnableObjectStorageModal
          {...props}
          regionId={DC_SPECIFIC_PRICING_REGION}
        />,
        {
          flags: { dcSpecificPricing: true },
        }
      )
    );
    getByText(
      `Object Storage for ${DC_SPECIFIC_PRICING_REGION_LABEL} is currently in beta. During the beta period, Object Storage in these regions is free. After the beta period, customers will be notified before charges for this service begin.`
    );
  });

  // TODO: DC Pricing - M3-6973: Unskip this test when beta pricing ends.
  it.skip('displays DC-specific pricing  for a region with price increases when the OBJ DC-specific pricing flag is on', () => {
    const { getByText } = render(
      wrapWithTheme(
        <EnableObjectStorageModal
          {...props}
          regionId={DC_SPECIFIC_PRICING_REGION}
        />,
        {
          flags: { dcSpecificPricing: true },
        }
      )
    );
    getByText(
      `$${objectStoragePriceIncreaseMap[DC_SPECIFIC_PRICING_REGION].monthly}/month`,
      {
        exact: false,
      }
    );
    getByText(
      `$${objectStoragePriceIncreaseMap[DC_SPECIFIC_PRICING_REGION].storage_overage} per GB`,
      { exact: false }
    );
    getByText(
      `$${objectStoragePriceIncreaseMap[DC_SPECIFIC_PRICING_REGION].transfer_overage} per GB`,
      { exact: false }
    );
  });

  it('displays a message without pricing if no region exists (e.g. access key flow) when the OBJ DC-specific pricing flag is on', () => {
    const { getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />, {
        flags: { dcSpecificPricing: true },
      })
    );
    getByText(ENABLE_OBJ_ACCESS_KEYS_MESSAGE);
  });

  it('includes a link to linode.com/pricing when the OBJ DC-specific pricing flag is on', () => {
    const { getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />, {
        flags: { dcSpecificPricing: true },
      })
    );
    const link = getByText('Learn more');
    expect(link.closest('a')).toHaveAttribute(
      'href',
      'https://www.linode.com/pricing/#object-storage'
    );
  });

  it('includes a link to Account Settings', () => {
    const { getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />)
    );
    const link = getByText('Account Settings');
    expect(link.closest('a')).toHaveAttribute('href', '/account/settings');
  });

  it('calls the onClose prop/handler when the Cancel button is clicked', () => {
    const { getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />)
    );
    fireEvent.click(getByText('Cancel'));
    expect(props.onClose).toHaveBeenCalled();
  });

  it('calls the onClose prop/handler when the Close (X) button is clicked', () => {
    const { getByLabelText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />)
    );
    fireEvent.click(getByLabelText('Close'));
    expect(props.onClose).toHaveBeenCalled();
  });

  it('calls the handleSubmit prop/handler when the Enable Object Storage button is clicked', () => {
    const { getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />)
    );
    fireEvent.click(getByText('Enable Object Storage'));
    expect(props.handleSubmit).toHaveBeenCalled();
  });
});
