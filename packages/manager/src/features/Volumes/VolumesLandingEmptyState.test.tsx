import { waitFor } from '@testing-library/react';
import React from 'react';

import { grantsFactory, profileFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { VolumesLandingEmptyState } from './VolumesLandingEmptyState';

describe('VolumesLandingEmptyState', () => {
  it('disables the create button if the user does not have permission to create volumes', async () => {
    server.use(
      http.get('*/v4/profile', () => {
        const profile = profileFactory.build({ restricted: true });
        return HttpResponse.json(profile);
      }),
      http.get('*/v4/profile/grants', () => {
        const grants = grantsFactory.build({ global: { add_volumes: false } });
        return HttpResponse.json(grants);
      }),
      http.get('*/v4/volumes', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByText } = await renderWithThemeAndRouter(
      <VolumesLandingEmptyState />
    );

    await waitFor(() => {
      const createVolumeButton = getByText('Create Volume').closest('button');

      expect(createVolumeButton).toBeDisabled();
      expect(createVolumeButton).toHaveAttribute(
        'data-qa-tooltip',
        "You don't have permissions to create Volumes. Please contact your account administrator to request the necessary permissions."
      );
    });
  });
});
