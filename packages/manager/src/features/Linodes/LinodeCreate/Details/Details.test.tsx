import { grantsFactory, profileFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Details } from './Details';

describe('Linode Create Details', () => {
  it('renders a header', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Details />,
    });

    const header = getByText('Details');

    expect(header).toBeVisible();
    expect(header.tagName).toBe('H2');
  });

  it('renders a "Linode Label" text field', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <Details />,
    });

    expect(getByLabelText('Linode Label')).toBeVisible();
  });

  it('renders an "Add Tags" field', () => {
    const { getByLabelText, getByPlaceholderText } =
      renderWithThemeAndHookFormContext({
        component: <Details />,
      });

    expect(getByLabelText('Add Tags')).toBeVisible();
    expect(
      getByPlaceholderText('Type to choose or create a tag.')
    ).toBeVisible();
  });

  it('renders a placement group details', async () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Details />,
    });

    await waitFor(() => {
      expect(
        getByText(
          'Select a Region for your Linode to see existing placement groups.'
        )
      ).toBeVisible();
    });
  });

  it('does not render the tag select when cloning', () => {
    const { queryByText } = renderWithThemeAndHookFormContext({
      component: <Details />,
      options: {
        MemoryRouter: {
          initialEntries: ['/linodes/create?type=Clone+Linode'],
        },
      },
    });

    expect(queryByText('Tags')).toBeNull();
  });

  it('should disable the label and tag TextFields if the user does not have permission to create a linode', async () => {
    server.use(
      http.get('*/v4/profile', () => {
        return HttpResponse.json(profileFactory.build({ restricted: true }));
      }),
      http.get('*/v4/profile/grants', () => {
        return HttpResponse.json(
          grantsFactory.build({ global: { add_linodes: false } })
        );
      })
    );

    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <Details />,
    });

    const labelInput = getByLabelText('Linode Label');
    const tagsInput = getByLabelText('Add Tags');

    await waitFor(() => {
      expect(labelInput).toBeDisabled();
      expect(tagsInput).toBeDisabled();
    });
  });
});
