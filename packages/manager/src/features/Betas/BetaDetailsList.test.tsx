import * as React from 'react';

import { renderWithThemeV2 } from 'src/utilities/testHelpers';

import { BetaDetailsList } from './BetaDetailsList';

import type { APIError } from '@linode/api-v4';

describe('BetaDetails', () => {
  it('should display the title supplied in the props as an h2 component', async () => {
    const { queryByRole } = await renderWithThemeV2(
      <BetaDetailsList
        betas={[]}
        errors={null}
        isLoading={false}
        title="Available"
      />
    );
    expect(queryByRole('heading')?.textContent).toBe('Available');
  });

  it('should dispaly the circle progress component if the isLoading prop is set to true', async () => {
    const { queryByTestId: queryBetasList } = await renderWithThemeV2(
      <BetaDetailsList
        betas={[]}
        errors={null}
        isLoading={false}
        title="Available"
      />
    );
    expect(queryBetasList('circle-progress')).toBeFalsy();

    const { queryByTestId: queryLoadingBetasList } = await renderWithThemeV2(
      <BetaDetailsList betas={[]} errors={null} isLoading title="Available" />
    );
    expect(queryLoadingBetasList('circle-progress')).not.toBeFalsy();
  });

  it("should display the error state component with the error's reason as the error text", async () => {
    const error: APIError = {
      reason: 'You do not have permissions to access this resource.',
    };
    const betasList = await renderWithThemeV2(
      <BetaDetailsList
        betas={[]}
        errors={null}
        isLoading={false}
        title="Available"
      />
    );
    expect(betasList.queryByTestId('error-state')).toBeFalsy();
    expect(betasList.queryByText(error.reason)).toBeFalsy();

    const errorBetasList = await renderWithThemeV2(
      <BetaDetailsList
        betas={[]}
        errors={[error]}
        isLoading
        title="Available"
      />
    );
    expect(errorBetasList.queryByTestId('error-state')).not.toBeFalsy();
    expect(errorBetasList.queryByText(error.reason)).not.toBeFalsy();
  });
});
