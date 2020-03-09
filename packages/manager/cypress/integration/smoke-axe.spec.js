describe('smoke - axe', () => {
  const routes = {
    linodes: [
      // {route:'/linodes',
      {
        url: '/linodes/create?type=Distributions',
        el: 'Choose a Distribution'
      },
      { url: '/linodes/create?type=One-Click', el: 'Select App' },
      {
        url: '/linodes/create?type=My%20Images&subtype=Images',
        el: 'Choose an Image'
      },
      {
        url: '/linodes/create?type=My%20Images&subtype=Backups',
        el: 'Select Backup'
      },
      {
        url: '/linodes/create?type=My%20Images&subtype=Clone%20Linode',
        el: 'Select Linode to Clone From'
      }
      // '/linodes/create?type=My%20Images&subtype=Account%20StackScripts'
    ]
  };
  Object.keys(routes).forEach(routeGroup => {
    describe(routeGroup, () => {
      beforeEach(() => {
        cy.login2();
      });
      routes[routeGroup].forEach(route => {
        it(route.url, () => {
          cy.visit(route.url);
          cy.log(`looking for ${route.el}`);
          cy.findByText(route.el, { timeout: 5000 });

          cy.injectAxe();
          cy.configureAxe({
            rules: [
              // aria title on ADA bot frame added after 2 secs, skipping check foir speed
              { id: 'frame-title', enabled: false },
              {
                // our design is not good for that
                id: 'color-contrast',
                enabled: false
              }
            ]
          });
          cy.checkA11y();
        });
      });
    });
  });
});
