import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { configFactory } from 'src/factories';
import { accountFactory } from 'src/factories/account';
import { rest, server } from 'src/mocks/testServer';
import { queryClientFactory } from 'src/queries/base';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { padList } from './LinodeConfigDialog';
import { LinodeConfigDialog } from './LinodeConfigDialog';

const queryClient = queryClientFactory();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

const primaryInterfaceDropdownTestId = 'primary-interface-dropdown';

describe('LinodeConfigDialog', () => {
  describe('padInterface helper method', () => {
    it('should return a list of the correct length unchanged', () => {
      expect(padList([1, 2, 3], 0, 3)).toEqual([1, 2, 3]);
    });

    it('should add the padder until the specified length is reached', () => {
      expect(padList([1], 0, 5)).toEqual([1, 0, 0, 0, 0]);
    });

    it('should return a list longer than the limit unchanged', () => {
      expect(padList([1, 2, 3, 4, 5], 0, 2)).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('Primary Interface (Default Route) dropdown', () => {
    it('should not display if the VPC feature flag is off and the account capabilities do not include VPC', async () => {
      const account = accountFactory.build({
        capabilities: [],
      });

      const config = configFactory.build();

      server.use(
        rest.get('*/account', (req, res, ctx) => {
          return res(ctx.json(account));
        })
      );

      const { queryByTestId } = renderWithTheme(
        <LinodeConfigDialog
          config={config}
          isReadOnly={false}
          linodeId={1}
          onClose={jest.fn()}
          open={true}
        />,
        {
          flags: { vpc: false },
        }
      );

      await waitFor(() => {
        expect(
          queryByTestId(primaryInterfaceDropdownTestId)
        ).not.toBeInTheDocument();
      });
    });
  });
});
