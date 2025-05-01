import { regionFactory } from '@linode/utilities';
import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { UserData } from './UserData';

describe('Linode Create UserData', () => {
  it('should render if the selected image supports cloud-init and the region supports metadata', async () => {
    const image = imageFactory.build({ capabilities: ['cloud-init'] });
    const region = regionFactory.build({ capabilities: ['Metadata'] });

    server.use(
      http.get('*/v4/images/*', () => {
        return HttpResponse.json(image);
      }),
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <UserData />,
      useFormOptions: { defaultValues: { image: image.id, region: region.id } },
    });

    const userDataHeading = await findByText('Add User Data');

    expect(userDataHeading).toBeVisible();
    expect(userDataHeading.tagName).toBe('H2');
  });

  it('should display a warning message if the user data is not in an accepted format', async () => {
    const image = imageFactory.build({ capabilities: ['cloud-init'] });
    const region = regionFactory.build({ capabilities: ['Metadata'] });

    server.use(
      http.get('*/v4/images/*', () => {
        return HttpResponse.json(image);
      }),
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const inputValue = '#test-string';
    const { findByLabelText, getByText } = renderWithThemeAndHookFormContext({
      component: <UserData />,
      useFormOptions: { defaultValues: { image: image.id, region: region.id } },
    });

    const input = await findByLabelText('User Data');
    fireEvent.change(input, { target: { value: inputValue } });
    fireEvent.blur(input); // triggers format check

    expect(
      getByText('The user data may be formatted incorrectly.')
    ).toBeInTheDocument();
  });
});
