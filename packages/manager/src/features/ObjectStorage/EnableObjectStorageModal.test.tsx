import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import {
  objectStorageOverageTypeFactory,
  objectStorageTypeFactory,
} from 'src/factories';
import { UNKNOWN_PRICE } from 'src/utilities/pricing/constants';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import {
  EnableObjectStorageModal,
  OBJ_STORAGE_NETWORK_TRANSFER_AMT,
  OBJ_STORAGE_STORAGE_AMT,
} from './EnableObjectStorageModal';

import type { EnableObjectStorageProps } from './EnableObjectStorageModal';

const DC_SPECIFIC_PRICING_REGION = 'id-cgk';
const BASE_PRICING_REGION = 'us-east';

const handleSubmit = vi.fn();
const onClose = vi.fn();

const props: EnableObjectStorageProps = {
  handleSubmit,
  onClose,
  open: true,
};

const queryMocks = vi.hoisted(() => ({
  useObjectStorageTypesQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/object-storage/queries', async () => {
  const actual = await vi.importActual('src/queries/object-storage/queries');
  return {
    ...actual,
    useObjectStorageTypesQuery: queryMocks.useObjectStorageTypesQuery,
  };
});

describe('EnableObjectStorageModal', () => {
  beforeAll(() => {
    const mockObjectStorageTypes = [
      objectStorageTypeFactory.build(),
      objectStorageOverageTypeFactory.build(),
    ];
    queryMocks.useObjectStorageTypesQuery.mockReturnValue({
      data: mockObjectStorageTypes,
    });
  });

  it('includes a header', () => {
    const { getAllByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />)
    );
    getAllByText('Enable Object Storage');
  });

  it('displays flat rate pricing, storage, and network transfer amounts in a region without price increases', () => {
    const { getByText } = render(
      wrapWithTheme(
        <EnableObjectStorageModal {...props} regionId={BASE_PRICING_REGION} />
      )
    );
    getByText(`$5/month`, { exact: false });
    getByText(OBJ_STORAGE_STORAGE_AMT, { exact: false });
    getByText(OBJ_STORAGE_NETWORK_TRANSFER_AMT, { exact: false });
  });

  it('displays flat rate pricing, storage, and network transfer amounts in a price increase region', () => {
    const { getByText } = render(
      wrapWithTheme(
        <EnableObjectStorageModal
          {...props}
          regionId={DC_SPECIFIC_PRICING_REGION}
        />
      )
    );
    getByText(`$5/month`, { exact: false });
    getByText(OBJ_STORAGE_STORAGE_AMT, { exact: false });
    getByText(OBJ_STORAGE_NETWORK_TRANSFER_AMT, { exact: false });
  });

  it('displays flat rate pricing, storage, and network transfer amounts when a regionId is not defined', () => {
    const { getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />)
    );
    getByText(`$5/month`, { exact: false });
    getByText(OBJ_STORAGE_STORAGE_AMT, { exact: false });
    getByText(OBJ_STORAGE_NETWORK_TRANSFER_AMT, { exact: false });
  });

  it('displays placeholder unknown pricing and disables the primary action button if pricing is not available', () => {
    queryMocks.useObjectStorageTypesQuery.mockReturnValue({
      data: undefined,
      isError: true,
    });

    const { getByTestId, getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal regionId="us-east" {...props} />)
    );

    const primaryActionButton = getByTestId('enable-obj');

    expect(getByText(`${UNKNOWN_PRICE}/month`, { exact: false })).toBeVisible();
    expect(primaryActionButton).toBeDisabled();
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

  it('calls the handleSubmit prop/handler when the Enable Object Storage button is clicked', () => {
    const { getByTestId } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />)
    );
    fireEvent.click(getByTestId('enable-obj'));
    expect(props.handleSubmit).toHaveBeenCalled();
  });
});
