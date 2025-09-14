import { TruncatedList } from '@src/features/IAM/Shared/TuncatedList';
import * as React from 'react';
import { checkComponentA11y } from 'support/util/accessibility';
import { componentTests } from 'support/util/components';

const mockPermissions = [
  'list_linode_firewalls',
  'list_firewall_devices',
  'view_linode_disk',
  'list_billing_payments',
  'list_billing_invoices',
  'list_payment_methods',
  'view_billing_invoice',
  'list_invoice_items',
  'view_payment_method',
  'view_billing_payment',
];

const permissionList = mockPermissions.map((permission) => (
  <div key={permission}>{permission}</div>
));

componentTests('TruncatedList', (mount) => {
  describe('wide breakpoint', () => {
    beforeEach(() => {
      cy.viewport(1600, 600);
    });

    it('renders all list items', () => {
      mount(
        <TruncatedList dataTestId="permission">{permissionList}</TruncatedList>
      );
      cy.findAllByTestId('permission-list-item').should(
        'have.length',
        mockPermissions.length
      );
      mockPermissions.forEach((permission) => {
        cy.findByText(permission).should('be.visible');
      });
    });
  });

  describe('medium breakpoint', () => {
    beforeEach(() => {
      cy.viewport(600, 600);
    });

    it('renders a truncated list with the correct number of items', () => {
      mount(
        <TruncatedList dataTestId="permission">{permissionList}</TruncatedList>
      );
      cy.findAllByTestId('permission-list-item').should(
        'have.length',
        mockPermissions.length
      );
      mockPermissions.slice(0, 7).forEach((permission) => {
        cy.findByText(permission).should('be.visible');
      });
      cy.findByText('Expand (+3)').should('be.visible').click();
      mockPermissions.forEach((permission) => {
        cy.findByText(permission).should('be.visible');
      });
      cy.findByText('Hide').should('be.visible').click();
      mockPermissions.slice(0, 7).forEach((permission) => {
        cy.findByText(permission).should('be.visible');
      });
      cy.get('[class*="visible-overflow-button"]').should('not.exist');
    });

    it('allows rendering a custom overflow button', () => {
      const handleClick = cy.spy().as('handleClick');

      mount(
        <TruncatedList
          customOverflowButton={() => (
            <button onClick={handleClick}>Custom Overflow Button</button>
          )}
          dataTestId="permission"
        >
          {permissionList}
        </TruncatedList>
      );
      cy.findByRole('button', { name: 'Custom Overflow Button' })
        .should('be.visible')
        .click();
      cy.get('@handleClick').should('have.been.called');
    });

    it('floats the overflow button to the right with justifyOverflowButtonRight', () => {
      mount(
        <TruncatedList dataTestId="permission" justifyOverflowButtonRight>
          {permissionList}
        </TruncatedList>
      );

      cy.get('[class*="visible-overflow-button"]')
        .should('be.visible')
        .should('have.css', 'justify-content', 'end');
    });
  });

  describe('small breakpoint', () => {
    beforeEach(() => {
      cy.viewport(400, 600);
    });

    it('renders a truncated list with the correct number of items', () => {
      mount(
        <TruncatedList dataTestId="permission">{permissionList}</TruncatedList>
      );
      cy.findAllByTestId('permission-list-item').should(
        'have.length',
        mockPermissions.length
      );
      mockPermissions.slice(0, 4).forEach((permission) => {
        cy.findByText(permission).should('be.visible');
      });
      cy.findByText('Expand (+5)').should('be.visible').click();
      mockPermissions.forEach((permission) => {
        cy.findByText(permission).should('be.visible');
      });
      cy.findByText('Hide').should('be.visible').click();
      mockPermissions.slice(0, 4).forEach((permission) => {
        cy.findByText(permission).should('be.visible');
      });
    });
  });

  describe('Accessibility checks', () => {
    it('passes aXe accessibility', () => {
      mount(<TruncatedList>{permissionList}</TruncatedList>);
      checkComponentA11y();
    });
  });
});
