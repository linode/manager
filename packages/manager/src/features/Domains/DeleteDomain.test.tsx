import * as React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { Props, DeleteDomain } from './DeleteDomain';

const domainId = 1;
const domainLabel = 'example.com';

const props: Props = {
  domainId,
  domainLabel,
};

describe('DeleteDomain', () => {
  it('includes a button to delete the domain', () => {
    const { getByText } = render(wrapWithTheme(<DeleteDomain {...props} />));
    getByText('Delete Domain');
  });

  it('displays the modal when the button is clicked', () => {
    const { getByText } = render(wrapWithTheme(<DeleteDomain {...props} />));
    fireEvent.click(getByText('Delete Domain'));
    expect(getByText('Delete Domain example.com?')).toBeInTheDocument();
  });

  it('closes the modal when the "Cancel" button is clicked', async () => {
    const { getByText, queryByText } = render(
      wrapWithTheme(<DeleteDomain {...props} />)
    );
    fireEvent.click(getByText('Delete Domain'));
    fireEvent.click(getByText('Cancel'));
    await waitFor(() =>
      expect(queryByText(/Are you sure you want to delete/)).toBeNull()
    );
  });
});
