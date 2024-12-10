/* eslint-disable sonarjs/no-duplicate-string */
import * as React from 'react';
import { ui } from 'support/ui';
import { componentTests } from 'support/util/components';
import {
  randomItem,
  randomLabel,
  randomNumber,
  randomString,
} from 'support/util/random';

import { firewallRuleFactory } from 'src/factories';
import { FirewallRulesLanding } from 'src/features/Firewalls/FirewallDetail/Rules/FirewallRulesLanding';

import type { FirewallPolicyType, FirewallRuleType } from '@linode/api-v4';

interface MoveFocusedElementParams {
  direction: 'DOWN' | 'UP';
  times: number;
}

const portPresetMap = {
  '22': 'SSH',
  '53': 'DNS',
  '80': 'HTTP',
  '443': 'HTTPS',
  '3306': 'MySQL',
};

const mockInboundRules = Array.from({ length: 3 }, () =>
  firewallRuleFactory.build({
    action: 'ACCEPT',
    description: randomString(),
    label: randomLabel(),
    ports: randomItem(Object.keys(portPresetMap)),
  })
);

const mockOutboundRules = Array.from({ length: 3 }, () =>
  firewallRuleFactory.build({
    action: 'DROP',
    description: randomString(),
    label: randomLabel(),
    ports: randomItem(Object.keys(portPresetMap)),
  })
);

const inboundRule1 = mockInboundRules[0];
const inboundRule2 = mockInboundRules[1];
const inboundRule3 = mockInboundRules[2];

const outboundRule1 = mockOutboundRules[0];
const outboundRule2 = mockOutboundRules[1];
const outboundRule3 = mockOutboundRules[2];

const inboundAriaLabel = 'inbound Rules List';
const outboundAriaLabel = 'outbound Rules List';
const buttonText = 'Save Changes';

/**
 * Returns the formatted label for the given firewall rule action.
 *
 * @param ruleAction
 */
const getRuleActionLabel = (ruleAction: FirewallPolicyType): string => {
  return `${ruleAction.charAt(0).toUpperCase()}${ruleAction
    .slice(1)
    .toLowerCase()}`;
};

/**
 * Move the focused element either up or down, N times.
 *
 * note: Cypress automatically focuses the element when you use .type() or .type(' ').
 *
 * @param options.direction - Direction to move the element (row) "UP" or "DOWN".
 * @param options.times - Number of times to move the element.
 */
const moveFocusedElement = ({ direction, times }: MoveFocusedElementParams) => {
  // `direction` is either "UP" or "DOWN"
  const arrowKey = direction === 'DOWN' ? '{downarrow}' : '{uparrow}';

  const repeatedArrowKey = arrowKey.repeat(times);

  // Focused element will receive the repeated arrow key presses
  cy.focused().type(repeatedArrowKey);
};

/**
 * Verifies that the firewall landing page correctly lists the specified inbound
 * and outbound rules in the firewall table, based on the provided options.
 *
 * @param options.includeInbound - Boolean flag to specify whether inbound rules should be included.
 * @param options.includeOutbound - Boolean flag to specify whether outbound rules should be included.
 * @param options.isSmallViewport - Boolean flag to specify whether the viewport is considered small (default is false).
 */
const verifyFirewallWithRules = ({
  includeInbound,
  includeOutbound,
  isSmallViewport = false,
}: {
  includeInbound: boolean;
  includeOutbound: boolean;
  isSmallViewport?: boolean;
}) => {
  // Verify that the Firewall Landing page displays the "Inbound Rules" and "Outbound Rules" headers.
  cy.findByText('Inbound Rules').should('be.visible');
  cy.findByText('Outbound Rules').should('be.visible');

  const inboundRules = includeInbound ? mockInboundRules : [];
  const outboundRules = includeOutbound ? mockOutboundRules : [];

  // Confirm the appropriate rules are listed with correct details.
  [...inboundRules, ...outboundRules].forEach((rule) => {
    cy.findByText(rule.label!)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        if (isSmallViewport) {
          // Column 'Protocol' is not visible for smaller screens.
          cy.findByText(rule.protocol).should('not.exist');
        } else {
          cy.findByText(rule.protocol).should('be.visible');
        }

        cy.findByText(rule.ports!).should('be.visible');
        cy.findByText(getRuleActionLabel(rule.action)).should('be.visible');
      });
  });
};

