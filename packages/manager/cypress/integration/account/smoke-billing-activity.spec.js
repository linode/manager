/* eslint-disable sonarjs/no-duplicate-string */
const mockGetInvoices = data => {
  cy.server();
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
describe('Billling Activity Feed', () => {
  describe('Lists Invoices', () => {
    mockTwoInvoices.data.forEach(i => {
      return it(`ID ${i.id}`, () => {
        mockGetInvoices(mockTwoInvoices);
        cy.visitWithLogin('/account/billing');
        // cy.findByText(i.id).should('be.visible');
        cy.findByText(i.date.split('T')[0]).should('be.visible');
        cy.findByText(i.label).should('be.visible');
        cy.findByText(`$${i.total.toFixed(2)}`).should('be.visible');
      });
    });
  });
});
