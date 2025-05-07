import { fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import { DeleteDomain } from './DeleteDomain';

import type { DeleteDomainProps } from './DeleteDomain';

const domainId = 1;
const domainLabel = 'example.com';

const props: DeleteDomainProps = {
  domainError: null,
  domainId,
  domainLabel,
};

describe('DeleteDomain', () => {
  it('includes a button to delete the domain', () => {
    const { getByText } = render(wrapWithTheme(<DeleteDomain {...props} />));
    getByText('Delete Domain');
  });

  it('displays the modal when the button is clicked', async () => {
    const { findByText, getByText } = render(
      wrapWithTheme(<DeleteDomain {...props} />)
    );
    fireEvent.click(getByText('Delete Domain'));
    await findByText('Delete Domain example.com?');
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