/**
 * Verifies that the rows in a table are in the expected order based on the
 * provided list of rules and the specified aria-label.
 *
 * @param ariaLabel - The aria-label of the table (either inbound or outbound rule table).
 * @param expectedOrder - The expected order of rules (Array of FirewallRuleType objects).
 *
 * @example
 * // Verifies that the inbound rule table rows are in the expected order.
 * verifyTableRowOrder('inbound Rules List', [rule1, rule2, rule3]);
 */
const verifyTableRowOrder = (
  ariaLabel: string,
  expectedOrder: FirewallRuleType[]
) => {
  cy.get(`[aria-label="${ariaLabel}"]`).within(() => {
    cy.get('tbody tr').then((rows) => {
      expectedOrder.forEach((rule, index) => {
        expect(rows[index]).to.contain(rule.label);
      });
    });
  });
};

/**
 * Test scenario for moving inbound rule rows using keyboard interactions.
 *
 * This test verifies that the keyboard-based drag-and-drop functionality
 * works as expected for inbound rules:
 * - Ensuring the `Save Changes` button is initially disabled.
 * - Activating the row drag mode via `Space/Enter` key.
 * - Moving the rule rows up and down with arrow keys.
 * - Dropping the row and verifying the updated row order.
 * - Enabling the `Save Changes` button after the operation.
 */
const testMoveInboundRuleRowsViaKeyboard = () => {
  // Verify 'Save Changes' button is initially disabled.
  ui.button
    .findByTitle(buttonText)
    .should('be.visible')
    .should('have.attr', 'aria-disabled', 'true');

  // Activate keyboard drag mode using Space/Enter key on the first row - inboundRule1.
  cy.findByText(inboundRule1.label!).should('be.visible');
  cy.findByText(inboundRule1.label!).closest('tr').type(' ');
  cy.findByText(inboundRule1.label!)
    .closest('tr')
    .should('have.attr', 'aria-pressed', 'true');

  // Move `inboundRule1` down two rows.
  moveFocusedElement({ direction: 'DOWN', times: 2 });

  // Drop row with Space/Enter key.
  cy.focused().type(' ');

  // Verify that "inboundRule2" is in the 1st row,
  // "inboundRule3" is in the 2nd row, and "inboundRule1" is in the 3rd row.
  verifyTableRowOrder(inboundAriaLabel, [
    inboundRule2,
    inboundRule3,
    inboundRule1,
  ]);

  // Activate keyboard drag mode using Space/Enter key on the 2nd row - inboundRule3.
  cy.findByText(inboundRule3.label!).should('be.visible');
  cy.findByText(inboundRule3.label!).closest('tr').type(' ');
  cy.findByText(inboundRule3.label!)
    .closest('tr')
    .should('have.attr', 'aria-pressed', 'true');

  // Move `inboundRule3` up one row.
  moveFocusedElement({ direction: 'UP', times: 1 });

  // Drop row with Space/Enter key.
  cy.focused().type(' ');

  // Verify that "inboundRule3" is in the 1st row,
  // "inboundRule2" is in the 2nd row, and "inboundRule1" is in the 3rd row.
  verifyTableRowOrder(inboundAriaLabel, [
    inboundRule3,
    inboundRule2,
    inboundRule1,
  ]);

  // Verify 'Save Changes' button is enabled after row is moved.
  ui.button
    .findByTitle(buttonText)
    .should('be.visible')
    .should('have.attr', 'aria-disabled', 'false');
};

/**
 * Test scenario for canceling the inbound rule drag-and-drop operation using the `Esc` key.
 *
 * This test checks that when the `Esc` key is pressed during a row drag operation,
 * the row returns to its original position and the `Save Changes` button remains disabled.
 */
const testDiscardInboundRuleDragViaKeyboard = () => {
  // Verify 'Save Changes' button is initially disabled.
  ui.button
    .findByTitle(buttonText)
    .should('be.visible')
    .should('have.attr', 'aria-disabled', 'true');

  // Activate keyboard drag mode using Space/Enter key on the first row - inboundRule1.
  cy.findByText(inboundRule1.label!).should('be.visible');
  cy.findByText(inboundRule1.label!).closest('tr').type(' ');
  cy.findByText(inboundRule1.label!)
    .closest('tr')
    .should('have.attr', 'aria-pressed', 'true');

  // Move `inboundRule1` down two rows.
  moveFocusedElement({ direction: 'DOWN', times: 2 });

  // Cancel with Esc key.
  cy.focused().type('{esc}');

  // Ensure row remains in its original position.
  verifyTableRowOrder(inboundAriaLabel, [
    inboundRule1,
    inboundRule2,
    inboundRule3,
  ]);

  // Verify 'Save Changes' button remains disabled after discarding with Esc key.
  ui.button
    .findByTitle(buttonText)
    .should('be.visible')
    .should('have.attr', 'aria-disabled', 'true');
};

