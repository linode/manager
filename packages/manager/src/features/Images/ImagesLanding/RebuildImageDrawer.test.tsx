import { linodeFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { imageFactory } from 'src/factories';
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
  useAllLinodesQuery: vi.fn().mockReturnValue({}),
  useNavigate: vi.fn(() => mockNavigate),
  useGetAllUserEntitiesByPermission: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllLinodesQuery: queryMocks.useAllLinodesQuery,
  };
});

vi.mock('src/features/IAM/hooks/useGetAllUserEntitiesByPermission', () => ({
  useGetAllUserEntitiesByPermission:
    queryMocks.useGetAllUserEntitiesByPermission,
}));

describe('RebuildImageDrawer', () => {
  beforeEach(() => {
    queryMocks.useGetAllUserEntitiesByPermission.mockReturnValue({
      isLoading: false,
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
    queryMocks.useAllLinodesQuery.mockReturnValue({
      isLoading: false,
      data: linodeFactory.buildList(5),
    });
    const { findByText, getByRole, getByText } = renderWithTheme(
      <RebuildImageDrawer {...props} />
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
