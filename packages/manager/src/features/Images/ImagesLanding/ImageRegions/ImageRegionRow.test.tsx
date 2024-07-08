import userEvent from '@testing-library/user-event';
import React from 'react';

import { regionFactory } from 'src/factories/regions';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImageRegionRow } from './ImageRegionRow';

describe('ImageRegionRow', () => {
  it('renders a region label and status', async () => {
    const region = regionFactory.build({ id: 'us-east', label: 'Newark, NJ' });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const { findByText, getByText } = renderWithTheme(
      <ImageRegionRow onRemove={vi.fn()} region="us-east" status="creating" />
    );

    expect(getByText('creating')).toBeVisible();
    expect(await findByText('Newark, NJ')).toBeVisible();
  });

  it('calls onRemove when the remove button is clicked', async () => {
    const onRemove = vi.fn();

    const { getByLabelText } = renderWithTheme(
      <ImageRegionRow onRemove={onRemove} region="us-east" status="creating" />
    );

    const removeButton = getByLabelText('Remove us-east');

    await userEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalled();
  });
});
