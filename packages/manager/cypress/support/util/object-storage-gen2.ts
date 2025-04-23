import type { ObjectStorageEndpointTypes } from '@linode/api-v4';

export const checkRateLimitsTable = (
  endpointType: ObjectStorageEndpointTypes
) => {
  const expectedHeaders = ['Limits', 'GET', 'PUT', 'LIST', 'DELETE', 'OTHER'];
  const expectedBasicValues = ['Basic', '2,000', '500', '100', '200', '400'];
  const expectedHighValues =
    endpointType === 'E3'
      ? ['High', '20,000', '2,000', '400', '400', '1,000']
      : ['High', '5,000', '1,000', '200', '200', '800'];

  cy.get('[data-testid="bucket-rate-limit-table"]').within(() => {
    expectedHeaders.forEach((header, index) => {
      cy.get('th').eq(index).should('contain.text', header);
    });

    cy.contains('tr', 'Basic').within(() => {
      expectedBasicValues.forEach((value, index) => {
        cy.get('td').eq(index).should('contain.text', value);
      });
    });

    cy.contains('tr', 'High').within(() => {
      expectedHighValues.forEach((value, index) => {
        cy.get('td').eq(index).should('contain.text', value);
      });
    });

    // Check that Basic radio button is checked
    cy.findByLabelText('Basic').should('be.checked');
  });
};
