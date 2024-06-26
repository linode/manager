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
      rec.fields.forEach((f) => {
        cy.get(f.name).type(f.value);
      });
      cy.findByText('Save').click();
      cy.wait('@apiCreateRecord').its('response.statusCode').should('eq', 200);
      cy.get(`[aria-label="${rec.tableAriaLabel}"]`).within((_table) => {
        rec.fields.forEach((f) => {
          if (f.skipCheck) {
            return;
          }
          cy.findByText(f.value, { exact: !f.approximate });
        });
      });
    });
  });
});
