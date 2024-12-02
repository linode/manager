import { createFirewall, Firewall, FirewallPolicyType } from '@linode/api-v4';
import {
  firewallFactory,
  firewallRuleFactory,
  firewallRulesFactory,
} from 'src/factories';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import { randomItem, randomLabel, randomString } from 'support/util/random';

interface MoveFocusedElementParams {
  direction: 'UP' | 'DOWN';
  times: number;
}

const portPresetMap = {
  '22': 'SSH',
  '80': 'HTTP',
  '443': 'HTTPS',
  '3306': 'MySQL',
  '53': 'DNS',
};

const mockInboundRules = Array.from({ length: 3 }, () =>
  firewallRuleFactory.build({
    label: randomLabel(),
    description: randomString(),
    action: 'ACCEPT',
    ports: randomItem(Object.keys(portPresetMap)),
  })
);

const mockOutboundRules = Array.from({ length: 3 }, () =>
  firewallRuleFactory.build({
    label: randomLabel(),
    description: randomString(),
    action: 'DROP',
    ports: randomItem(Object.keys(portPresetMap)),
  })
);

const inboundRule1 = mockInboundRules[0];
const inboundRule2 = mockInboundRules[1];
const inboundRule3 = mockInboundRules[2];

const outboundRule1 = mockOutboundRules[0];
const outboundRule2 = mockOutboundRules[1];
const outboundRule3 = mockOutboundRules[2];

const getRuleActionLabel = (ruleAction: FirewallPolicyType): string => {
  return `${ruleAction.charAt(0).toUpperCase()}${ruleAction
    .slice(1)
    .toLowerCase()}`;
};

const moveFocusedElement = ({ direction, times }: MoveFocusedElementParams) => {
  // `direction` is either "UP" or "DOWN"
  const arrowKey = direction === 'DOWN' ? '{downarrow}' : '{uparrow}';

  const repeatedArrowKey = arrowKey.repeat(times);

  // Focused element will receive the repeated arrow key presses
  cy.focused().type(repeatedArrowKey);
};

/**
 * Creates a firewall with the specified inbound and outbound rules, and verifies
 * that the rules are correctly listed in the firewall table.
 *
 * @param options.includeInbound - Boolean flag to specify whether inbound rules should be included.
 * @param options.includeOutbound - Boolean flag to specify whether outbound rules should be included.
 * @param options.isSmallViewport - Boolean flag to specify whether the viewport is considered small (default is false).
 */
const createAndVerifyFirewallWithRules = ({
  includeInbound,
  includeOutbound,
  isSmallViewport = false,
}: {
  includeInbound: boolean;
  includeOutbound: boolean;
  isSmallViewport?: boolean;
}) => {
  const inboundRules = includeInbound ? mockInboundRules : [];
  const outboundRules = includeOutbound ? mockOutboundRules : [];

  const firewallRequest = firewallFactory.build({
    label: randomLabel(),
    rules: firewallRulesFactory.build({
      inbound: inboundRules,
      outbound: outboundRules,
    }),
  });

  cy.defer(() => createFirewall(firewallRequest), 'creating firewalls').then(
    (firewall: Firewall) => {
      cy.visitWithLogin('/firewalls');
      cy.findByText(firewall.label).should('be.visible');

      cy.findByText(firewall.label).click();

      // Confirm the appropriate rules are listed with correct details
      [...inboundRules, ...outboundRules].forEach((rule: any) => {
        cy.findByText(rule.label!)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            if (isSmallViewport) {
              // Column 'Protocol' is not visible for smaller screens
              cy.findByText(rule.protocol).should('not.exist');
            } else {
              cy.findByText(rule.protocol).should('be.visible');
            }

            cy.findByText(rule.ports!).should('be.visible');
            cy.findByText(getRuleActionLabel(rule.action)).should('be.visible');
          });
      });
    }
  );
};

