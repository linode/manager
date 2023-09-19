import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import {
  ENABLE_OBJ_ACCESS_KEYS_MESSAGE,
  OBJ_STORAGE_PRICE,
} from 'src/utilities/pricing/constants';
import { objectStoragePriceIncreaseMap } from 'src/utilities/pricing/dynamicPricing';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { EnableObjectStorageModal, Props } from './EnableObjectStorageModal';

const DC_PRICING_REGION = 'id-cgk';
const BASE_PRICING_REGION = 'us-east';

const handleSubmit = jest.fn();
const onClose = jest.fn();

const props: Props = {
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

  // TODO: fix
  it.skip('displays base prices for a region without price increases', () => {
    const { getByText } = render(
      wrapWithTheme(
        <EnableObjectStorageModal {...props} regionId={BASE_PRICING_REGION} />
      )
    );
    getByText(`$${OBJ_STORAGE_PRICE.monthly}/month`, { exact: false });
    getByText(`$${OBJ_STORAGE_PRICE.storage_overage} per GB`, { exact: false });
    getByText(`$${OBJ_STORAGE_PRICE.transfer_overage} per GB`, {
      exact: false,
    });
  });

  // TODO: displays beta message with region label if obj DC-specific pricing flag is on
  it.skip('displays DC-specific prices if the DC-specific pricing flag is on', () => {
    const { getByText } = render(
      wrapWithTheme(
        <EnableObjectStorageModal {...props} regionId={DC_PRICING_REGION} />,
        {
          flags: { objDCSpecificPricing: true },
        }
      )
    );
    getByText(
      `$${objectStoragePriceIncreaseMap[DC_PRICING_REGION].monthly}/month`,
      {
        exact: false,
      }
    );
    getByText(
      `$${objectStoragePriceIncreaseMap[DC_PRICING_REGION].storage_overage} per GB`,
      { exact: false }
    );
    getByText(
      `$${objectStoragePriceIncreaseMap[DC_PRICING_REGION].transfer_overage} per GB`,
      { exact: false }
    );
  });

  // TODO: fix
  it.skip('displays base prices if the DC-specific pricing flag is off', () => {
    const { getByText } = render(
      wrapWithTheme(
        <EnableObjectStorageModal {...props} regionId={DC_PRICING_REGION} />,
        {
          flags: { objDCSpecificPricing: false },
        }
      )
    );
    getByText(`${OBJ_STORAGE_PRICE.monthly}/month`, { exact: false });
    getByText(`$${OBJ_STORAGE_PRICE.storage_overage} per GB`, { exact: false });
    getByText(`$${OBJ_STORAGE_PRICE.transfer_overage} per GB`, {
      exact: false,
    });
  });

  it('displays a message without pricing if no region exists, e.g. access key flow, when the OBJ DC-specific pricing flag is on', () => {
    const { getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />, {
        flags: { objDCSpecificPricing: true },
      })
    );
    getByText(ENABLE_OBJ_ACCESS_KEYS_MESSAGE);
  });

  // TODO: includes a link to linode.com/pricing
  it.skip('includes a link to linode.com/pricing', () => {
    const { getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />)
    );
    const link = getByText('Learn more');
    expect(link.closest('a')).toHaveAttribute('href', '/account/settings');
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

  it('calls the onClose prop/handler when the X button is clicked', () => {
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
