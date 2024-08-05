import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Images } from './Images';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';

describe('Images', () => {
  it('renders a header', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Images />,
    });

    const header = getByText('Choose an Image');

    expect(header).toBeVisible();
    expect(header.tagName).toBe('H2');
  });

  it('renders an image select', () => {
    const {
      getByLabelText,
      getByPlaceholderText,
    } = renderWithThemeAndHookFormContext({
      component: <Images />,
    });

    expect(getByLabelText('Images')).toBeVisible();
    expect(getByPlaceholderText('Choose an image')).toBeVisible();
  });

  it('renders a "Indicates compatibility with distributed compute regions." notice if the user has at least one image with the distributed capability', async () => {
    server.use(
      http.get('*/v4/images', () => {
        const images = [
          imageFactory.build({ capabilities: [] }),
          imageFactory.build({ capabilities: ['distributed-sites'] }),
          imageFactory.build({ capabilities: [] }),
        ];
        return HttpResponse.json(makeResourcePage(images));
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Images />,
    });

    expect(
      await findByText(
        'Indicates compatibility with distributed compute regions.'
      )
    ).toBeVisible();
  });
});
