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
const timeZonesList = ['America/New_York', 'GMT', 'Asia/Hong_Kong'];

import { DateTime, IANAZone } from 'luxon';

const localizeDate = (apiDate, timezone: string) => {
  expect(IANAZone.isValidZone(timezone)).to.be.true;
  return DateTime.fromISO(apiDate, { zone: 'utc' })
    .setZone(timezone)
    .toFormat('yyyy-LL-dd');
};

// here We precompute the response as it should be before we modify the timezone for these tests
let cachedGetProfile = {};
import { getProfile } from '../../support/api/account';
beforeEach(() => {
  getProfile().then(resp => {
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
  // need to select show all time, to not have invoices hidden due to date
  // findbylabel fails due to react-select being a non acc essible component, will change soon
  // cy.findByLabelText('Transaction Dates').select('All Times')
  cy.findByText('6 Months')
    .click()
    .type('All time{enter}');
  cy.log(invoice.date, tz);
  cy.contains(localizeDate(invoice.date, tz)).should('be.visible');
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
