import { authenticate } from 'support/api/authentication';
import { createDomain } from 'support/api/domains';
import { interceptCreateDomainRecord } from 'support/intercepts/domains';
import { createDomainRecords } from 'support/constants/domains';

const createCaaRecord = (
  name: string,
  tag: string,
  value: string,
  ttl: string
) => {
  cy.findByText('Add a CAA Record').click();

  // Fill in the form fields
  cy.get('input#name').type(name);
  cy.get('[data-qa-autocomplete="Tag"]').click();
  cy.get('li').contains(tag).click();
  cy.get('input#value').type(value);
  cy.get('[data-qa-autocomplete="TTL"]').click();
  cy.get('li').contains(ttl).click();

  // Save the record
  cy.get('button[data-testid="save"]').click();
  cy.wait('@apiCreateRecord');
};

// Reusable function to edit a CAA record
const editCaaRecord = (name: string, newValue: string) => {
  cy.get(`#action-menu-for-record-${name}-button`).click();
  cy.get('li').contains('Edit').click();

  // Edit the value field
  cy.get('input#value').clear().type(newValue);
  cy.get('button[data-testid="save"]').click();
};

// Reusable function to verify record details in the table
const verifyRecordInTable = (
  name: string,
  tag: string,
  value: string,
  ttl: string
) => {
  cy.get('[aria-label="List of Domains CAA Record"]') // Target table by aria-label
    .should('contain', name)
    .and('contain', tag)
    .and('contain', value)
    .and('contain', ttl);
};

authenticate();

beforeEach(() => {
  cy.tag('method:e2e');
  createDomain().then((domain) => {
    // intercept create API record request
    interceptCreateDomainRecord().as('apiCreateRecord');
    const url = `/domains/${domain.id}`;
    cy.visitWithLogin(url);
    cy.url().should('contain', url);
  });
});

describe('Creates Domains records with Form', () => {
  it('Adds domain records to a newly created Domain', () => {
    createDomainRecords().forEach((rec) => {
      cy.findByText(rec.name).click();
      rec.fields.forEach((field) => {
        cy.get(field.name).type(field.value);
      });
      cy.findByText('Save').click();
      cy.wait('@apiCreateRecord').its('response.statusCode').should('eq', 200);
      cy.get(`[aria-label="${rec.tableAriaLabel}"]`).within((_table) => {
        rec.fields.forEach((field) => {
          if (field.skipCheck) {
            return;
          }
          cy.findByText(field.value, { exact: !field.approximate });
        });
      });
    });
  });
});

describe('Creates and Validates Domain CAA Records', () => {
  it('Validates domain record are editable for "iodef" tag', () => {
    createCaaRecord(
      'securitytest',
      'iodef',
      'mailto:security@linodian.com',
      '5 minutes'
    );

    // Verify the initial record is in the table
    verifyRecordInTable(
      'securitytest',
      'iodef',
      'mailto:security@linodian.com',
      '5 minutes'
    );

    // Edit the record with invalid email and validate form validation
    editCaaRecord('securitytest', 'invalid-email-format');
    cy.get('p[role="alert"][data-qa-textfield-error-text="Value"]')
      .should('exist')
      .and('have.text', 'You have entered an invalid target');

    // Cancel the edit and verify no change in the table
    cy.get('[data-testid="cancel"]').click();
    cy.get('table').should('contain', 'mailto:security@linodian.com');

    // Edit again with a valid email and verify the updated record
    editCaaRecord('securitytest', 'mailto:secdef@linodian.com');
    cy.get('table').should('contain', 'mailto:secdef@linodian.com');
  });
});
