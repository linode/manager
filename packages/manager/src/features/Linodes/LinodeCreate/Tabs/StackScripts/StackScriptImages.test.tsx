import userEvent from '@testing-library/user-event';
import React from 'react';

import { imageFactory, stackScriptFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StackScriptImages } from './StackScriptImages';

describe('Images', () => {
  it('should render a heading', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <StackScriptImages />,
    });

    expect(getByText('Select an Image')).toBeVisible();
  });

  it('should render an Image Select', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <StackScriptImages />,
    });

    expect(getByLabelText('Images')).toBeVisible();
  });

  it('should only render images that are compatible with the selected StackScript', async () => {
    const images = imageFactory.buildList(5, { eol: null });

    // For the sake of this test, we pretend this image is the only compatible image.
    const compatibleImage = images[2];

    const stackscript = stackScriptFactory.build({
      images: [compatibleImage.id],
    });

    server.use(
      http.get('*/v4/images', () => {
        return HttpResponse.json(makeResourcePage(images));
      }),
      http.get('*/v4/linode/stackscripts/:id', () => {
        return HttpResponse.json(stackscript);
      })
    );

    const { findByText, getByLabelText, queryByText } =
      renderWithThemeAndHookFormContext({
        component: <StackScriptImages />,
        useFormOptions: {
          defaultValues: { stackscript_id: stackscript.id },
        },
      });

    const imageSelect = getByLabelText('Images');

    await userEvent.click(imageSelect);

    // Verify that the compabile image is show in the dropdown.
    await findByText(compatibleImage.label);

    // Verify that the images returned by the API that are NOT compatible
    // with this StackScript are *not* shown in the dropdown.
    for (const image of images) {
      if (image !== compatibleImage) {
        expect(queryByText(image.label)).toBeNull();
      }
    }
  });
});
