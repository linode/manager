import { profileFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { grantsFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { ImagesLandingEmptyState } from './ImagesLandingEmptyState';

describe('ImagesLandingEmptyState', () => {
  it('disables the create button if the user does not have permission to create images', async () => {
    server.use(
      http.get('*/v4/profile', () => {
        const profile = profileFactory.build({ restricted: true });
        return HttpResponse.json(profile);
      }),
      http.get('*/v4/profile/grants', () => {
        const grants = grantsFactory.build({ global: { add_images: false } });
        return HttpResponse.json(grants);
      }),
      http.get('*/v4/images', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByText } = await renderWithThemeAndRouter(
      <ImagesLandingEmptyState />
    );

    await waitFor(() => {
      const createImageButton = getByText('Create Image').closest('button');

      expect(createImageButton).toBeDisabled();
      expect(createImageButton).toHaveAttribute(
        'data-qa-tooltip',
        "You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions."
      );
    });
  });
});
