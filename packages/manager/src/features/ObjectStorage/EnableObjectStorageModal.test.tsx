import '@testing-library/jest-dom/extend-expect';
import { cleanup, fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { EnableObjectStorageModal, Props } from './EnableObjectStorageModal';

afterEach(cleanup);

const handleSubmit = jest.fn();
const onClose = jest.fn();

const props: Props = {
  handleSubmit,
  onClose,
  open: true
};

describe('EnableObjectStorageModal', () => {
  it('includes a header', () => {
    const { getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />)
    );
    getByText('Just to confirm...');
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

  it('calls the handleSubmit prop/handler when the Enable Object Storage button is clicked', () => {
    const { getByText } = render(
      wrapWithTheme(<EnableObjectStorageModal {...props} />)
    );
    fireEvent.click(getByText('Enable Object Storage'));
    expect(props.handleSubmit).toHaveBeenCalled();
  });
});
