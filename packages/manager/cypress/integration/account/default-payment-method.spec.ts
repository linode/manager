import { paymentMethodFactory } from '@src/factories/accountPayment';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import { fbtVisible, getClick } from 'cypress/support/helpers';

const interceptOnce = (method, url, response) => {
  let count = 0;
  return cy.intercept(method, url, (req) => {
    count += 1;
    if (count < 2) {
      req.reply(response);
    }
  });
};

const paymentMethodGpay = (isDefault) => {
  return paymentMethodFactory.build({
    id: 434357,
    type: 'google_pay',
    ...isDefault,
    data: { card_type: 'Visa', last_four: '2045', expiry: '07/2025' },
  });
};

const paymentMethodCC = (isDefault) => {
  return paymentMethodFactory.build({
    id: 420330,
    type: 'credit_card',
    ...isDefault,
    data: {
      card_type: 'American Express',
      last_four: '2222',
      expiry: '07/2025',
    },
  });
};

const gpayDefault = makeResourcePage([
  paymentMethodCC({ is_default: false }),
  paymentMethodGpay({ is_default: true }),
]);
const ccDefault = makeResourcePage([
  paymentMethodCC({ is_default: true }),
  paymentMethodGpay({ is_default: false }),
]);

const gpayIdCcDefault = ccDefault.data[1].id;
const ccIdGpayDefault = gpayDefault.data[0].id;

const gpayLastFourCcDefault = ccDefault.data[1].data.last_four;
const ccLastFourGpayDefault = gpayDefault.data[0].data.last_four;

const getPaymentURL = '*/account/payment-methods*';

describe('Default Payment Method', () => {
  beforeEach(() => {
    cy.visitWithLogin('/account/billing');
  });

  it('makes google pay default', () => {
    interceptOnce('GET', getPaymentURL, ccDefault).as('getPaymentMethod');
    cy.intercept(
      'POST',
      `*/account/payment-methods/${gpayIdCcDefault}/make-default`,
      (req) => {
        req.reply({});
      }
    ).as('changeDefault');
    cy.wait('@getPaymentMethod');
    cy.get(
      `[aria-label="Action menu for card ending in ${gpayLastFourCcDefault}"]`
    )
      .invoke('attr', 'aria-controls')
      .then(($id) => {
        if ($id) {
          getClick(
            `[aria-label="Action menu for card ending in ${gpayLastFourCcDefault}"]`
          );
        }
        cy.intercept('GET', getPaymentURL, (req) => {
          req.reply(gpayDefault);
        }).as('getPaymentMethodAfter');
        getClick(
          `[id="option-1--${$id}"][data-qa-action-menu-item="Make Default"]`
        );
      });
    cy.wait('@changeDefault');
    cy.wait('@getPaymentMethodAfter');
    cy.get('[data-qa-payment-row=google_pay]').within(() => {
      fbtVisible('DEFAULT');
    });
  });

  it('makes cc default', () => {
    interceptOnce('GET', getPaymentURL, gpayDefault).as('getPaymentMethod');
    cy.intercept(
      'POST',
      `*/account/payment-methods/${ccIdGpayDefault}/make-default`,
      (req) => {
        req.reply({});
      }
    ).as('changeDefault');
    cy.wait('@getPaymentMethod');
    cy.get(
      `[aria-label="Action menu for card ending in ${ccLastFourGpayDefault}"]`
    )
      .invoke('attr', 'aria-controls')
      .then(($id) => {
        if ($id) {
          getClick(
            `[aria-label="Action menu for card ending in ${ccLastFourGpayDefault}"]`
          );
        }
        cy.intercept('GET', getPaymentURL, (req) => {
          req.reply(ccDefault);
        }).as('getPaymentMethodAfter');
        getClick(
          `[id="option-1--${$id}"][data-qa-action-menu-item="Make Default"]`
        );
      });
    cy.wait('@changeDefault');
    cy.wait('@getPaymentMethodAfter');
    cy.get('[data-qa-payment-row=credit_card]').within(() => {
      fbtVisible('DEFAULT');
    });
  });
});
