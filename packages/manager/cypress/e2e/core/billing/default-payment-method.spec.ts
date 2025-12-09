import { paymentMethodFactory } from '@src/factories/accountPayment';
import {
  mockGetPaymentMethods,
  mockSetDefaultPaymentMethod,
} from 'support/intercepts/account';
import { ui } from 'support/ui';

import type { CreditCardData } from '@linode/api-v4';

const paymentMethodGpay = (isDefault: boolean) => {
  return paymentMethodFactory.build({
    data: { card_type: 'Visa', expiry: '07/2025', last_four: '2045' },
    id: 434357,
    is_default: isDefault,
    type: 'google_pay',
  });
};

const paymentMethodCC = (isDefault: boolean) => {
  return paymentMethodFactory.build({
    data: {
      card_type: 'American Express',
      expiry: '07/2025',
      last_four: '2222',
    },
    id: 420330,
    is_default: isDefault,
    type: 'credit_card',
  });
};

const gpayDefault = [paymentMethodCC(false), paymentMethodGpay(true)];

const ccDefault = [paymentMethodCC(true), paymentMethodGpay(false)];

const gpayIdCcDefault = ccDefault[1].id;
const ccIdGpayDefault = gpayDefault[0].id;

const gpayLastFourCcDefault = (ccDefault[1].data as CreditCardData).last_four;
const ccLastFourGpayDefault = (gpayDefault[0].data as CreditCardData).last_four;

describe('Default Payment Method', () => {
  it('makes google pay default', () => {
    mockGetPaymentMethods(ccDefault).as('getPaymentMethods');
    mockSetDefaultPaymentMethod(gpayIdCcDefault).as('changeDefault');
    cy.visitWithLogin('/account/billing');
    cy.wait('@getPaymentMethods');

    ui.actionMenu
      .findByTitle(`Action menu for card ending in ${gpayLastFourCcDefault}`)
      .should('be.visible')
      .click();

    ui.actionMenuItem.findByTitle('Make Default').should('be.visible').click();

    cy.wait(['@changeDefault']);
    cy.get('[data-qa-payment-row=google_pay]').within(() => {
      cy.findByText('DEFAULT').should('be.visible');
    });
  });

  it('makes cc default', () => {
    mockGetPaymentMethods(gpayDefault).as('getPaymentMethods');
    mockSetDefaultPaymentMethod(ccIdGpayDefault).as('changeDefault');
    cy.visitWithLogin('/account/billing');
    cy.wait('@getPaymentMethods');

    ui.actionMenu
      .findByTitle(`Action menu for card ending in ${ccLastFourGpayDefault}`)
      .should('be.visible')
      .click();

    ui.actionMenuItem.findByTitle('Make Default').should('be.visible').click();

    cy.wait(['@changeDefault']);
    cy.get('[data-qa-payment-row=credit_card]').within(() => {
      cy.findByText('DEFAULT').should('be.visible');
    });
  });
});
