import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { paymentFactory } from 'src/factories/billing';
import { rest, server } from 'src/mocks/testServer';
import PaymentDrawer, { getMinimumPayment } from './PaymentDrawer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { isAllowedUSDAmount, shouldEnablePaypalButton } from './Paypal';

const props = {
  open: true,
  onClose: jest.fn(),
  accountLoading: false,
  balance: 50,
  lastFour: '9999',
  expiry: '',
};

describe('Make a Payment Panel', () => {
  it('should return false for invalid USD amount', () => {
    expect(isAllowedUSDAmount(0)).toBeFalsy();
    expect(isAllowedUSDAmount(10001)).toBeFalsy();
  });

  it('should return true for valid USD amount', () => {
    expect(isAllowedUSDAmount(5)).toBeTruthy();
    expect(isAllowedUSDAmount(4585)).toBeTruthy();
  });

  it('should disable paypal button when invalid USD amount or no input', () => {
    expect(shouldEnablePaypalButton(undefined)).toBeFalsy();
    expect(shouldEnablePaypalButton(1)).toBeFalsy();
    expect(shouldEnablePaypalButton(10001)).toBeFalsy();
  });

  it('should enable paypal button when valid USD amount', () => {
    expect(shouldEnablePaypalButton(10000)).toBeTruthy();
    expect(shouldEnablePaypalButton(15)).toBeTruthy();
    expect(shouldEnablePaypalButton(5)).toBeTruthy();
  });

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
    it('should display a jailbreak warning if returned from the API', async () => {
      render(wrapWithTheme(<PaymentDrawer {...props} />));
      userEvent.click(screen.getByText(/pay now/i));
      userEvent.click(screen.getByTestId('credit-card-submit'));
      expect(
        await screen.findByText(/your payment has been processed but/i)
      ).toBeInTheDocument();
    });

    it('should not display a warning for a normal successful payment', async () => {
      server.use(
        rest.post('*/account/payments', (req, res, ctx) => {
          return res(ctx.json(paymentFactory.build()));
        })
      );
      render(wrapWithTheme(<PaymentDrawer {...props} />));
      userEvent.click(screen.getByText(/pay now/i));
      userEvent.click(screen.getByTestId('credit-card-submit'));
      expect(
        await screen.findByText(/submitted successfully/i)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/your payment has been processed but/i)
      ).not.toBeInTheDocument();
    });
  });
});
