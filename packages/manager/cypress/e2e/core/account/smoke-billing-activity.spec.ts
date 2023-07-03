import { DateTime, IANAZone } from 'luxon';
import { Invoice, Profile } from '@linode/api-v4/types';
import { getProfile } from '@linode/api-v4/lib/profile';
import { profileFactory } from 'src/factories/profile';
import { invoiceFactory } from 'src/factories/billing';
import { authenticate } from 'support/api/authentication';
import { mockGetInvoices } from 'support/intercepts/account';
import { mockGetProfile } from 'support/intercepts/profile';
import { randomString } from 'support/util/random';

// Time zones against which
const timeZonesList = ['America/New_York', 'GMT', 'Asia/Hong_Kong'];

// Array of mock invoice objects to use for tests.
const invoiceMocks: Invoice[] = [
  invoiceFactory.build({
    id: 12346,
    date: '2020-01-03T00:01:01',
    label: `Invoice ${randomString(6)}`,
    subtotal: 90.25,
    tax: 9.25,
    total: 99.5,
  }),
  invoiceFactory.build({
    id: 12345,
    date: '2020-01-01T00:01:01',
    label: `Invoice ${randomString(6)}`,
    subtotal: 120.25,
    tax: 12.25,
    total: 132.5,
  }),
];

/**
 * Localizes an API date string for the given time zone.
 *
 * @param apiDate - API date string to localize.
 * @param timeZone - Time zone string for desired localization.
 *
 * @returns Localized date string.
 */
const localizeDate = (apiDate: string, timeZone: string): string => {
  expect(IANAZone.isValidZone(timeZone)).to.be.true;
  return DateTime.fromISO(apiDate, { zone: 'utc' })
    .setZone(timeZone)
    .toFormat('yyyy-LL-dd');
};

/**
 * Creates a mocked profile using cached data from a real request with a custom time zone.
 *
 * @param timeZone - Time zone to include in mocked profile.
 *
 * @returns Profile mock.
 */
const createProfileMock = (timeZone: string): Profile => {
  return profileFactory.build({
    ...cachedGetProfile,
    timezone: timeZone,
  });
};

/**
 * Assert that the given invoice is shown with expected information.
 *
 * @param invoice - Invoice to check.
 * @param timeZone - Time zone for invoice dates.
 */
const checkInvoice = (invoice: Invoice, timeZone: string) => {
  mockGetInvoices(invoiceMocks).as('getInvoices');
  mockGetProfile(createProfileMock(timeZone)).as('getProfile');
  cy.visitWithLogin('/account/billing');
  // need to select show all time, to not have invoices hidden due to date
  // findbylabel fails due to react-select being a non acc essible component, will change soon
  // cy.findByLabelText('Transaction Dates').select('All Times')
  cy.wait('@getProfile');
  cy.wait('@getInvoices');
  cy.findByText('Billing & Payment History').should('be.visible');
  cy.contains('6 Months').click().type('All time{enter}');
  cy.log(invoice.date, timeZone);
  cy.contains(localizeDate(invoice.date, timeZone)).should('be.visible');
  cy.findByText(invoice.label).should('be.visible');
  cy.findByText(`$${invoice.total.toFixed(2)}`).should('be.visible');
};

authenticate();
let cachedGetProfile = {};

// Fetch and cache real profile object.
beforeEach(() => {
  cy.defer(getProfile(), 'getting profile').then((profile: Profile) => {
    cachedGetProfile = profile;
  });
});

describe('Billling Activity Feed', () => {
  describe('Lists Invoices', () => {
    invoiceMocks.forEach((invoice) => {
      return it(`ID ${invoice.id}`, () => {
        checkInvoice(invoice, timeZonesList[0]);
      });
    });
  });
  describe('Test different timezones', () => {
    timeZonesList.forEach((timeZone) => {
      return it(`Check Invoice date with timezone ${timeZone}`, () => {
        checkInvoice(invoiceMocks[0], timeZone);
      });
    });
  });
});
