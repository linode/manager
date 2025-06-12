import React from 'react';

import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { EditAlertLanding } from './EditAlertLanding';

const queryMocks = vi.hoisted(() => ({
  useAlertDefinitionQuery: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useAlertDefinitionQuery: queryMocks.useAlertDefinitionQuery,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

describe('Edit Alert Landing tests', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      alertId: '1',
      serviceType: 'linode',
    });
  });

  it('Edit alert entities alert details error and loading path', async () => {
    queryMocks.useAlertDefinitionQuery.mockReturnValue({
      data: undefined,
      isError: true, // simulate error
      isFetching: false,
    });

    const { getByText } = await renderWithThemeAndRouter(<EditAlertLanding />, {
      initialRoute: '/alerts/definitions/edit/linode/1',
    });

    expect(
      getByText(
        'An error occurred while loading the alerts definitions and entities. Please try again later.'
      )
    ).toBeInTheDocument();

    queryMocks.useAlertDefinitionQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isFetching: true, // simulate loading
    });

    const { getByTestId } = await renderWithThemeAndRouter(
      <EditAlertLanding />,
      {
        initialRoute: '/alerts/definitions/edit/linode/1',
      }
    );

    expect(getByTestId('circle-progress')).toBeInTheDocument();
  });

  it('Edit alert entities alert details empty path', async () => {
    queryMocks.useAlertDefinitionQuery.mockReturnValue({
      data: undefined, // simulate empty
      isError: false,
      isFetching: false,
    });

    const { getByText } = await renderWithThemeAndRouter(<EditAlertLanding />, {
      initialRoute: '/alerts/definitions/edit/linode/1',
    });

    expect(getByText('No Data to display.')).toBeInTheDocument();
  });
});
