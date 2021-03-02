// Shortcut to setup cy.route for common routes
export const Route = {
  getLinodes: (opt) => {
    cy.intercept('GET', '/v4/linode/instances/**', opt).as('getLinodes');
  },
};
