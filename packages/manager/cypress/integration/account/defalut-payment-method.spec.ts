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

const getPaymentMethodDataDefaultGpay = {
  data: [
    {
      id: 420330,
      type: 'credit_card',
      is_default: false,
      created: '2021-07-27T14:37:43',
      data: { card_type: 'AMEX', last_four: '2222', expiry: '07/2025' },
    },
    {
      id: 434357,
      type: 'google_pay',
      is_default: true,
      created: '2021-08-04T18:29:01',
      data: { card_type: 'Visa', last_four: '2045', expiry: '07/2025' },
    },
  ],
  page: 1,
  pages: 1,
  results: 2,
};

const getPaymentMethodDataDefaultCard = {
  data: [
    {
      id: 420330,
      type: 'credit_card',
      is_default: true,
      created: '2021-07-27T14:37:43',
      data: { card_type: 'AMEX', last_four: '2222', expiry: '07/2025' },
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

const getPaymentURL = '*/account/payment-methods*';

describe('Default Payment Method', () => {
  beforeEach(() => {
    cy.visitWithLogin('/account/billing');
  });

  it('makes google pay default', () => {
    interceptOnce('GET', getPaymentURL, getPaymentMethodDataDefaultCard).as(
      'getPaymentMethod'
    );
    cy.intercept(
      'POST',
      `*/account/payment-methods/${getPaymentMethodDataDefaultCard.data[1].id}/make-default`,
      (req) => {
        req.reply(getPaymentMethodDataDefaultCard);
      }
    ).as('changeDefault');
    cy.wait('@getPaymentMethod');
    cy.get(
      `[aria-label="Action menu for card ending in ${getPaymentMethodDataDefaultCard.data[1].data.last_four}"]`
    )
      .invoke('attr', 'aria-controls')
      .then(($id) => {
        if ($id) {
          getClick(
            `[aria-label="Action menu for card ending in ${getPaymentMethodDataDefaultCard.data[1].data.last_four}"]`
          );
        }
        cy.intercept('GET', getPaymentURL, (req) => {
          req.reply(getPaymentMethodDataDefaultGpay);
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
    interceptOnce('GET', getPaymentURL, getPaymentMethodDataDefaultGpay).as(
      'getPaymentMethod'
    );
    cy.intercept(
      'POST',
      `*/account/payment-methods/${getPaymentMethodDataDefaultGpay.data[0].id}/make-default`,
      (req) => {
        req.reply(getPaymentMethodDataDefaultCard);
      }
    ).as('changeDefault');
    cy.wait('@getPaymentMethod');
    cy.get(
      `[aria-label="Action menu for card ending in ${getPaymentMethodDataDefaultGpay.data[0].data.last_four}"]`
    )
      .invoke('attr', 'aria-controls')
      .then(($id) => {
        if ($id) {
          getClick(
            `[aria-label="Action menu for card ending in ${getPaymentMethodDataDefaultCard.data[0].data.last_four}"]`
          );
        }
        cy.intercept('GET', getPaymentURL, (req) => {
          req.reply(getPaymentMethodDataDefaultCard);
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
