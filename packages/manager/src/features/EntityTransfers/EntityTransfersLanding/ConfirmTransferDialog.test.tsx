import { screen } from '@testing-library/react';
import { DateTime } from 'luxon';
import * as React from 'react';
import { entityTransferFactory } from 'src/factories/entityTransfers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';
import ConfirmTransferDialog, {
  getTimeRemaining,
  Props,
} from './ConfirmTransferDialog';

const props: Props = {
  open: true,
  onClose: jest.fn(),
  token: 'blahblah',
};

describe('Accept Entity Transfer confirmation dialog', () => {
  describe('Component', () => {
    it("should show an error if the token being confirmed is from the current user's account", async () => {
      server.use(
        rest.get('*/account/entity-transfers/:transferId', (req, res, ctx) => {
          const transfer = entityTransferFactory.build({
            is_sender: true,
          });
          return res(ctx.json(transfer));
        })
      );
      renderWithTheme(<ConfirmTransferDialog {...props} />);
      expect(await screen.findByTestId('error-state')).toBeInTheDocument();
    });

    it('should render a list of entity types included in the token', async () => {
      server.use(
        rest.get('*/account/entity-transfers/:transferId', (req, res, ctx) => {
          const transfer = entityTransferFactory.build({
            is_sender: false,
            entities: {
              linodes: [0, 1, 2, 3],
              domains: [1, 2, 3, 4, 5],
            } as any, // Domains aren't allowed yet
          });
          return res(ctx.json(transfer));
        })
      );
      renderWithTheme(<ConfirmTransferDialog {...props} />);
      expect(await screen.findByText(/4 Linodes/)).toBeInTheDocument();
      expect(await screen.findByText(/5 Domains/)).toBeInTheDocument();
    });
  });

  describe('getTimeRemaining helper function', () => {
    it('should return a large time in hours remaining', () => {
      expect(
        getTimeRemaining(DateTime.local().plus({ hours: 23 }).toISO())
      ).toMatch(/in 23 hours/);
    });

    it('should return smaller time in minutes remaining', () => {
      expect(
        getTimeRemaining(
          DateTime.local().plus({ minutes: 8, seconds: 30 }).toISO()
        )
      ).toMatch(/in 8 minutes/);
    });

    it('should return negative time with an expired message', () => {
      expect(
        getTimeRemaining(DateTime.local().minus({ hours: 1 }).toISO())
      ).toMatch(/expired/i);
    });
  });
});
