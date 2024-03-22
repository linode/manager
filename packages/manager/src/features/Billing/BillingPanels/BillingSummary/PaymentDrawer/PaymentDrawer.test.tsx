import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { paymentFactory } from 'src/factories/billing';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import PaymentDrawer, { getMinimumPayment } from './PaymentDrawer';

const props = {
  onClose: vi.fn(),
  open: true,
  paymentMethods: [],
};

describe('Make a Payment Panel', () => {
  describe('getMinimumPayment helper method', () => {
    it('should return 5 if the balance due is 0', () => {
      expect(getMinimumPayment(0)).toBe('5.00');
    });

    it('should return the balance if the balance due is less than $5', () => {
      expect(getMinimumPayment(1.5)).toBe('1.50');
    });

    it('should return 5 if the balance due is less than 0', () => {
      expect(getMinimumPayment(-10.6)).toBe('5.00');
    });

    it('should return 5 if the balance due is greater than 5', () => {
      expect(getMinimumPayment(100000)).toBe('5.00');
    });
  });

  describe('Jailbreak warnings', () => {
    it.skip('should display a jailbreak warning if returned from the API', async () => {
      render(wrapWithTheme(<PaymentDrawer {...props} />));

      await waitForElementToBeRemoved(screen.getByTestId('loading-account'));

      await userEvent.click(screen.getByText(/pay now/i));
      await userEvent.click(screen.getByTestId('credit-card-submit'));
      expect(
        await screen.findByText(/your payment has been processed but/i)
      ).toBeInTheDocument();
    });

    it.skip('should not display a warning for a normal successful payment', async () => {
      server.use(
        http.post('*/account/payments', () => {
          return HttpResponse.json(paymentFactory.build());
        })
      );
      render(wrapWithTheme(<PaymentDrawer {...props} />));
      await userEvent.click(screen.getByText(/pay via credit card/i));
      await userEvent.click(screen.getByTestId('credit-card-submit'));
      expect(
        await screen.findByText(/submitted successfully/i)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/your payment has been processed but/i)
      ).not.toBeInTheDocument();
    });
  });
});
