import { createFirewall, Firewall, FirewallPolicyType } from '@linode/api-v4';
import {
  firewallFactory,
  firewallRuleFactory,
  firewallRulesFactory,
} from 'src/factories';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import { randomItem, randomLabel, randomString } from 'support/util/random';

const portPresetMap = {
  '22': 'SSH',
  '80': 'HTTP',
  '443': 'HTTPS',
  '3306': 'MySQL',
  '53': 'DNS',
};

const mockInboundRules = [
  firewallRuleFactory.build({
    label: randomLabel(),
    description: randomString(),
    action: 'ACCEPT',
    ports: randomItem(Object.keys(portPresetMap)),
  }),
  firewallRuleFactory.build({
    label: randomLabel(),
    description: randomString(),
    action: 'ACCEPT',
    ports: randomItem(Object.keys(portPresetMap)),
  }),
  firewallRuleFactory.build({
    label: randomLabel(),
    description: randomString(),
    action: 'ACCEPT',
    ports: randomItem(Object.keys(portPresetMap)),
  }),
];

const mockOutboundRules = [
  firewallRuleFactory.build({
    label: randomLabel(),
    description: randomString(),
    action: 'DROP',
    ports: randomItem(Object.keys(portPresetMap)),
  }),
  firewallRuleFactory.build({
    label: randomLabel(),
    description: randomString(),
    action: 'DROP',
    ports: randomItem(Object.keys(portPresetMap)),
  }),
  firewallRuleFactory.build({
    label: randomLabel(),
    description: randomString(),
    action: 'DROP',
    ports: randomItem(Object.keys(portPresetMap)),
  }),
];

const getRuleActionLabel = (ruleAction: FirewallPolicyType): string => {
  return `${ruleAction.charAt(0).toUpperCase()}${ruleAction
    .slice(1)
    .toLowerCase()}`;
};

