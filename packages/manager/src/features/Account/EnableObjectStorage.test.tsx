import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import EnableObjectStorage from './EnableObjectStorage';

describe('EnableObjectStorage Component', () => {
  it('Should display button to cancel object storage, if storage is enabled', () => {
    const { queryByTestId } = renderWithTheme(
      <EnableObjectStorage object_storage={'active'} />
    );

    expect(queryByTestId('open-dialog-button')).toBeInTheDocument();
  });

  it('Should not display button to cancel object storage, if storage is disabled', () => {
    const { queryByTestId } = renderWithTheme(
      <EnableObjectStorage object_storage={'disabled'} />
    );

    expect(queryByTestId('open-dialog-button')).not.toBeInTheDocument();
  });

  it('Should open confirmation dialog on Cancel Object Storage', async () => {
    const { findByTitle, getByTestId } = renderWithTheme(
      <EnableObjectStorage object_storage={'active'} />
    );
    const button = getByTestId('open-dialog-button');
    fireEvent.click(button);

    const dialog = await findByTitle('Cancel Object Storage');

    expect(dialog).toBeVisible();
  });

  it('Should close confirmation dialog on Cancel', async () => {
    const { findByTitle, getByTestId } = renderWithTheme(
      <EnableObjectStorage object_storage={'active'} />
    );
    const dialogButton = getByTestId('open-dialog-button');
    fireEvent.click(dialogButton);

    const dialog = await findByTitle('Cancel Object Storage');
    const cancelButton = getByTestId('cancel');
    fireEvent.click(cancelButton);

    expect(dialog).not.toBeVisible();
  });
});