/**
 * Test scenario for moving outbound rule rows using keyboard interactions.
 *
 * This test verifies that the keyboard-based drag-and-drop functionality
 * works as expected for outbound rules:
 * - Ensuring the `Save Changes` button is initially disabled.
 * - Activating the row drag mode via `Space/Enter` key.
 * - Moving the rule rows up and down with arrow keys.
 * - Dropping the row and verifying the updated row order.
 * - Enabling the `Save Changes` button after the operation.
 */
const testMoveOutboundRulesViaKeyboard = () => {
  // Verify 'Save Changes' button is initially disabled.
  ui.button
    .findByTitle(buttonText)
    .should('be.visible')
    .should('have.attr', 'aria-disabled', 'true');

  // Activate keyboard drag mode using Space/Enter key on the first row - outboundRule1.
  cy.findByText(outboundRule1.label!).should('be.visible');
  cy.findByText(outboundRule1.label!).closest('tr').type(' ');
  cy.findByText(outboundRule1.label!)
    .closest('tr')
    .should('have.attr', 'aria-pressed', 'true');

  // Move `outboundRule1` down two rows
  moveFocusedElement({ direction: 'DOWN', times: 2 });

  // Drop row with Space/Enter key
  cy.focused().type(' ');

  // Verify that "outboundRule2" is in the 1st row,
  // "outboundRule3" is in the 2nd row, and "outboundRule1" is in the 3rd row.
  verifyTableRowOrder(outboundAriaLabel, [
    outboundRule2,
    outboundRule3,
    outboundRule1,
  ]);

  // Activate keyboard drag mode using Space/Enter key on the 2nd row - outboundRule3.
  cy.findByText(outboundRule3.label!).should('be.visible');
  cy.findByText(outboundRule3.label!).closest('tr').type(' ');
  cy.findByText(outboundRule3.label!)
    .closest('tr')
    .should('have.attr', 'aria-pressed', 'true');

  // Move `outboundRule3` up one row.
  moveFocusedElement({ direction: 'UP', times: 1 });

  // Drop row with Space/Enter key.
  cy.focused().type(' ');

  // Verify that "outboundRule3" is in the 1st row,
  // "outboundRule2" is in the 2nd row, and "outboundRule1" is in the 3rd row.
  verifyTableRowOrder(outboundAriaLabel, [
    outboundRule3,
    outboundRule2,
    outboundRule1,
  ]);

  // Verify 'Save Changes' button is enabled after row is moved.
  ui.button
    .findByTitle(buttonText)
    .should('be.visible')
    .should('have.attr', 'aria-disabled', 'false');
};

/**
 * Test scenario for canceling the outbound rule drag-and-drop operation using the `Esc` key.
 *
 * This test checks that when the `Esc` key is pressed during a row drag operation,
 * the row returns to its original position and the `Save Changes` button remains disabled.
 */
const testDiscardOutboundRuleDragViaKeyboard = () => {
  // Verify 'Save Changes' button is initially disabled.
  ui.button
    .findByTitle(buttonText)
    .should('be.visible')
    .should('have.attr', 'aria-disabled', 'true');

  // Activate keyboard drag mode using Space/Enter key on the first row - outboundRule1.
  cy.findByText(outboundRule1.label!).should('be.visible');
  cy.findByText(outboundRule1.label!).closest('tr').type(' ');
  cy.findByText(outboundRule1.label!)
    .closest('tr')
    .should('have.attr', 'aria-pressed', 'true');

  // Move `outboundRule1` down two rows.
  moveFocusedElement({ direction: 'DOWN', times: 2 });

  // Cancel with Esc key.
  cy.focused().type('{esc}');

  // Ensure row remains in its original position.
  verifyTableRowOrder(outboundAriaLabel, [
    outboundRule1,
    outboundRule2,
    outboundRule3,
  ]);

  // Verify 'Save Changes' button remains disabled after discarding with Esc key.
  ui.button
    .findByTitle(buttonText)
    .should('be.visible')
    .should('have.attr', 'aria-disabled', 'true');
};