authenticate();
describe('Drag and Drop Firewall Rules Table Rows - Keyboard Interaction', () => {
  before(() => {
    cleanUp('firewalls');
  });
  beforeEach(() => {
    cy.tag('method:e2e');
  });

  context('Normal window (no vertical scrollbar)', () => {
    it('should move Inbound rule rows using keyboard interaction', () => {
      const firewallRequest = firewallFactory.build({
        label: randomLabel(),
        rules: firewallRulesFactory.build({
          inbound: mockInboundRules,
          outbound: [],
        }),
      });

      cy.defer(
        () => createFirewall(firewallRequest),
        'creating firewalls'
      ).then((firewall: Firewall) => {
        cy.visitWithLogin('/firewalls');

        // Confirm that firewall is listed
        cy.findByText(firewall.label).should('be.visible');

        // Go to the firewall details page
        cy.findByText(firewall.label).click();

        // Confirm inbound rules are listed with correct details
        mockInboundRules.forEach((rule) => {
          cy.findByText(rule.label!)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              cy.findByText(rule.protocol).should('be.visible');
              cy.findByText(rule.ports!).should('be.visible');
              cy.findByText(getRuleActionLabel(rule.action)).should(
                'be.visible'
              );
            });
        });

        const inboundRule1 = mockInboundRules[0];
        const inboundRule2 = mockInboundRules[1];
        const inboundRule3 = mockInboundRules[2];

        // Focus the first row and activate keyboard drag mode using Space/Enter key
        cy.findByText(inboundRule1.label!).closest('tr').focus().type(' ');
        cy.findByText(inboundRule1.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `inboundRule1` down two rows
        cy.focused().type('{downarrow}');
        cy.focused().type('{downarrow}');

        // Drop row with Space
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
        cy.focused().type('{uparrow}');

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
    });

    it('should move Outbound rule rows using keyboard interaction', () => {
      const firewallRequest = firewallFactory.build({
        label: randomLabel(),
        rules: firewallRulesFactory.build({
          inbound: [],
          outbound: mockOutboundRules,
        }),
      });

      cy.defer(
        () => createFirewall(firewallRequest),
        'creating firewalls'
      ).then((firewall: Firewall) => {
        cy.visitWithLogin('/firewalls');

        // Confirm that firewall is listed
        cy.findByText(firewall.label).should('be.visible');

        // Go to the firewall details page
        cy.findByText(firewall.label).click();

        // Confirm outbound rules are listed with correct details
        mockOutboundRules.forEach((rule) => {
          cy.findByText(rule.label!)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              cy.findByText(rule.protocol).should('be.visible');
              cy.findByText(rule.ports!).should('be.visible');
              cy.findByText(getRuleActionLabel(rule.action)).should(
                'be.visible'
              );
            });
        });

        const outboundRule1 = mockOutboundRules[0];
        const outboundRule2 = mockOutboundRules[1];
        const outboundRule3 = mockOutboundRules[2];

        // Focus the first row and activate keyboard drag mode using Space/Enter key
        cy.findByText(outboundRule1.label!).closest('tr').focus().type(' ');
        cy.findByText(outboundRule1.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `inboundRule1` down two rows
        cy.focused().type('{downarrow}');
        cy.focused().type('{downarrow}');

        // Drop row with Space
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

        // Move `inboundRule3` up one row
        cy.focused().type('{uparrow}');

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
    });

    it('should cancel the Inbound rules drag operation with Esc key', () => {
      const firewallRequest = firewallFactory.build({
        label: randomLabel(),
        rules: firewallRulesFactory.build({
          inbound: mockInboundRules,
          outbound: [],
        }),
      });

      cy.defer(
        () => createFirewall(firewallRequest),
        'creating firewalls'
      ).then((firewall: Firewall) => {
        cy.visitWithLogin('/firewalls');

        // Confirm that firewall is listed
        cy.findByText(firewall.label).should('be.visible');

        // Go to the firewall details page
        cy.findByText(firewall.label).click();

        // Confirm inbound rules are listed with correct details
        mockInboundRules.forEach((rule) => {
          cy.findByText(rule.label!)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              cy.findByText(rule.protocol).should('be.visible');
              cy.findByText(rule.ports!).should('be.visible');
              cy.findByText(getRuleActionLabel(rule.action)).should(
                'be.visible'
              );
            });
        });

        const inboundRule1 = mockInboundRules[0];
        const inboundRule2 = mockInboundRules[1];
        const inboundRule3 = mockInboundRules[2];

        // Focus the first row and activate keyboard drag mode using Space/Enter key
        cy.findByText(inboundRule1.label!).closest('tr').focus().type(' ');
        cy.findByText(inboundRule1.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `inboundRule1` down two rows
        cy.focused().type('{downarrow}');
        cy.focused().type('{downarrow}');

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

    it('should cancel the Outbound rules drag operation with Esc key', () => {
      const firewallRequest = firewallFactory.build({
        label: randomLabel(),
        rules: firewallRulesFactory.build({
          inbound: [],
          outbound: mockOutboundRules,
        }),
      });

      cy.defer(
        () => createFirewall(firewallRequest),
        'creating firewalls'
      ).then((firewall: Firewall) => {
        cy.visitWithLogin('/firewalls');

        // Confirm that firewall is listed
        cy.findByText(firewall.label).should('be.visible');

        // Go to the firewall details page
        cy.findByText(firewall.label).click();

        // Confirm outbound rules are listed with correct details
        mockOutboundRules.forEach((rule) => {
          cy.findByText(rule.label!)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              cy.findByText(rule.protocol).should('be.visible');
              cy.findByText(rule.ports!).should('be.visible');
              cy.findByText(getRuleActionLabel(rule.action)).should(
                'be.visible'
              );
            });
        });

        const outboundRule1 = mockOutboundRules[0];
        const outboundRule2 = mockOutboundRules[1];
        const outboundRule3 = mockOutboundRules[2];

        // Focus the first row and activate keyboard drag mode using Space/Enter key
        cy.findByText(outboundRule1.label!).closest('tr').focus().type(' ');
        cy.findByText(outboundRule1.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `outboundRule1` down two rows
        cy.focused().type('{downarrow}');
        cy.focused().type('{downarrow}');

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

  context('Window with vertical scrollbar', () => {
    it('should move Inbound rule rows using keyboard interaction', () => {
      // Browser window with vertical scroll bar enabled (smaller screens)
      cy.viewport(800, 400);
      cy.window().should('have.property', 'innerWidth', 800);
      cy.window().should('have.property', 'innerHeight', 400);

      const firewallRequest = firewallFactory.build({
        label: randomLabel(),
        rules: firewallRulesFactory.build({
          inbound: mockInboundRules,
          outbound: [],
        }),
      });

      cy.defer(
        () => createFirewall(firewallRequest),
        'creating firewalls'
      ).then((firewall: Firewall) => {
        cy.visitWithLogin('/firewalls');

        // Confirm that firewall is listed
        cy.findByText(firewall.label).should('be.visible');

        // Go to the firewall details page
        cy.findByText(firewall.label).click();

        // Confirm inbound rules are listed with correct details
        mockInboundRules.forEach((rule) => {
          cy.findByText(rule.label!)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              // Column 'Protocol' is not visible for smaller screens
              cy.findByText(rule.protocol).should('not.exist');

              cy.findByText(rule.ports!).should('be.visible');
              cy.findByText(getRuleActionLabel(rule.action)).should(
                'be.visible'
              );
            });
        });

        const inboundRule1 = mockInboundRules[0];
        const inboundRule2 = mockInboundRules[1];
        const inboundRule3 = mockInboundRules[2];

        // Focus the first row and activate keyboard drag mode using Space/Enter key
        cy.findByText(inboundRule1.label!).closest('tr').focus().type(' ');
        cy.findByText(inboundRule1.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `inboundRule1` down two rows
        cy.focused().type('{downarrow}');
        cy.focused().type('{downarrow}');

        // Drop row with Space
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
        cy.focused().type('{uparrow}');

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
    });

    it('should move Outbound rule rows using keyboard interaction', () => {
      // Browser window with vertical scroll bar enabled (smaller screens)
      cy.viewport(800, 400);
      cy.window().should('have.property', 'innerWidth', 800);
      cy.window().should('have.property', 'innerHeight', 400);

      const firewallRequest = firewallFactory.build({
        label: randomLabel(),
        rules: firewallRulesFactory.build({
          inbound: [],
          outbound: mockOutboundRules,
        }),
      });

      cy.defer(
        () => createFirewall(firewallRequest),
        'creating firewalls'
      ).then((firewall: Firewall) => {
        cy.visitWithLogin('/firewalls');

        // Confirm that firewall is listed
        cy.findByText(firewall.label).should('be.visible');

        // Go to the firewall details page
        cy.findByText(firewall.label).click();

        // Confirm outbound rules are listed with correct details
        mockOutboundRules.forEach((rule) => {
          cy.findByText(rule.label!)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              // Column 'Protocol' is not visible for smaller screens
              cy.findByText(rule.protocol).should('not.exist');

              cy.findByText(rule.ports!).should('be.visible');
              cy.findByText(getRuleActionLabel(rule.action)).should(
                'be.visible'
              );
            });
        });

        const outboundRule1 = mockOutboundRules[0];
        const outboundRule2 = mockOutboundRules[1];
        const outboundRule3 = mockOutboundRules[2];

        // Focus the first row and activate keyboard drag mode using Space/Enter key
        cy.findByText(outboundRule1.label!).closest('tr').focus().type(' ');
        cy.findByText(outboundRule1.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `inboundRule1` down two rows
        cy.focused().type('{downarrow}');
        cy.focused().type('{downarrow}');

        // Drop row with Space
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

        // Move `inboundRule3` up one row
        cy.focused().type('{uparrow}');

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
    });

    it('should cancel the Inbound rules drag operation with Esc key', () => {
      // Browser window with vertical scroll bar enabled (smaller screens)
      cy.viewport(800, 400);
      cy.window().should('have.property', 'innerWidth', 800);
      cy.window().should('have.property', 'innerHeight', 400);

      const firewallRequest = firewallFactory.build({
        label: randomLabel(),
        rules: firewallRulesFactory.build({
          inbound: mockInboundRules,
          outbound: [],
        }),
      });

      cy.defer(
        () => createFirewall(firewallRequest),
        'creating firewalls'
      ).then((firewall: Firewall) => {
        cy.visitWithLogin('/firewalls');

        // Confirm that firewall is listed
        cy.findByText(firewall.label).should('be.visible');

        // Go to the firewall details page
        cy.findByText(firewall.label).click();

        // Confirm inbound rules are listed with correct details
        mockInboundRules.forEach((rule) => {
          cy.findByText(rule.label!)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              // Column 'Protocol' is not visible for smaller screens
              cy.findByText(rule.protocol).should('not.exist');

              cy.findByText(rule.ports!).should('be.visible');
              cy.findByText(getRuleActionLabel(rule.action)).should(
                'be.visible'
              );
            });
        });

        const inboundRule1 = mockInboundRules[0];
        const inboundRule2 = mockInboundRules[1];
        const inboundRule3 = mockInboundRules[2];

        // Focus the first row and activate keyboard drag mode using Space/Enter key
        cy.findByText(inboundRule1.label!).closest('tr').focus().type(' ');
        cy.findByText(inboundRule1.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `inboundRule1` down two rows
        cy.focused().type('{downarrow}');
        cy.focused().type('{downarrow}');

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

    it('should cancel the Outbound rules drag operation with Esc key', () => {
      // Browser window with vertical scroll bar enabled (smaller screens)
      cy.viewport(800, 400);
      cy.window().should('have.property', 'innerWidth', 800);
      cy.window().should('have.property', 'innerHeight', 400);

      const firewallRequest = firewallFactory.build({
        label: randomLabel(),
        rules: firewallRulesFactory.build({
          inbound: [],
          outbound: mockOutboundRules,
        }),
      });

      cy.defer(
        () => createFirewall(firewallRequest),
        'creating firewalls'
      ).then((firewall: Firewall) => {
        cy.visitWithLogin('/firewalls');

        // Confirm that firewall is listed
        cy.findByText(firewall.label).should('be.visible');

        // Go to the firewall details page
        cy.findByText(firewall.label).click();

        // Confirm outbound rules are listed with correct details
        mockOutboundRules.forEach((rule) => {
          cy.findByText(rule.label!)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              // Column 'Protocol' is not visible for smaller screens
              cy.findByText(rule.protocol).should('not.exist');

              cy.findByText(rule.ports!).should('be.visible');
              cy.findByText(getRuleActionLabel(rule.action)).should(
                'be.visible'
              );
            });
        });

        const outboundRule1 = mockOutboundRules[0];
        const outboundRule2 = mockOutboundRules[1];
        const outboundRule3 = mockOutboundRules[2];

        // Focus the first row and activate keyboard drag mode using Space/Enter key
        cy.findByText(outboundRule1.label!).closest('tr').focus().type(' ');
        cy.findByText(outboundRule1.label!)
          .closest('tr')
          .should('have.attr', 'aria-pressed', 'true');

        // Move `outboundRule1` down two rows
        cy.focused().type('{downarrow}');
        cy.focused().type('{downarrow}');

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
