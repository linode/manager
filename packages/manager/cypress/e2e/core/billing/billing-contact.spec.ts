import {
  mockGetAccount,
  mockUpdateAccount,
  mockUpdateAccountAgreements,
} from 'support/intercepts/account';
import { accountFactory } from 'src/factories/account';
import type { Account } from '@linode/api-v4';
import { ui } from 'support/ui';
import {
  TAX_ID_AGREEMENT_TEXT,
  TAX_ID_HELPER_TEXT,
} from 'src/features/Billing/constants';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { accountAgreementsFactory } from 'src/factories';

/* eslint-disable sonarjs/no-duplicate-string */
const accountData = accountFactory.build({
  company: 'company_name',
  email: 'test_email@linode.com',
  first_name: 'First name',
  last_name: 'Last Name',
  address_1: 'terrible address address for test',
  address_2: 'Very long address for test Very long address for test Ve ',
  balance: 0,
  balance_uninvoiced: 0,
  capabilities: [
    'Linodes',
    'NodeBalancers',
    'Block Storage',
    'Object Storage',
    'Kubernetes',
  ],
  city: 'philadelphia',
  country: 'US',
  credit_card: { last_four: '4000', expiry: '01/2090' },
  euuid: '7C1E3EE8-2F65-418A-95EF12E477XXXXXX',
  phone: '2154444444',
  state: 'Pennsylvania',
  tax_id: '1234567890',
  zip: '19109',
  active_promotions: [],
});

const newAccountData = accountFactory.build({
  company: 'New company_name',
  email: 'new_test_email@linode.com',
  first_name: 'NewFirstName',
  last_name: 'New Last Name',
  address_1: 'new terrible address address for test',
  address_2: 'new Very long address for test Very long address for test Ve ',
  city: 'New Philadelphia',
  country: 'FR',
  phone: '6104444444',
  state: 'Pennsylvania',
  tax_id: '9234567890',
  zip: '19108',
});

const newAccountAgreement = accountAgreementsFactory.build({
  billing_agreement: true,
});

const checkAccountContactDisplay = (accountInfo: Account) => {
  cy.findByText('Billing Contact').should('be.visible');
  cy.findByText(accountInfo['company']).should('be.visible');
  cy.get('[data-qa-contact-name]').should('be.visible');
  cy.findByText(accountInfo['first_name'], { exact: false });
  cy.findByText(accountInfo['last_name'], { exact: false });
  cy.contains(accountInfo['address_1']);
  cy.contains(accountInfo['address_2']);
  cy.findByText(accountInfo['state'], { exact: false });
  cy.findByText(accountInfo['zip'], { exact: false });
  cy.get('[data-qa-contact-email="true"]').within(() => {
    cy.findByText(accountInfo['email']);
  });
  cy.findByText(accountInfo['phone']);
};

