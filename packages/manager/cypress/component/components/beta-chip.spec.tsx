import * as React from 'react';
import { checkComponentA11y } from 'support/util/accessibility';
import { componentTests, visualTests } from 'support/util/components';

import { BetaChip } from 'src/components/BetaChip/BetaChip';

componentTests('BetaChip', () => {
  visualTests((mount) => {
    it('renders "BETA" text indicator with primary color', () => {
      mount(<BetaChip color="primary" />);
      cy.findByText('beta').should('be.visible');
    });

    it('renders "BETA" text indicator with default color', () => {
      mount(<BetaChip color="default" />);
      cy.findByText('beta').should('be.visible');
    });

    it('passes aXe check with primary color', () => {
      mount(<BetaChip color="primary" />);
      checkComponentA11y();
    });

    it('passes aXe check with default color', () => {
      mount(<BetaChip color="default" />);
      checkComponentA11y();
    });
  });
});
