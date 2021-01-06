import {
  createDomain,
  deleteDomainById,
  deleteAllTestDomains,
  makeRandomIP
} from '../../support/api/domains';

import { makeTestLabel } from '../../support/api/common';
import { fbtClick, getClick } from '../../support/helpers';

const createRecords = () => [
  {
    name: 'Add an A/AAAA Record',
    tableAriaLabel: 'List of Domains A/AAAA Record',
    fields: [
      {
        name: '[data-qa-target="Hostname"]',
        value: makeTestLabel(),
        skipCheck: false
      },
      {
        name: '[data-qa-target="IP Address"]',
        value: `${makeRandomIP()}`,
        skipCheck: false
      }
    ]
  },
  {
    name: 'Add a CNAME Record',
    tableAriaLabel: 'List of Domains CNAME Record',
    fields: [
      {
        name: '[data-qa-target="Hostname"]',
        value: makeTestLabel(),
        skipCheck: false
      },
      {
        name: '[data-qa-target="Alias to"]',
        value: `${makeTestLabel()}.net`,
        skipCheck: false
      }
    ]
  },
  {
    name: 'Add a TXT Record',
    tableAriaLabel: 'List of Domains TXT Record',
    fields: [
      {
        name: '[data-qa-target="Hostname"]',
        value: makeTestLabel(),
        skipCheck: false
      },
      {
        name: '[data-qa-target="Value"]',
        value: makeTestLabel(),
        skipCheck: false
      }
    ]
  },
  {
    name: 'Add a SRV Record',
    tableAriaLabel: 'List of Domains SRV Record',
    fields: [
      {
        name: '[data-qa-target="Service"]',
        value: makeTestLabel(),
        skipCheck: true
      },
      {
        name: '[data-qa-target="Target"]',
        value: makeTestLabel(),
        approximate: true
      }
    ]
  },
  {
    name: 'Add a CAA Record',
    tableAriaLabel: 'List of Domains CAA Record',
    fields: [
      {
        name: '[data-qa-target="Name"]',
        value: makeTestLabel(),
        skipCheck: false
      },
      {
        name: '[data-qa-target="Value"]',
        value: makeTestLabel(),
        skipCheck: false
      }
    ]
  }
];

describe('Creates Domains record with Form', () => {
  before(deleteAllTestDomains);
  createRecords().forEach(rec => {
    return it(rec.name, () => {
      createDomain().then(domain => {
        cy.intercept('POST', '/v4/domains/*/record*').as('apiCreateRecord');
        const url = `/domains/${domain.id}`;
        cy.visitWithLogin(`/domains/${domain.id}`);
        cy.url().should('contain', url);
        fbtClick(rec.name);
        rec.fields.forEach(f => {
          getClick(f.name).type(f.value);
        });
        fbtClick('Save');
        cy.wait('@apiCreateRecord')
          .its('response.statusCode')
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
    });
  });
});
