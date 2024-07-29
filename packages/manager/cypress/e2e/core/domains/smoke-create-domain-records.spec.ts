import { authenticate } from 'support/api/authentication';
import { createDomain } from 'support/api/domains';
import { interceptCreateDomainRecord } from 'support/intercepts/domains';
import { createDomainRecords } from 'support/constants/domains';

authenticate();

describe('Creates Domains records with Form', () => {
  it('Adds domain records to a newly created Domain', () => {
    createDomain().then((domain) => {
      // intercept create api record request
      interceptCreateDomainRecord().as('apiCreateRecord');
      const url = `/domains/${domain.id}`;
      cy.visitWithLogin(url);
      cy.url().should('contain', url);
    });

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
