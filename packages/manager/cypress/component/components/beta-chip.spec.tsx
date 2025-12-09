import { BetaChip } from '@linode/ui';
import * as React from 'react';
import { checkComponentA11y } from 'support/util/accessibility';
import { componentTests, visualTests } from 'support/util/components';

componentTests('BetaChip', () => {
  visualTests((mount) => {
    it('renders "BETA" text indicator', () => {
      mount(<BetaChip />);
      cy.findByText('beta').should('be.visible');
    });

    it('passes aXe accessibility', () => {
      mount(<BetaChip />);
      checkComponentA11y();
    });
  });
});