/**
 * Keyboard keys used to perform interactions with rows in the Firewall Rules table:
 * - Press `Space/Enter` key once to activate keyboard sensor on the selected row.
 * - Use `Up/Down` arrow keys to move the row up or down.
 * - Press `Space/Enter` key again to drop the focused row.
 * - Press `Esc` key to discard drag and drop operation.
 *
 * Confirms:
 * - All keyboard interactions on Firewall Rules table rows work as expected
 *   for both normal (no vertical scrollbar) and smaller window sizes (with vertical scrollbar).
 * - `CustomKeyboardSensor` works as expected.
 */
componentTests('FirewallRulesTable Drag and Drop Interactions', (mount) => {
  describe('Normal window (no vertical scrollbar)', () => {
    beforeEach(() => {
      cy.viewport(1536, 960);
    });

    describe('Inbound Rules:', () => {
      beforeEach(() => {
        mount(
          <FirewallRulesLanding
            rules={{
              inbound: mockInboundRules,
              inbound_policy: 'ACCEPT',
              outbound_policy: 'DROP',
            }}
            disabled={false}
            firewallID={randomNumber()}
          />
        );
        verifyFirewallWithRules({
          includeInbound: true,
          includeOutbound: false,
        });
      });

      it('should move Inbound rule rows using keyboard interaction', () => {
        testMoveInboundRuleRowsViaKeyboard();
      });

      it('should cancel the Inbound rules drag operation with Esc key', () => {
        testDiscardInboundRuleDragViaKeyboard();
      });
    });

    describe('Outbound Rules:', () => {
      beforeEach(() => {
        mount(
          <FirewallRulesLanding
            rules={{
              inbound_policy: 'ACCEPT',
              outbound: mockOutboundRules,
              outbound_policy: 'DROP',
            }}
            disabled={false}
            firewallID={randomNumber()}
          />
        );
        verifyFirewallWithRules({
          includeInbound: false,
          includeOutbound: true,
        });
      });

      it('should move Outbound rule rows using keyboard interaction', () => {
        testMoveOutboundRulesViaKeyboard();
      });

      it('should cancel the Outbound rules drag operation with Esc key', () => {
        testDiscardOutboundRuleDragViaKeyboard();
      });
    });
  });

  describe('Window with vertical scrollbar', () => {
    beforeEach(() => {
      // Browser window with vertical scroll bar enabled (smaller screens).
      cy.viewport(800, 400);
      cy.window().should('have.property', 'innerWidth', 800);
      cy.window().should('have.property', 'innerHeight', 400);
    });

    describe('Inbound Rules:', () => {
      beforeEach(() => {
        mount(
          <FirewallRulesLanding
            rules={{
              inbound: mockInboundRules,
              inbound_policy: 'ACCEPT',
              outbound_policy: 'DROP',
            }}
            disabled={false}
            firewallID={randomNumber()}
          />
        );
        verifyFirewallWithRules({
          includeInbound: true,
          includeOutbound: false,
          isSmallViewport: true,
        });
      });

      it('should move Inbound rule rows using keyboard interaction', () => {
        testMoveInboundRuleRowsViaKeyboard();
      });

      it('should cancel the Inbound rules drag operation with Esc key', () => {
        testDiscardInboundRuleDragViaKeyboard();
      });
    });

    describe('Outbound Rules:', () => {
      beforeEach(() => {
        mount(
          <FirewallRulesLanding
            rules={{
              inbound_policy: 'ACCEPT',
              outbound: mockOutboundRules,
              outbound_policy: 'DROP',
            }}
            disabled={false}
            firewallID={randomNumber()}
          />
        );
        verifyFirewallWithRules({
          includeInbound: false,
          includeOutbound: true,
          isSmallViewport: true,
        });
      });

      it('should move Outbound rule rows using keyboard interaction', () => {
        testMoveOutboundRulesViaKeyboard();
      });

      it('should cancel the Outbound rules drag operation with Esc key', () => {
        testDiscardOutboundRuleDragViaKeyboard();
      });
    });
  });
});
