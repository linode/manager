import { waitFor } from '@testing-library/react';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Details } from './Details';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
  userPermissions: vi.fn(() => ({
    data: {
      create_linode: false,
    },
  })),
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

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('Linode Create Details', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

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
        getByText('Select a Region to see available placement groups.')
      ).toBeVisible();
    });
  });

  it('does not render the tag select when cloning', () => {
    const { queryByText } = renderWithThemeAndHookFormContext({
      component: <Details />,
      options: {
        initialRoute: '/linodes/create/clone',
        initialEntries: ['/linodes/create/clone'],
      },
    });

    expect(queryByText('Tags')).toBeNull();
  });

  it('should disable the label and tag TextFields if the user does not have create_linode permission', async () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <Details />,
    });

    const labelInput = getByLabelText('Linode Label');
    const tagsInput = getByLabelText('Add Tags');

    expect(labelInput).toBeDisabled();
    expect(tagsInput).toBeDisabled();
  });

  it('should enable the label and tag TextFields if the user has create_linode permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: true,
      },
    });
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <Details />,
    });

    const labelInput = getByLabelText('Linode Label');
    const tagsInput = getByLabelText('Add Tags');

    expect(labelInput).toBeEnabled();
    expect(tagsInput).toBeEnabled();
  });
});
