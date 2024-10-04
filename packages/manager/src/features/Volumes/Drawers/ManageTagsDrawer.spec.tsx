import * as React from 'react';

import { accountFactory, volumeFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ManageTagsDrawer } from './ManageTagsDrawer';

const accountEndpoint = '*/v4/account';
const testTags = ['first-tag', 'second-tag'];

describe('ManageTagsDrawer', () => {
  it('should render tags', () => {
    const volume = volumeFactory.build({
      tags: testTags,
    });

    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(accountFactory.build());
      })
    );

    const { getByText } = renderWithTheme(
      <ManageTagsDrawer onClose={vi.fn} open={true} volume={volume} />
    );

    testTags.forEach((tag) => {
      expect(getByText(tag)).toBeVisible();
    });
  });

  it('should disable submit button when form is not dirty', () => {
    const volume = volumeFactory.build();

    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(accountFactory.build());
      })
    );

    const { getByText } = renderWithTheme(
      <ManageTagsDrawer onClose={vi.fn} open={true} volume={volume} />
    );

    expect(getByText('Save Changes').closest('button')).toBeDisabled();
  });
});
