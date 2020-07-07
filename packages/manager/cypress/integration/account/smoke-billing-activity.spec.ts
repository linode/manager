/* eslint-disable sonarjs/no-duplicate-string */
const mockGetInvoices = data => {
  cy.route({
    method: 'GET',
    response: data,
    url: '*/account/invoices?*'
  }).as('getAccount');
};

const mockTwoInvoices = {
  data: [
    {
      id: '12346',
      date: '2020-01-03T00:01:01',
      label: 'Invoice adfgh',
      subtotal: 90.25,
      tax: 9.25,
      total: 99.5
    },
    {
      id: '12345',
      date: '2020-01-01T00:01:01',
      label: 'Invoice oiiohio',
      subtotal: 120.25,
      tax: 12.25,
      total: 132.5
    }
  ],
  page: 1,
  pages: 1,
  results: 2
};
const timeZonesList = ['US/Eastern', 'GMT', 'Asia/Hong_Kong'];

// cypress.moment does not support timezones
import * as momentTz from 'moment-timezone';

const localizeDate = (apiDate, timezone) => {
  return momentTz
    .utc(apiDate)
    .tz(timezone)
    .format('YYYY-MM-DD');
};

// here We precompute the response as it should be before we modify the timezone for these tests
let cachedGetProfile = null;
import { getProfile } from '../../support/api/account';
beforeEach(() => {
  cachedGetProfile = getProfile().then(resp => {
    cachedGetProfile = resp.body;
  });
});

const mockProfile = timezone => {
  cy.route({
    method: 'GET',
    response: { ...cachedGetProfile, timezone },
    url: '*/profile'
  }).as('getProfile');
};

const checkInvoice = (invoice, tz) => {
  cy.server();
  mockGetInvoices(mockTwoInvoices);
  mockProfile(tz);
  cy.visitWithLogin('/account/billing');
  cy.findByText(localizeDate(invoice.date, tz)).should('be.visible');
  cy.findByText(invoice.label).should('be.visible');
  cy.findByText(`$${invoice.total.toFixed(2)}`).should('be.visible');
};

describe('Billling Activity Feed', () => {
  describe('Lists Invoices', () => {
    mockTwoInvoices.data.forEach(invoice => {
      return it(`ID ${invoice.id}`, () => {
        checkInvoice(invoice, timeZonesList[0]);
      });
    });
  });
  describe('Test different timezones', () => {
    timeZonesList.forEach(tz => {
      return it(`Check Invoice date with timezone ${tz}`, () => {
        checkInvoice(mockTwoInvoices.data[0], tz);
      });
    });
  });
});
