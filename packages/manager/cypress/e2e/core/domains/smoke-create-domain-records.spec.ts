/* eslint-disable sonarjs/no-duplicate-string */
import { authenticate } from 'support/api/authentication';
import { createDomain } from 'support/api/domains';
import { fbtClick, getClick } from 'support/helpers';
import { interceptCreateDomainRecord } from 'support/intercepts/domains';
import { cleanUp } from 'support/util/cleanup';
import { createDomainRecords } from 'support/constants/domains';

authenticate();
describe('Creates Domains record with Form', () => {
  before(() => {
    cleanUp('domains');
  });

  createDomainRecords().forEach((rec) => {
    return it(rec.name, () => {
      createDomain().then((domain) => {
        // intercept create api record request
        interceptCreateDomainRecord().as('apiCreateRecord');
        const url = `/domains/${domain.id}`;
        cy.visitWithLogin(url);
        cy.url().should('contain', url);
        fbtClick(rec.name);
        rec.fields.forEach((f) => {
          getClick(f.name).type(f.value);
        });
        fbtClick('Save');
        cy.wait('@apiCreateRecord')
          .its('response.statusCode')
          .should('eq', 200);
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
});
