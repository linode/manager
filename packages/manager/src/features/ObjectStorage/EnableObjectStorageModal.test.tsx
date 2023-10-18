import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import {
  ENABLE_OBJ_ACCESS_KEYS_MESSAGE,
  OBJ_STORAGE_PRICE,
} from 'src/utilities/pricing/constants';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import {
  EnableObjectStorageModal,
  EnableObjectStorageProps,
  OBJ_STORAGE_NETWORK_TRANSFER_AMT,
  OBJ_STORAGE_STORAGE_AMT,
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
  // TODO: fix failing test
  it.skip('includes a header', () => {
    const { getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />)
    );
    getByText('Enable Object Storage');
  });

  it('displays base prices for a region without price increases when the DC-specific pricing feature flag is off', () => {
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
  it('displays base prices for a region with price increases when the DC-specific pricing feature flag is off', () => {
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

  it('displays base prices for a region without price increases when the DC-specific pricing feature flag is on', () => {
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
  it('displays beta message with region label for a region with price increases when the DC-specific pricing flag is on', () => {
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

  it('displays flat rate pricing, storage, and network transfer amounts when OBJ DC-specific pricing flag is on', () => {
    const { getByText } = render(
      wrapWithTheme(
        <EnableObjectStorageModal
          {...props}
          regionId={DC_SPECIFIC_PRICING_REGION}
        />,
        {
          flags: { objDCSpecificPricing: true },
        }
      )
    );
    getByText(`$${OBJ_STORAGE_PRICE.monthly}/month`, { exact: false });
    getByText(OBJ_STORAGE_STORAGE_AMT, { exact: false });
    getByText(OBJ_STORAGE_NETWORK_TRANSFER_AMT, { exact: false });
  });

  it('displays a message without pricing if no region exists (e.g. access key flow) when the DC-specific pricing flag is on', () => {
    const { getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />, {
        flags: { dcSpecificPricing: true },
      })
    );
    getByText(ENABLE_OBJ_ACCESS_KEYS_MESSAGE);
  });

  it('includes a link to linode.com/pricing when the DC-specific pricing flag is on', () => {
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

  // TODO: fix failing test
  it.skip('calls the handleSubmit prop/handler when the Enable Object Storage button is clicked', () => {
    const { getByLabelText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />)
    );
    fireEvent.click(getByLabelText('Enable Object Storage'));
    expect(props.handleSubmit).toHaveBeenCalled();
  });
});
