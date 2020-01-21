// import '@testing-library/jest-dom/extend-expect';
import { cleanup, fireEvent, render, wait } from '@testing-library/react';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { CombinedProps, DeleteDomain } from './DeleteDomain';

afterEach(cleanup);

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
    updateDomain: jest.fn()
  }
};

describe('DeleteDomain', () => {
  it('includes a button to delete the domain', () => {
    const { getByText } = render(wrapWithTheme(<DeleteDomain {...props} />));
    getByText('Delete Domain');
  });

  it('displays the modal when the button is clicked', () => {
    const { getByText } = render(wrapWithTheme(<DeleteDomain {...props} />));
    fireEvent.click(getByText('Delete Domain'));
    getByText(/Are you sure you want to delete/);
  });

  it('dispatches the deleteDomain action when the "Delete" button is clicked', async () => {
    const { getByText } = render(wrapWithTheme(<DeleteDomain {...props} />));
    fireEvent.click(getByText('Delete Domain'));
    await wait(() => fireEvent.click(getByText('Delete')));
    expect(mockDeleteDomain).toHaveBeenCalledWith({ domainId });
  });

  it('closes the modal when the "Cancel" button is clicked', async () => {
    const { getByText, queryByText } = render(
      wrapWithTheme(<DeleteDomain {...props} />)
    );
    fireEvent.click(getByText('Delete Domain'));
    await wait(() => fireEvent.click(getByText('Cancel')));
    await wait(() =>
      expect(queryByText(/Are you sure you want to delete/)).toBeNull()
    );
  });
});
