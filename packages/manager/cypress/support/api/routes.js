/// Shortcut to setup cy.route for common routes
export const Route = {
  getLinodes: opt => {
    cy.server();
    cy.route({
      ...{
        method: 'GET',
        url: '/v4/linode/instances/**'
      },
      ...opt
    }).as('getLinodes');
  }
};
