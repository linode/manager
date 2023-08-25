import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { BetaDetailsList } from './BetaDetailsList';
import { APIError } from '@linode/api-v4';

describe('BetaDetails', () => {
  it('should display the title supplied in the props as an h2 component', () => {
    const { queryByRole } = renderWithTheme(
      <BetaDetailsList
        title="Available"
        betas={[]}
        errors={null}
        isLoading={false}
      />
    );
    expect(queryByRole('heading')?.textContent).toBe('Available');
  });

  it('should dispaly the circle progress component if the isLoading prop is set to true', () => {
    const { queryByTestId: queryBetasList } = renderWithTheme(
      <BetaDetailsList
        title="Available"
        betas={[]}
        errors={null}
        isLoading={false}
      />
    );
    expect(queryBetasList('circle-progress')).toBeFalsy();

    const { queryByTestId: queryLoadingBetasList } = renderWithTheme(
      <BetaDetailsList title="Available" betas={[]} isLoading errors={null} />
    );
    expect(queryLoadingBetasList('circle-progress')).not.toBeFalsy();
  });

  it("should display the error state component with the error's reason as the error text", () => {
    const error: APIError = {
      reason: 'You do not have permissions to access this resource.',
    };
    const betasList = renderWithTheme(
      <BetaDetailsList
        title="Available"
        betas={[]}
        errors={null}
        isLoading={false}
      />
    );
    expect(betasList.queryByTestId('error-state')).toBeFalsy();
    expect(betasList.queryByText(error.reason)).toBeFalsy();

    const errorBetasList = renderWithTheme(
      <BetaDetailsList
        title="Available"
        betas={[]}
        isLoading
        errors={[error]}
      />
    );
    expect(errorBetasList.queryByTestId('error-state')).not.toBeFalsy();
    expect(errorBetasList.queryByText(error.reason)).not.toBeFalsy();
  });
});