authenticate();
/**
 * Keyboard keys used to perform interactions with rows in the Firewall Rules table:
 * - Press `Space/Enter` key once to activate keyboard sensor for the focused row.
 * - Use `Up/Down` arrow keys to move the row up or down.
 * - Press `Space/Enter` key again to drop the focused row.
 * - Press `Esc` key to discard drag and drop operation.
 *
 * Confirms:
 * - All keyboard interactions on Firewall Rules table rows work as expected
 *   for both normal (no vertical scrollbar) and smaller window sizes (with vertical scrollbar).
 * - `CustomKeyboardSensor` works as expected.
 */
describe('Drag and Drop Firewall Rules Table Rows - Keyboard Interaction', () => {
  beforeEach(() => {
    cleanUp('firewalls');
    cy.tag('method:e2e');
  });

  describe('Normal window (no vertical scrollbar)', () => {
    describe('Inbound Rules', () => {
      beforeEach(() => {
        createAndVerifyFirewallWithRules({
          includeInbound: true,
          includeOutbound: false,
        });
      });

      it('should move Inbound rule rows using keyboard interaction', () => {
        // Focus the first row and activate keyboard drag mode using Space/Enter key
        cy.findByText(inboundRule1.label!).closest('tr').focus().type(' ');
        cy.findByText(inboundRule1.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `inboundRule1` down two rows
        moveFocusedElement({ direction: 'DOWN', times: 2 });

        // Drop row with Space/Enter key
        cy.focused().type(' ');

        // Verify that "inboundRule2" is in the 1st row,
        // "inboundRule3" is in the 2nd row, and "inboundRule1" is in the 3rd row.
        cy.get('[aria-label="inbound Rules List"]').within(() => {
          cy.get('tbody tr').then((rows) => {
            expect(rows[0]).to.contain(inboundRule2.label);
            expect(rows[1]).to.contain(inboundRule3.label);
            expect(rows[2]).to.contain(inboundRule1.label);
          });
        });

        // Focus the 2nd row and activate keyboard drag mode using Space/Enter key
        cy.findByText(inboundRule3.label!).closest('tr').focus().type(' ');
        cy.findByText(inboundRule3.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `inboundRule3` up one row
        moveFocusedElement({ direction: 'UP', times: 1 });

        // Drop row with Space/Enter key
        cy.focused().type(' ');

        // Verify that "inboundRule3" is in the 1st row,
        // "inboundRule2" is in the 2nd row, and "inboundRule1" is in the 3rd row.
        cy.get('[aria-label="inbound Rules List"]').within(() => {
          cy.get('tbody tr').then((rows) => {
            expect(rows[0]).to.contain(inboundRule3.label);
            expect(rows[1]).to.contain(inboundRule2.label);
            expect(rows[2]).to.contain(inboundRule1.label);
          });
        });
      });

      it('should cancel the Inbound rules drag operation with Esc key', () => {
        // Focus the first row and activate keyboard drag mode using Space/Enter key
        cy.findByText(inboundRule1.label!).closest('tr').focus().type(' ');
        cy.findByText(inboundRule1.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `inboundRule1` down two rows
        moveFocusedElement({ direction: 'DOWN', times: 2 });

        // Cancel with Esc key
        cy.focused().type('{esc}');

        // Ensure row remains in its original position
        cy.get('[aria-label="inbound Rules List"]').within(() => {
          cy.get('tbody tr').then((rows) => {
            expect(rows[0]).to.contain(inboundRule1.label);
            expect(rows[1]).to.contain(inboundRule2.label);
            expect(rows[2]).to.contain(inboundRule3.label);
          });
        });
      });
    });

    describe('Outbound Rules', () => {
      beforeEach(() => {
        createAndVerifyFirewallWithRules({
          includeInbound: false,
          includeOutbound: true,
        });
      });

      it('should move Outbound rule rows using keyboard interaction', () => {
        // Focus the first row and activate keyboard drag mode using Space/Enter key
        cy.findByText(outboundRule1.label!).closest('tr').focus().type(' ');
        cy.findByText(outboundRule1.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `outboundRule1` down two rows
        moveFocusedElement({ direction: 'DOWN', times: 2 });

        // Drop row with Space/Enter key
        cy.focused().type(' ');

        // Verify that "outboundRule2" is in the 1st row,
        // "outboundRule3" is in the 2nd row, and "outboundRule1" is in the 3rd row.
        cy.get('[aria-label="outbound Rules List"]').within(() => {
          cy.get('tbody tr').then((rows) => {
            expect(rows[0]).to.contain(outboundRule2.label);
            expect(rows[1]).to.contain(outboundRule3.label);
            expect(rows[2]).to.contain(outboundRule1.label);
          });
        });

        // Focus the 2nd row and activate keyboard drag mode using Space/Enter key
        cy.findByText(outboundRule3.label!).closest('tr').focus().type(' ');
        cy.findByText(outboundRule3.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `outboundRule3` up one row
        moveFocusedElement({ direction: 'UP', times: 1 });

        // Drop row with Space/Enter key
        cy.focused().type(' ');

        // Verify that "outboundRule3" is in the 1st row,
        // "outboundRule2" is in the 2nd row, and "outboundRule1" is in the 3rd row.
        cy.get('[aria-label="outbound Rules List"]').within(() => {
          cy.get('tbody tr').then((rows) => {
            expect(rows[0]).to.contain(outboundRule3.label);
            expect(rows[1]).to.contain(outboundRule2.label);
            expect(rows[2]).to.contain(outboundRule1.label);
          });
        });
      });

      it('should cancel the Outbound rules drag operation with Esc key', () => {
        // Focus the first row and activate keyboard drag mode using Space/Enter key
        cy.findByText(outboundRule1.label!).closest('tr').focus().type(' ');
        cy.findByText(outboundRule1.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `outboundRule1` down two rows
        moveFocusedElement({ direction: 'DOWN', times: 2 });

        // Cancel with Esc key
        cy.focused().type('{esc}');

        // Ensure row remains in its original position
        cy.get('[aria-label="outbound Rules List"]').within(() => {
          cy.get('tbody tr').then((rows) => {
            expect(rows[0]).to.contain(outboundRule1.label);
            expect(rows[1]).to.contain(outboundRule2.label);
            expect(rows[2]).to.contain(outboundRule3.label);
          });
        });
      });
    });
  });

  describe('Window with vertical scrollbar', () => {
    beforeEach(() => {
      // Browser window with vertical scroll bar enabled (smaller screens)
      cy.viewport(800, 400);
      cy.window().should('have.property', 'innerWidth', 800);
      cy.window().should('have.property', 'innerHeight', 400);
    });

    describe('Inbound Rules', () => {
      beforeEach(() => {
        createAndVerifyFirewallWithRules({
          includeInbound: true,
          includeOutbound: false,
          isSmallViewport: true,
        });
      });

      it('should move Inbound rule rows using keyboard interaction', () => {
        // Focus the first row and activate keyboard drag mode using Space/Enter key
        cy.findByText(inboundRule1.label!).closest('tr').focus().type(' ');
        cy.findByText(inboundRule1.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `inboundRule1` down two rows
        moveFocusedElement({ direction: 'DOWN', times: 2 });

        // Drop row with Space/Enter key
        cy.focused().type(' ');

        // Verify that "inboundRule2" is in the 1st row,
        // "inboundRule3" is in the 2nd row, and "inboundRule1" is in the 3rd row.
        cy.get('[aria-label="inbound Rules List"]').within(() => {
          cy.get('tbody tr').then((rows) => {
            expect(rows[0]).to.contain(inboundRule2.label);
            expect(rows[1]).to.contain(inboundRule3.label);
            expect(rows[2]).to.contain(inboundRule1.label);
          });
        });

        // Focus the 2nd row and activate keyboard drag mode using Space/Enter key
        cy.findByText(inboundRule3.label!).closest('tr').focus().type(' ');
        cy.findByText(inboundRule3.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `inboundRule3` up one row
        moveFocusedElement({ direction: 'UP', times: 1 });

        // Drop row with Space/Enter key
        cy.focused().type(' ');

        // Verify that "inboundRule3" is in the 1st row,
        // "inboundRule2" is in the 2nd row, and "inboundRule1" is in the 3rd row.
        cy.get('[aria-label="inbound Rules List"]').within(() => {
          cy.get('tbody tr').then((rows) => {
            expect(rows[0]).to.contain(inboundRule3.label);
            expect(rows[1]).to.contain(inboundRule2.label);
            expect(rows[2]).to.contain(inboundRule1.label);
          });
        });
      });

      it('should cancel the Inbound rules drag operation with Esc key', () => {
        // Focus the first row and activate keyboard drag mode using Space/Enter key
        cy.findByText(inboundRule1.label!).closest('tr').focus().type(' ');
        cy.findByText(inboundRule1.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `inboundRule1` down two rows
        moveFocusedElement({ direction: 'DOWN', times: 2 });

        // Cancel with Esc key
        cy.focused().type('{esc}');

        // Ensure row remains in its original position
        cy.get('[aria-label="inbound Rules List"]').within(() => {
          cy.get('tbody tr').then((rows) => {
            expect(rows[0]).to.contain(inboundRule1.label);
            expect(rows[1]).to.contain(inboundRule2.label);
            expect(rows[2]).to.contain(inboundRule3.label);
          });
        });
      });
    });

    describe('Outbound Rules', () => {
      beforeEach(() => {
        createAndVerifyFirewallWithRules({
          includeInbound: false,
          includeOutbound: true,
          isSmallViewport: true,
        });
      });

      it('should move Outbound rule rows using keyboard interaction', () => {
        // Focus the first row and activate keyboard drag mode using Space/Enter key
        cy.findByText(outboundRule1.label!).closest('tr').focus().type(' ');
        cy.findByText(outboundRule1.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `outboundRule1` down two rows
        moveFocusedElement({ direction: 'DOWN', times: 2 });

        // Drop row with Space/Enter key
        cy.focused().type(' ');

        // Verify that "outboundRule2" is in the 1st row,
        // "outboundRule3" is in the 2nd row, and "outboundRule1" is in the 3rd row.
        cy.get('[aria-label="outbound Rules List"]').within(() => {
          cy.get('tbody tr').then((rows) => {
            expect(rows[0]).to.contain(outboundRule2.label);
            expect(rows[1]).to.contain(outboundRule3.label);
            expect(rows[2]).to.contain(outboundRule1.label);
          });
        });

        // Focus the 2nd row and activate keyboard drag mode using Space/Enter key
        cy.findByText(outboundRule3.label!).closest('tr').focus().type(' ');
        cy.findByText(outboundRule3.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `outboundRule3` up one row
        moveFocusedElement({ direction: 'UP', times: 1 });

        // Drop row with Space/Enter key
        cy.focused().type(' ');

        // Verify that "outboundRule3" is in the 1st row,
        // "outboundRule2" is in the 2nd row, and "outboundRule1" is in the 3rd row.
        cy.get('[aria-label="outbound Rules List"]').within(() => {
          cy.get('tbody tr').then((rows) => {
            expect(rows[0]).to.contain(outboundRule3.label);
            expect(rows[1]).to.contain(outboundRule2.label);
            expect(rows[2]).to.contain(outboundRule1.label);
          });
        });
      });

      it('should cancel the Outbound rules drag operation with Esc key', () => {
        // Focus the first row and activate keyboard drag mode using Space/Enter key
        cy.findByText(outboundRule1.label!).closest('tr').focus().type(' ');
        cy.findByText(outboundRule1.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `outboundRule1` down two rows
        moveFocusedElement({ direction: 'DOWN', times: 2 });

        // Cancel with Esc key
        cy.focused().type('{esc}');

        // Ensure row remains in its original position
        cy.get('[aria-label="outbound Rules List"]').within(() => {
          cy.get('tbody tr').then((rows) => {
            expect(rows[0]).to.contain(outboundRule1.label);
            expect(rows[1]).to.contain(outboundRule2.label);
            expect(rows[2]).to.contain(outboundRule3.label);
          });
        });
      });
    });
  });
});
