import { linodeFactory } from '@linode/utilities';
import React from 'react';

import { linodeDiskFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { LinodeDisks } from './LinodeDisks';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
    useParams: queryMocks.useParams,
  };
});

describe('LinodeDisks', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

  it('should render', async () => {
    const disks = linodeDiskFactory.buildList(5);

    server.use(
      http.get('*/linode/instances/:id', () => {
        return HttpResponse.json(linodeFactory.build());
      }),
      http.get('*/linode/instances/:id/disks', () => {
        return HttpResponse.json(makeResourcePage(disks));
      })
    );

    const { findByText, getByText } = await renderWithThemeAndRouter(
      <LinodeDisks />
    );

    // Verify heading renders
    expect(getByText('Disks')).toBeVisible();

    // Verify all 5 disks returned by the API render
    for (const disk of disks) {
      await findByText(disk.label);
    }
  });
});
