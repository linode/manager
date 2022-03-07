import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { CombinedProps, DeleteDomain } from './DeleteDomain';

const mockDeleteDomain = jest.fn(() => Promise.resolve({}));
const domainId = 1;
const domainLabel = 'example.com';

const props: CombinedProps = {
  domainId,
  domainLabel,
  ...reactRouterProps,
  enqueueSnackbar: jest.fn(),
  closeSnackbar: jest.fn(),
  domainActions: {
    createDomain: jest.fn(),
    deleteDomain: mockDeleteDomain,
    updateDomain: jest.fn(),
  },
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

  it("doesn't submit anything if the user hasn't typed confirmation text", async () => {
    const { getByText } = render(wrapWithTheme(<DeleteDomain {...props} />));

    fireEvent.click(getByText('Delete Domain'));
    await waitFor(() => expect(mockDeleteDomain).not.toHaveBeenCalled);
  });

  it('dispatches the deleteDomain action when the "Delete" button is clicked', async () => {
    const { getByLabelText, getByTestId, getByText } = render(
      wrapWithTheme(<DeleteDomain {...props} />)
    );

    fireEvent.click(getByText('Delete Domain'));
    userEvent.type(getByLabelText('Domain Name:'), 'example.com');
    fireEvent.click(getByTestId('delete-btn'));

    await waitFor(() =>
      expect(mockDeleteDomain).toHaveBeenCalledWith({ domainId })
    );
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
