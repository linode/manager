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
  it('includes a header', () => {
    const { getAllByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />)
    );
    getAllByText('Enable Object Storage');
  });

  // TODO: DC Pricing - M3-7063: Delete this test when feature flags are cleaned up.
  it('displays flat rate pricing and storage for a region without price increases with the OBJ DC-specific pricing flag off', () => {
    const { getByText } = render(
      wrapWithTheme(
        <EnableObjectStorageModal {...props} regionId={BASE_PRICING_REGION} />,
        {
          flags: { objDcSpecificPricing: false },
        }
      )
    );
    getByText(`$${OBJ_STORAGE_PRICE.monthly}/month`, { exact: false });
    getByText(`$${OBJ_STORAGE_PRICE.storage_overage} per GB`, { exact: false });
  });

  // TODO: DC Pricing - M3-7063: Delete this test when feature flags are cleaned up.
  it('displays beta message with region label for a region with price increases when the OBJ DC-specific pricing flag is off', () => {
    const { getByText } = render(
      wrapWithTheme(
        <EnableObjectStorageModal
          {...props}
          regionId={DC_SPECIFIC_PRICING_REGION}
        />,
        {
          flags: { objDcSpecificPricing: false },
        }
      )
    );
    getByText(
      `Object Storage for ${DC_SPECIFIC_PRICING_REGION_LABEL} is currently in beta. During the beta period, Object Storage in these regions is free. After the beta period, customers will be notified before charges for this service begin.`
    );
  });

  it('displays flat rate pricing, storage, and network transfer amounts in a region without price increases with the OBJ DC-specific pricing flag on', () => {
    const { getByText } = render(
      wrapWithTheme(
        <EnableObjectStorageModal
          {...props}
          regionId={DC_SPECIFIC_PRICING_REGION}
        />,
        {
          flags: { objDcSpecificPricing: true },
        }
      )
    );
    getByText(`$${OBJ_STORAGE_PRICE.monthly}/month`, { exact: false });
    getByText(OBJ_STORAGE_STORAGE_AMT, { exact: false });
    getByText(OBJ_STORAGE_NETWORK_TRANSFER_AMT, { exact: false });
  });

  it('displays flat rate pricing, storage, and network transfer amounts in a price increase region with the OBJ DC-specific pricing flag on', () => {
    const { getByText } = render(
      wrapWithTheme(
        <EnableObjectStorageModal
          {...props}
          regionId={DC_SPECIFIC_PRICING_REGION}
        />,
        {
          flags: { objDcSpecificPricing: true },
        }
      )
    );
    getByText(`$${OBJ_STORAGE_PRICE.monthly}/month`, { exact: false });
    getByText(OBJ_STORAGE_STORAGE_AMT, { exact: false });
    getByText(OBJ_STORAGE_NETWORK_TRANSFER_AMT, { exact: false });
  });

  // TODO: DC Pricing - M3-7063: Delete this test when feature flags are cleaned up.
  it('displays a message without pricing if no region exists (e.g. access key flow) when the OBJ DC-specific pricing flag is off', () => {
    const { getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />, {
        flags: { objDcSpecificPricing: false },
      })
    );
    getByText(ENABLE_OBJ_ACCESS_KEYS_MESSAGE);
  });

  it('displays flat rate pricing, storage, and network transfer amounts when a regionId is not defined and OBJ DC-specific pricing flag is on', () => {
    const { getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />, {
        flags: { objDcSpecificPricing: true },
      })
    );
    getByText(`$${OBJ_STORAGE_PRICE.monthly}/month`, { exact: false });
    getByText(OBJ_STORAGE_STORAGE_AMT, { exact: false });
    getByText(OBJ_STORAGE_NETWORK_TRANSFER_AMT, { exact: false });
  });

  it('includes a link to linode.com/pricing', () => {
    const { getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />)
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
  it('calls the handleSubmit prop/handler when the Enable Object Storage button is clicked', () => {
    const { getByTestId } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />)
    );
    fireEvent.click(getByTestId('enable-obj'));
    expect(props.handleSubmit).toHaveBeenCalled();
  });
});
