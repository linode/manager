/**
 * Intercept APIv4 responses to delete internal-only headers
 * and ensure our tests replicate what users see.
 */
export const deleteInternalHeader = () => {
  // Set up Linode APIv4 intercepts and set default alias value.
  beforeEach(() => {
    cy.intercept(
      {
        middleware: true,
        url: /\/v4(?:beta)?\/.*/,
      },
      (req) => {
        // Delete internal-only header
        req.on('before:response', (res) => {
          delete res.headers['akamai-internal-account'];
        });
      }
    );
  });
};
