/* eslint-disable sonarjs/no-duplicate-string */
const accountData = {
  company: 'company_name',
  email: 'test_email@linode.com',
  first_name: 'first name',
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
    'Kubernetes'
  ],
  city: 'philadelphia',
  country: 'US',
  credit_card: { last_four: '4000', expiry: '01/2090' },
  euuid: '7C1E3EE8-2F65-418A-95EF12E477XXXXXX',
  phone: '2154444444',
  state: 'Pennsylvania',
  tax_id: '1234567890',
  zip: '19109',
  active_promotions: []
};

const newAccountData = {
  company: 'New company_name',
  email: 'new_test_email@linode.com',
  first_name: 'new first name',
  last_name: 'New Last Name',
  address_1: 'new terrible address address for test',
  address_2: 'new Very long address for test Very long address for test Ve ',
  city: 'New Philadelphia',
  country: 'FR',
  phone: '6104444444',
  state: 'New Pennsylvania',
  tax_id: '9234567890',
  zip: '19108'
};

const mockGetAccountResponse = data => {
  cy.server();
  cy.route({
    method: 'GET',
    response: data,
    url: '*/account'
  }).as('getAccount');
};
const checkAccountContactDisplay = data => {
  cy.findByText('Billing Contact');
  cy.findByText(data['company']);
  cy.get('[data-qa-contact-name]');
  cy.findByText(data['first_name'], { exact: false });
  cy.findByText(data['last_name'], { exact: false });
  cy.contains(data['address_1'], { exact: false });
  cy.contains(data['address_2'], { exact: false });
  cy.findByText(data['state'], { exact: false });
  cy.findByText(data['zip'], { exact: false });
  cy.findByText(data['email']);
  cy.findByText(data['phone']);
};

describe('Billling Contact', () => {
  it('Check Billing Contact Form', () => {
    mockGetAccountResponse(accountData);
    cy.visitWithLogin('/account/billing');
    checkAccountContactDisplay(accountData);
  });
  it('Edit Contact Info', () => {
    mockGetAccountResponse(accountData);
    cy.route({
      url: '*/account',
      method: 'PUT'
    }).as('postAccount');
    cy.visitWithLogin('/account/billing');
    cy.get('[data-qa-contact-summary]').within(_contact => {
      cy.findByText('Edit').click();
    });
    // checking drawer is visible
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
    cy.findByLabelText('Zip / Postal Code')
      .should('be.visible')
      .click()
      .clear()
      .type(newAccountData['zip']);
    cy.findByLabelText('Phone')
      .should('be.visible')
      .click()
      .clear()
      .type(newAccountData['phone']);
    cy.get('[data-qa-contact-country]')
      .should('be.visible')
      .click()
      .type('France{enter}');

    cy.findByLabelText('State / Province')
      .should('be.visible')
      .click()
      .clear()
      .type(newAccountData['state']);
    cy.findByLabelText('Tax ID')
      .should('be.visible')
      .click()
      .clear()
      .type(newAccountData['tax_id']);

    cy.findByText('Save').click();

    cy.wait('@postAccount').then(xhr => {
      // no state in french address, so it should be removed
      expect(xhr.request.body).to.eql(newAccountData);
    });
  });
});
