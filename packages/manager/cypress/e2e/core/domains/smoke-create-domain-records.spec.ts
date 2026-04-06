import { authenticate } from 'support/api/authentication';
import { createDomain } from 'support/api/domains';
import { createDomainRecords } from 'support/constants/domains';
import { interceptCreateDomainRecord } from 'support/intercepts/domains';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';

const createCaaRecord = (
  name: string,
  tag: string,
  value: string,
  ttl: string
) => {
  cy.findByText('Add a CAA Record').click();

  // Fill in the form fields
  cy.findByLabelText('Name').type(name);

  ui.autocomplete.findByLabel('Tag').click();
  ui.autocompletePopper.findByTitle(tag).click();

  cy.findByLabelText('Value').type(value);

  ui.autocomplete.findByLabel('TTL').click();
  ui.autocompletePopper.findByTitle(ttl).click();

  // Save the record
  ui.button
    .findByTitle('Save')
    .should('be.visible')
    .should('be.enabled')
    .click();
};

// Reusable function to edit a CAA record
const editCaaRecord = (name: string, newValue: string) => {
  ui.actionMenu
    .findByTitle(`Action menu for Record ${name}`)
    .should('be.visible')
    .click();

  ui.actionMenuItem.findByTitle('Edit').should('be.visible').click();

  // Edit the value field
  cy.findByLabelText('Value').clear();
  cy.focused().type(newValue);
  ui.button.findByTitle('Save').click();
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

before(() => {
  cleanUp('domains');
});

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

describe('Tests for Editable Domain CAA Records', () => {
  beforeEach(() => {
    // Create the initial record with a valid email
    createCaaRecord(
      'securitytest',
      'iodef',
      'mailto:security@example.com',
      '5 minutes'
    );

    // Verify the initial record is in the table
    verifyRecordInTable(
      'securitytest',
      'iodef',
      'mailto:security@example.com',
      '5 minutes'
    );
  });

  it('Validates that "iodef" domain records can be edited with valid record', () => {
    // Edit the record with a valid email and verify the updated record
    editCaaRecord('securitytest', 'mailto:secdef@example.com');
    cy.get('table').should('contain', 'mailto:secdef@example.com');
  });

  it('Validates that "iodef" domain records returns error with invalid record', () => {
    // Edit the record with invalid email and validate form validation
    editCaaRecord('securitytest', 'invalid-email-format');
    cy.get('p[role="alert"][data-qa-textfield-error-text="Value"]')
      .should('exist')
      .and('have.text', 'You have entered an invalid target');
  });
});
