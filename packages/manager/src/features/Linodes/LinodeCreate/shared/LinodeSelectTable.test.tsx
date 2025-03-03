import { HttpResponse, http } from 'msw';
import React from 'react';

import { linodeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { server } from 'src/mocks/testServer';
import {
  mockMatchMedia,
  renderWithThemeAndHookFormContext,
} from 'src/utilities/testHelpers';

import { LinodeSelectTable, getLinodeXFilter } from './LinodeSelectTable';

beforeAll(() => mockMatchMedia());

describe('Linode Select Table', () => {
  it('should filter out Linodes in distributed regions', () => {
    const xFilter = getLinodeXFilter('');

    expect(xFilter).toHaveProperty('site_type', 'core');
  });

  it('should search for both label and id', () => {
    const xFilter = getLinodeXFilter('12345678');

    expect(xFilter).toStrictEqual({
      '+or': [
        { label: { '+contains': '12345678' } },
        { id: { '+contains': '12345678' } },
      ],
      site_type: 'core',
    });
  });

  it('should render Linodes from the API', async () => {
    const linodes = linodeFactory.buildList(10);

    server.use(
      http.get('*/linode/instances*', () => {
        return HttpResponse.json(makeResourcePage(linodes));
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <LinodeSelectTable />,
    });

    for (const linode of linodes) {
      // eslint-disable-next-line no-await-in-loop
      await findByText(linode.label);
    }
  });

  it('should select a linode based on form state', async () => {
    const selectedLinode = linodeFactory.build({
      id: 1,
      label: 'my-selected-linode',
    });

    server.use(
      http.get('*/linode/instances*', () => {
        return HttpResponse.json(makeResourcePage([selectedLinode]));
      })
    );

    const { findByLabelText } = renderWithThemeAndHookFormContext({
      component: <LinodeSelectTable />,
      useFormOptions: {
        defaultValues: { linode: selectedLinode },
      },
    });

    const radio = await findByLabelText(selectedLinode.label);

    expect(radio).toBeEnabled();
    expect(radio).toBeChecked();
  });
});
