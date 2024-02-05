import { mockGetPaymentMethods } from 'support/intercepts/account';
import { PaymentMethod, CreditCardData } from '@linode/api-v4';
import { ui } from 'support/ui';

const mockPaymentMethods: PaymentMethod[] = [
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
];

const mockPaymentMethodsData = mockPaymentMethods.map(
  (paymentMethod): CreditCardData => {
    return paymentMethod.data as CreditCardData;
  }
);

const mockPaymentMethodsExpired: PaymentMethod[] = [
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
];

const pastDueExpiry = 'Expired 07/20';
const braintreeURL = 'https://client-analytics.braintreegateway.com/*';

describe('Google Pay', () => {
  it('adds google pay method', () => {
    cy.intercept(braintreeURL).as('braintree');
    mockGetPaymentMethods(mockPaymentMethods).as('getPaymentMethods');
    cy.visitWithLogin('/account/billing');
    cy.wait('@getPaymentMethods');
    cy.findByText('Add Payment Method').should('be.visible').click();
    cy.get('[data-qa-button="gpayChip"]').should('be.visible').click();
    cy.wait('@braintree');
  });

  it('tests make payment flow - google pay', () => {
    cy.intercept(braintreeURL).as('braintree');
    mockGetPaymentMethods(mockPaymentMethods).as('getPaymentMethods');
    cy.visitWithLogin('/account/billing');
    cy.wait('@getPaymentMethods');

    ui.actionMenu
      .findByTitle(
        `Action menu for card ending in ${mockPaymentMethodsData[1].last_four}`
      )
      .should('be.visible')
      .click();

    ui.actionMenuItem
      .findByTitle('Make a Payment')
      .should('be.visible')
      .click();

    ui.drawer
      .findByTitle('Make a Payment')
      .should('be.visible')
      .within(() => {
        cy.contains(
          `${mockPaymentMethodsData[0].card_type} ****${mockPaymentMethodsData[0].last_four}`
        ).should('be.visible');
        cy.contains(
          `${mockPaymentMethodsData[1].card_type} ****${mockPaymentMethodsData[1].last_four}`
        ).should('be.visible');
        cy.get('[data-qa-button="gpayButton"]').click();
      });

    cy.wait('@braintree');
  });

  it('tests payment flow with expired card - google pay', () => {
    cy.intercept(braintreeURL).as('braintree');
    mockGetPaymentMethods(mockPaymentMethodsExpired).as('getPaymentMethods');
    cy.visitWithLogin('/account/billing');
    cy.wait('@getPaymentMethods');

    cy.get('[data-qa-payment-row="google_pay"]').within(() => {
      cy.get('[data-qa-contact-cc-exp-date="true"]')
        .should('be.visible')
        .within(() => {
          cy.contains(pastDueExpiry).should('be.visible');
        });
    });
  });

  // TODO: add test with only gpay, no cc
});
