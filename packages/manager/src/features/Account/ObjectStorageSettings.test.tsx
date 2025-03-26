import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { accountSettingsFactory, profileFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ObjectStorageSettings } from './ObjectStorageSettings';

import type { ManagerPreferences } from 'src/types/ManagerPreferences';

const preference: ManagerPreferences['type_to_confirm'] = true;

const queryMocks = vi.hoisted(() => ({
  usePreferences: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/profile/preferences', async () => {
  const actual = await vi.importActual('src/queries/profile/preferences');
  return {
    ...actual,
    usePreferences: queryMocks.usePreferences,
  };
});

queryMocks.usePreferences.mockReturnValue({
  data: preference,
});

describe('ObjectStorageSettings', () => {
  it('Should display button to cancel object storage, if storage is enabled', async () => {
    server.use(
      http.get('*/account/settings', () => {
        return HttpResponse.json(
          accountSettingsFactory.build({ object_storage: 'active' })
        );
      })
    );

    const { findByText } = renderWithTheme(<ObjectStorageSettings />);

    const cancelButton = (await findByText('Cancel Object Storage')).closest(
      'button'
    );

    const copy = await findByText(
      'Object Storage is enabled on your account.',
      {
        exact: false,
      }
    );

    expect(copy).toBeVisible();
    expect(cancelButton).toBeVisible();
    expect(cancelButton).toBeEnabled();
  });

  it('Should not display button to cancel object storage if storage is disabled', async () => {
    server.use(
      http.get('*/account/settings', () => {
        return HttpResponse.json(
          accountSettingsFactory.build({ object_storage: 'disabled' })
        );
      })
    );

    const { findByText, queryByText } = renderWithTheme(
      <ObjectStorageSettings />
    );

    const copy = await findByText('To get started with Object Storage', {
      exact: false,
    });

    expect(copy).toBeVisible();

    expect(queryByText('Cancel Object Storage')).not.toBeInTheDocument();
  });

  it('Should update the UI when the cancel request is successful', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });

    server.use(
      http.get('*/v4/account/settings', () => {
        return HttpResponse.json(
          accountSettingsFactory.build({ object_storage: 'active' })
        );
      }),
      http.get('*/v4/profile', () => {
        return HttpResponse.json(
          profileFactory.build({ username: 'my-username-1' })
        );
      }),
      http.post('*/v4/object-storage/cancel', () => {
        return HttpResponse.json({});
      })
    );

    const { findByText, getByLabelText, getByTitle } = renderWithTheme(
      <ObjectStorageSettings />
    );

    const cancelButton = (await findByText('Cancel Object Storage')).closest(
      'button'
    );

    // Click the "Cancel Object Storage" button
    await userEvent.click(cancelButton!);

    // Verify the dialog opens and has the correct title
    expect(getByTitle('Cancel Object Storage')).toBeVisible();

    const confirmButton = (await findByText('Confirm Cancellation')).closest(
      'button'
    );

    // The confirm button is disabled because the user needs to type to confirm
    expect(confirmButton).toBeDisabled();

    const typeToConfirmTextField = getByLabelText('Username');

    // Type the user's username to confirm
    await userEvent.type(typeToConfirmTextField, 'my-username-1');

    // The confirm button became enabled because we typed username
    expect(confirmButton).toBeEnabled();

    // Confirm cancelation of Object Storage
    await userEvent.click(confirmButton!);

    // Verify UI updates to reflect Object Storage is not active
    const copy = await findByText('To get started with Object Storage', {
      exact: false,
    });

    expect(copy).toBeVisible();
  });
});
