import { linodeFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RebuildImageDrawer } from './RebuildImageDrawer';

const props = {
  changeLinode: vi.fn(),
  image: imageFactory.build(),
  imageError: null,
  isFetching: false,
  onClose: vi.fn(),
  open: true,
};

const mockNavigate = vi.fn();

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => mockNavigate),
  useQueryWithPermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  useQueryWithPermissions: queryMocks.useQueryWithPermissions,
}));

describe('RebuildImageDrawer', () => {
  beforeEach(() => {
    vi.mocked(queryMocks.useQueryWithPermissions).mockReturnValue({
      loading: false,
    });
  });

  it('should render', async () => {
    const { getByText } = renderWithTheme(<RebuildImageDrawer {...props} />);

    // Verify title renders
    getByText('Rebuild an Existing Linode from an Image');

    // Verify image label is displayed
    getByText(props.image.label);
  });

  it('should allow selecting a Linode to rebuild', async () => {
    const { findByText, getByRole, getByText } = renderWithTheme(
      <RebuildImageDrawer {...props} />
    );

    server.use(
      http.get('*/linode/instances', () => {
        return HttpResponse.json(makeResourcePage(linodeFactory.buildList(5)));
      })
    );

    await userEvent.click(getByRole('combobox'));
    await userEvent.click(await findByText('linode-1'));
    await userEvent.click(getByText('Rebuild Linode'));

    expect(mockNavigate).toBeCalledWith({
      to: '/linodes/$linodeId',
      params: { linodeId: 1 },
      search: { selectedImageId: 'private/1', rebuild: true },
    });
  });
});
