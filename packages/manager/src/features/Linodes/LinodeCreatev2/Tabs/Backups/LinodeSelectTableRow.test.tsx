import React from 'react';

import {
  imageFactory,
  linodeFactory,
  regionFactory,
  typeFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import {
  renderWithThemeAndHookFormContext,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { LinodeSelectTableRow } from './LinodeSelectTableRow';

describe('LinodeSelectTableRow', () => {
  it('should render a Radio that is labeled by the Linode label', () => {
    const linode = linodeFactory.build();

    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: wrapWithTableBody(<LinodeSelectTableRow linode={linode} />),
    });

    expect(getByLabelText(linode.label)).toHaveRole('radio');
  });

  it('should render a Linode image label', async () => {
    const linode = linodeFactory.build({ image: 'my-image' });
    const image = imageFactory.build({
      id: 'my-image',
      label: 'My Image Nice Label',
    });

    server.use(
      http.get('*/v4/images/my-image', () => {
        return HttpResponse.json(image);
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: wrapWithTableBody(<LinodeSelectTableRow linode={linode} />),
    });

    await findByText(image.label);
  });

  it('should render a Linode region label', async () => {
    const linode = linodeFactory.build({ region: 'us-test' });
    const region = regionFactory.build({
      id: 'us-test',
      label: 'US Test',
    });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: wrapWithTableBody(<LinodeSelectTableRow linode={linode} />),
    });

    await findByText(region.label);
  });

  it('should render a Linode plan label', async () => {
    const linode = linodeFactory.build({ type: 'linode-type-1' });
    const type = typeFactory.build({
      id: 'linode-type-1',
      label: 'Linode Type 1',
    });

    server.use(
      http.get('*/v4/linode/types/linode-type-1', () => {
        return HttpResponse.json(type);
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: wrapWithTableBody(<LinodeSelectTableRow linode={linode} />),
    });

    await findByText(type.label);
  });
});
