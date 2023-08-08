/* eslint-disable sonarjs/no-duplicate-string */
import { authenticate } from 'support/api/authentication';
import { createDomain, deleteAllTestDomains } from 'support/api/domains';
import { fbtClick, getClick } from 'support/helpers';
import { interceptCreateDomainRecord } from 'support/intercepts/domains';
import {
  randomDomainName,
  randomIp,
  randomLabel,
  randomString,
} from 'support/util/random';

const createRecords = () => [
  {
    name: 'Add an A/AAAA Record',
    tableAriaLabel: 'List of Domains A/AAAA Record',
    fields: [
      {
        name: '[data-qa-target="Hostname"]',
        value: randomLabel(),
        skipCheck: false,
      },
      {
        name: '[data-qa-target="IP Address"]',
        value: `${randomIp()}`,
        skipCheck: false,
      },
    ],
  },
  {
    name: 'Add a CNAME Record',
    tableAriaLabel: 'List of Domains CNAME Record',
    fields: [
      {
        name: '[data-qa-target="Hostname"]',
        value: randomLabel(),
        skipCheck: false,
      },
      {
        name: '[data-qa-target="Alias to"]',
        value: `${randomLabel()}.net`,
        skipCheck: false,
      },
    ],
  },
  {
    name: 'Add a TXT Record',
    tableAriaLabel: 'List of Domains TXT Record',
    fields: [
      {
        name: '[data-qa-target="Hostname"]',
        value: randomLabel(),
        skipCheck: false,
      },
      {
        name: '[data-qa-target="Value"]',
        value: `${randomLabel()}=${randomString()}`,
        skipCheck: false,
      },
    ],
  },
  {
    name: 'Add an SRV Record',
    tableAriaLabel: 'List of Domains SRV Record',
    fields: [
      {
        name: '[data-qa-target="Service"]',
        value: randomLabel(),
        skipCheck: true,
      },
      {
        name: '[data-qa-target="Target"]',
        value: randomLabel(),
        approximate: true,
      },
    ],
  },
  {
    name: 'Add a CAA Record',
    tableAriaLabel: 'List of Domains CAA Record',
    fields: [
      {
        name: '[data-qa-target="Name"]',
        value: randomLabel(),
        skipCheck: false,
      },
      {
        name: '[data-qa-target="Value"]',
        value: randomDomainName(),
        skipCheck: false,
      },
    ],
  },
];

authenticate();
describe('Creates Domains record with Form', () => {
  beforeEach(() => {
    cy.defer(deleteAllTestDomains(), 'cleaning up test domains');
  });

  createRecords().forEach((rec) => {
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
