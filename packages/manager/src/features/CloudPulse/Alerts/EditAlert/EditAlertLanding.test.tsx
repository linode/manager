import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditAlertLanding } from './EditAlertLanding';

const queryMocks = vi.hoisted(() => ({
  useAlertDefinitionQuery: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useAlertDefinitionQuery: queryMocks.useAlertDefinitionQuery,
}));

describe('Edit Alert Landing tests', () => {
  it('Edit alert entities alert details error and loading path', () => {
    queryMocks.useAlertDefinitionQuery.mockReturnValue({
      data: undefined,
      isError: true, // simulate error
      isFetching: false,
    });

    const { getByText } = renderWithTheme(<EditAlertLanding />);

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

    const { getByTestId } = renderWithTheme(<EditAlertLanding />);

    expect(getByTestId('circle-progress')).toBeInTheDocument();
  });

  it('Edit alert entities alert details empty path', () => {
    queryMocks.useAlertDefinitionQuery.mockReturnValue({
      data: undefined, // simulate empty
      isError: false,
      isFetching: false,
    });

    const { getByText } = renderWithTheme(<EditAlertLanding />);

    expect(getByText('No Data to display.')).toBeInTheDocument();
  });
});