describe('Billing Contact', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      taxId: {
        enabled: true,
      },
    });
  });
  it('Mask Contact Info', () => {
    mockGetUserPreferences({ maskSensitiveData: true }).as(
      'getUserPreferences'
    );
    mockGetAccount(accountData).as('getAccount');
    cy.visitWithLogin('/account/billing');

    cy.contains('This data is sensitive and hidden for privacy.');

    // Confirm edit button and contact info is hidden when setting is enabled.
    cy.findByText('Edit').should('not.exist');
    cy.get('[data-qa-contact-name]').should('not.exist');

    cy.findByRole('button', { name: 'Show' }).should('be.visible').click();

    // Confirm edit button and contact info is visible when setting is disabled.
    cy.findByText('Edit').should('be.visible');
    cy.get('[data-qa-contact-name]').should('be.visible');

    cy.findByRole('button', { name: 'Hide' }).should('be.visible').click();
  });
  it('Edit Contact Info', () => {
    mockGetUserPreferences({ maskSensitiveData: false }).as(
      'getUserPreferences'
    );
    // mock the user's account data and confirm that it is displayed correctly upon page load
    mockGetAccount(accountData).as('getAccount');
    cy.visitWithLogin('/account/billing');

    // edit the billing contact information
    mockUpdateAccount(newAccountData).as('updateAccount');
    cy.get('[data-qa-contact-summary]').within((_contact) => {
      checkAccountContactDisplay(accountData);
      cy.findByText('Edit').should('be.visible').click();
    });

    ui.drawer
      .findByTitle('Edit Billing Contact Info')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('First Name')
          .should('be.visible')
          .click()
          .clear()
          .type(newAccountData['first_name']);
        cy.findByLabelText('Last Name')
          .should('be.visible')
          .click()
          .clear()
          .type(newAccountData['last_name']);
        cy.findByLabelText('Company Name')
          .should('be.visible')
          .click()
          .clear()
          .type(newAccountData['company']);
        cy.findByLabelText('Address')
          .should('be.visible')
          .click()
          .clear()
          .type(newAccountData['address_1']);
        cy.findByLabelText('Address 2')
          .should('be.visible')
          .click()
          .clear()
          .type(newAccountData['address_2']);
        cy.findByLabelText('Email (required)')
          .should('be.visible')
          .click()
          .clear()
          .type(newAccountData['email']);
        cy.findByLabelText('City')
          .should('be.visible')
          .click()
          .clear()
          .type(newAccountData['city']);
        cy.findByLabelText('Postal Code')
          .should('be.visible')
          .click()
          .clear()
          .type(newAccountData['zip']);
        cy.findByLabelText('Phone')
          .should('be.visible')
          .click()
          .clear()
          .type(newAccountData['phone']);
        ui.autocomplete
          .findByLabel('State')
          .should('be.visible')
          .click()
          .type(`${newAccountData['state']}`);
        ui.autocompletePopper
          .findByTitle(newAccountData['state'])
          .should('be.visible')
          .click();
        cy.findByLabelText('Tax ID')
          .should('be.visible')
          .click()
          .clear()
          .type(newAccountData['tax_id']);
        cy.findByText(TAX_ID_HELPER_TEXT).should('not.exist');
        cy.get('[data-qa-save-contact-info="true"]')
          .click()
          .then(() => {
            cy.wait('@updateAccount').then((xhr) => {
              expect(xhr.response?.body).to.eql(newAccountData);
            });
          });
      });

    // check the page updates to reflect the edits
    cy.get('[data-qa-contact-summary]').within(() => {
      checkAccountContactDisplay(newAccountData);
    });
  });

  it('Edit Contact Info: Tax ID Agreement', () => {
    mockGetUserPreferences({ maskSensitiveData: false }).as(
      'getUserPreferences'
    );
    // mock the user's account data and confirm that it is displayed correctly upon page load
    mockGetAccount(accountData).as('getAccount');
    cy.visitWithLogin('/account/billing');

    // edit the billing contact information
    mockUpdateAccount(newAccountData).as('updateAccount');
    mockUpdateAccountAgreements(newAccountAgreement).as(
      'updateAccountAgreements'
    );
    cy.get('[data-qa-contact-summary]').within((_contact) => {
      checkAccountContactDisplay(accountData);
      cy.findByText('Edit').should('be.visible').click();
    });

    ui.drawer
      .findByTitle('Edit Billing Contact Info')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('City')
          .should('be.visible')
          .click()
          .clear()
          .type(newAccountData['city']);
        cy.findByLabelText('Postal Code')
          .should('be.visible')
          .click()
          .clear()
          .type(newAccountData['zip']);
        ui.autocomplete
          .findByLabel('Country')
          .should('be.visible')
          .click()
          .type('Afghanistan');
        ui.autocompletePopper
          .findByTitle('Afghanistan')
          .should('be.visible')
          .click();
        cy.findByLabelText('Tax ID')
          .should('be.visible')
          .click()
          .clear()
          .type(newAccountData['tax_id']);
        cy.findByText(TAX_ID_HELPER_TEXT).should('be.visible');
        cy.findByText(TAX_ID_AGREEMENT_TEXT)
          .scrollIntoView()
          .should('be.visible');
        cy.findByText('Akamai Privacy Statement.').should('be.visible');
        cy.get('[data-qa-save-contact-info="true"]').should('be.disabled');
        cy.get('[data-testid="tax-id-checkbox"]').click();
        cy.get('[data-qa-save-contact-info="true"]')
          .should('be.enabled')
          .click()
          .then(() => {
            cy.wait('@updateAccount').then((xhr) => {
              expect(xhr.response?.body).to.eql(newAccountData);
            });
            cy.wait('@updateAccountAgreements').then((xhr) => {
              expect(xhr.response?.body).to.eql(newAccountAgreement);
            });
          });
      });

    // check the page updates to reflect the edits
    cy.get('[data-qa-contact-summary]').within(() => {
      checkAccountContactDisplay(newAccountData);
    });
  });
});
