import * as React from 'react';
import { BetaChip } from 'src/components/BetaChip/BetaChip';
import { describeComponent } from 'support/util/components';
import { checkComponentA11y } from 'support/util/accessibility';

describeComponent('BetaChip', (theme) => {
  it('renders "BETA" text indicator with primary color', () => {
    cy.mountWithTheme(<BetaChip color="primary" />, theme);
    cy.findByText('beta').should('be.visible');
  });

  it('renders "BETA" text indicator with default color', () => {
    cy.mountWithTheme(<BetaChip color="default" />, theme);
    cy.findByText('beta').should('be.visible');
  });

  it('passes aXe check with primary color', () => {
    cy.mountWithTheme(<BetaChip color="primary" />, theme);
    checkComponentA11y();
  });

  it('passes aXe check with default color', () => {
    cy.mountWithTheme(<BetaChip color="default" />, theme);
    checkComponentA11y();
  });
});
