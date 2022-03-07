/* eslint-disable sonarjs/no-duplicate-string */
import {
  containsVisible,
  fbtClick,
  getClick,
  getVisible,
} from 'cypress/support/helpers';

const getPaymentMethodDataWithGpay = {
  data: [
    {
      id: 420330,
      type: 'credit_card',
      is_default: true,
      created: '2021-07-27T14:37:43',
      data: {
        card_type: 'American Express',
        last_four: '2222',
        expiry: '07/2025',
      },
    },
    {
      id: 434357,
      type: 'google_pay',
      is_default: false,
      created: '2021-08-04T18:29:01',
      data: { card_type: 'Visa', last_four: '2045', expiry: '07/2025' },
    },
  ],
  page: 1,
  pages: 1,
  results: 2,
};

const getPaymentMethodDataWithGpayExpired = {
  data: [
    {
      id: 420330,
      type: 'credit_card',
      is_default: true,
      created: '2021-07-27T14:37:43',
      data: {
        card_type: 'American Express',
        last_four: '2222',
        expiry: '07/2025',
      },
    },
    {
      id: 434357,
      type: 'google_pay',
      is_default: false,
      created: '2021-08-04T18:29:01',
      data: { card_type: 'Visa', last_four: '2045', expiry: '07/2020' },
    },
  ],
  page: 1,
  pages: 1,
  results: 2,
};

const pastDueExpiry = 'Expired 07/20';
const getPaymentURL = '*/account/payment-methods*';
const braintreeURL = 'https://client-analytics.braintreegateway.com/*';

describe('Google Pay', () => {
  beforeEach(() => {
    cy.visitWithLogin('/account/billing');
  });

  it('adds google pay method', () => {
    cy.intercept(braintreeURL).as('braintree');
    cy.intercept('GET', getPaymentURL, (req) => {
      req.reply(getPaymentMethodDataWithGpay);
    }).as('getPaymentMethod');
    cy.wait('@getPaymentMethod');
    fbtClick('Add Payment Method');
    getClick('[data-qa-button="gpayChip"]');
    cy.wait('@braintree');
  });

  it('tests make payment flow - google pay', () => {
    cy.intercept(braintreeURL).as('braintree');
    cy.intercept('GET', getPaymentURL, (req) => {
      req.reply(getPaymentMethodDataWithGpay);
    }).as('getPaymentMethod');
    cy.wait('@getPaymentMethod');
    cy.get(
      `[aria-label="Action menu for card ending in ${getPaymentMethodDataWithGpay.data[1].data.last_four}"]`
    )
      .invoke('attr', 'aria-controls')
      .then(($id) => {
        if ($id) {
          getClick(
            `[aria-label="Action menu for card ending in ${getPaymentMethodDataWithGpay.data[1].data.last_four}"]`
          );
        }
        getClick(
          `[id="option-0--${$id}"][data-qa-action-menu-item="Make a Payment"]`
        );
      });
    cy.get('[data-testid="drawer"]').within(() => {
      getVisible('[data-qa-drawer-title="Make a Payment"]');
      containsVisible(
        `${getPaymentMethodDataWithGpay.data[0].data.card_type} ****${getPaymentMethodDataWithGpay.data[0].data.last_four}`
      );
      containsVisible(
        `${getPaymentMethodDataWithGpay.data[1].data.card_type} ****${getPaymentMethodDataWithGpay.data[1].data.last_four}`
      );
      getClick('[data-qa-button="gpayButton"]');
    });

    cy.wait('@braintree');
  });

  it('tests payment flow with expired card - google pay', () => {
    cy.intercept(braintreeURL).as('braintree');
    cy.intercept('GET', getPaymentURL, (req) => {
      req.reply(getPaymentMethodDataWithGpayExpired);
    }).as('getPaymentMethod');
    getVisible('[data-qa-contact-cc-exp-date="true"]').within(() => {
      containsVisible(pastDueExpiry);
    });
  });

  // TODO: add test with only gpay, no cc
});
