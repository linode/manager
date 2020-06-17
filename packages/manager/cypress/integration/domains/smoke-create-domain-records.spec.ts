import {
  createDomain,
  deleteDomainById,
  deleteAllTestDomains,
  makeRandomIP
} from '../../support/api/domains';

import { makeTestLabel } from '../../support/api/common';

const createRecords = () => [
  {
    name: 'Add an A/AAAA Record',
    tableAriaLabel: 'List of Domains A/AAAA Record',
    fields: [
      { name: 'Hostname', value: makeTestLabel() },
      { name: 'IP Address', value: `${makeRandomIP()}` }
    ]
  },
  {
    name: 'Add a CNAME Record',
    tableAriaLabel: 'List of Domains CNAME Record',
    fields: [
      { name: 'Hostname', value: makeTestLabel() },
      { name: 'Alias to', value: `${makeTestLabel()}.net` }
    ]
  },
  {
    name: 'Add a TXT Record',
    tableAriaLabel: 'List of Domains TXT Record',
    fields: [
      { name: 'Hostname', value: makeTestLabel() },
      { name: 'Value', value: makeTestLabel() }
    ]
  },
  {
    name: 'Add a SRV Record',
    tableAriaLabel: 'List of Domains SRV Record',
    fields: [
      { name: 'Service', value: makeTestLabel(), skipCheck: true },
      { name: 'Target', value: makeTestLabel(), approximate: true }
    ]
  },
  {
    name: 'Add a CAA Record',
    tableAriaLabel: 'List of Domains CAA Record',
    fields: [
      { name: 'Name', value: makeTestLabel() },
      { name: 'Value', value: makeTestLabel() }
    ]
  }
];

describe('Creates Domains record with Form', () => {
  before(deleteAllTestDomains);
  createRecords().forEach(rec => {
    return it(rec.name, () => {
      createDomain().then(domain => {
        cy.server();
        cy.route({
          method: 'POST',
          url: '/v4/domains/*/record*'
        }).as('apiCreateRecord');
        const url = `/domains/${domain.id}`;
        cy.visitWithLogin(`/domains/${domain.id}`);
        cy.url().should('contain', url);
        cy.findByText(rec.name).click();
        rec.fields.forEach(f => {
          cy.findByLabelText(f.name)
            .should('be.visible')
            .click()
            .clear()
            .type(f.value);
        });
        cy.findByText('Save')
          .should('be.visible')
          .click();
        cy.wait('@apiCreateRecord')
          .its('status')
          .should('eq', 200);
        cy.get(`[aria-label="${rec.tableAriaLabel}"]`).within(_table => {
          rec.fields.forEach(f => {
            if (f.skipCheck) {
              return;
            }
            cy.findByText(f.value, { exact: !f.approximate });
          });
        });
        deleteDomainById(domain.id);
      });
    }); // it
  }); // foreach
});
