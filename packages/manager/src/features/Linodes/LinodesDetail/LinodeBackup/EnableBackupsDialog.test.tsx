import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { EnableBackupsDialog } from './EnableBackupsDialog';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';
import { typeFactory } from 'src/factories/types';
import { linodeFactory } from 'src/factories';

const queryMocks = vi.hoisted(() => ({
  useLinodeQuery: vi.fn().mockReturnValue({
    data: undefined,
  }),
  useTypeQuery: vi.fn().mockReturnValue({
    data: undefined,
  }),
}));

vi.mock('src/queries/linodes/linodes', async () => {
  const actual = await vi.importActual('src/queries/linodes/linodes');
  return {
    ...actual,
    useLinodeQuery: queryMocks.useLinodeQuery,
  };
});

vi.mock('src/queries/types', async () => {
  const actual = await vi.importActual('src/queries/types');
  return {
    ...actual,
    useTypeQuery: queryMocks.useTypeQuery,
  };
});

describe('EnableBackupsDialog component', () => {
  beforeEach(() => {
    queryMocks.useTypeQuery.mockReturnValue({
      data: typeFactory.build({
        id: 'mock-linode-type',
        label: 'Mock Linode Type',
        addons: {
          backups: {
            price: {
              hourly: 0.004,
              monthly: 2.5,
            },
            region_prices: [
              {
                hourly: 0,
                id: 'es-mad',
                monthly: 0,
              },
            ],
          },
        },
      }),
    });
  });

  it('Displays the monthly backup price', async () => {
    queryMocks.useLinodeQuery.mockReturnValue({
      data: linodeFactory.build({
        id: 1,
        label: 'Mock Linode',
        type: 'mock-linode-type',
        region: 'us-east',
      }),
    });

    const { findByText } = renderWithTheme(
      <EnableBackupsDialog linodeId={1} onClose={vi.fn()} open={true} />
    );

    // Confirm that the user is warned that they will be billed, and that the correct
    // price is displayed.
    expect(
      await findByText(
        /Are you sure you want to enable backups on this Linode\?.*/
      )
    ).toHaveTextContent(/This will add .* to your monthly bill/);
    expect(await findByText('$2.50')).toBeVisible();
  });

  it('Displays the monthly backup price when the price is $0', async () => {
    queryMocks.useLinodeQuery.mockReturnValue({
      data: linodeFactory.build({
        id: 1,
        label: 'Mock Linode',
        type: 'mock-linode-type',
        region: 'es-mad',
      }),
    });

    const { getByTestId, findByText, queryByText } = renderWithTheme(
      <EnableBackupsDialog linodeId={1} onClose={vi.fn()} open={true} />
    );

    // Confirm that the user is warned that they will be billed, and that $0.00
    // is shown.
    expect(
      await findByText(
        /Are you sure you want to enable backups on this Linode\?.*/
      )
    ).toHaveTextContent(/This will add .* to your monthly bill/);
    expect(await findByText('$0.00')).toBeVisible();

    // Confirm that error message is not present.
    expect(queryByText(PRICES_RELOAD_ERROR_NOTICE_TEXT)).toBeNull();

    // Confirm that "Enable Backups" button is enabled.
    expect(getByTestId('confirm-enable-backups')).toBeEnabled();
  });

  it('Displays an error when backup price cannot be determined', async () => {
    queryMocks.useTypeQuery.mockReturnValue({
      data: undefined,
    });

    queryMocks.useLinodeQuery.mockReturnValue({
      data: linodeFactory.build({
        id: 1,
        label: 'Mock Linode',
        type: 'mock-linode-type',
        region: 'es-mad',
      }),
    });

    const { getByTestId, findByText } = renderWithTheme(
      <EnableBackupsDialog linodeId={1} onClose={vi.fn()} open={true} />
    );

    // Confirm that error message is not present.
    expect(await findByText(PRICES_RELOAD_ERROR_NOTICE_TEXT)).toBeVisible();

    // Confirm that "Enable Backups" button is disabled.
    expect(getByTestId('confirm-enable-backups')).toBeDisabled();
  });
});
