import type {
  FirewallRuleType,
  CreateFirewallPayload,
  FirewallPolicyType,
} from '@linode/api-v4';
import { createFirewall } from '@linode/api-v4';
import {
  firewallFactory,
  firewallRuleFactory,
  firewallRulesFactory,
} from 'src/factories';
import { authenticate } from 'support/api/authentication';
import { containsClick } from 'support/helpers';
import { randomItem, randomString, randomLabel } from 'support/util/random';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import '@4tw/cypress-drag-drop';

const portPresetMap = {
  '22': 'SSH',
  '80': 'HTTP',
  '443': 'HTTPS',
  '3306': 'MySQL',
  '53': 'DNS',
};

const createInboundRule = (label: string) => {
  return firewallRuleFactory.build({
    label: label,
    description: randomString(),
    action: 'ACCEPT',
    ports: randomItem(Object.keys(portPresetMap)),
  });
};

const createOutboundRule = (label: string) => {
  return firewallRuleFactory.build({
    label: label,
    description: randomString(),
    action: 'ACCEPT',
    ports: randomItem(Object.keys(portPresetMap)),
  });
};

const getRuleActionLabel = (ruleAction: FirewallPolicyType): string => {
  return `${ruleAction.charAt(0).toUpperCase()}${ruleAction
    .slice(1)
    .toLowerCase()}`;
};

/**
 * Adds an inbound / outbound firewall rule.
 *
 * No assertion is made on the result of the rule addition attempt.
 *
 * @param rule - the firewall rule to be added.
 * @param direction - the direction of the rule, inbound or outbound.
 */
const addFirewallRules = (rule: FirewallRuleType, direction: string) => {
  const ruleTitle =
    direction && direction.toLowerCase() === 'outbound'
      ? 'Add an Outbound Rule'
      : 'Add an Inbound Rule';

  // Go to Rules tab
  ui.tabList.findTabByTitle('Rules').should('be.visible').click();

  ui.button.findByTitle(ruleTitle).should('be.visible').click();

  ui.drawer
    .findByTitle(ruleTitle)
    .should('be.visible')
    .within(() => {
      const port = rule.ports ? rule.ports : '22';
      cy.findByPlaceholderText('Select a rule preset...').type(
        portPresetMap[port as keyof typeof portPresetMap] + '{enter}'
      );
      const label = rule.label ? rule.label : 'test-label';
      const description = rule.description
        ? rule.description
        : 'test-description';
      containsClick('Label').type('{selectall}{backspace}' + label);
      containsClick('Description').type(description);

      const action = rule.action ? getRuleActionLabel(rule.action) : 'Accept';
      containsClick(action).click();

      ui.button
        .findByTitle('Add Rule')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });
};

const createFirewalls = async (
  firewallRequestPayload: CreateFirewallPayload
) => {
  return Promise.all([createFirewall(firewallRequestPayload)]);
};

authenticate();
describe('firewall inbound rules drag & drop and keyboard interactions tests', () => {
  let inboundRule1: FirewallRuleType;
  let inboundRule2: FirewallRuleType;
  let inboundRule3: FirewallRuleType;
  // Note that nth-child is 1-indexed
  const tableRow = 'div[aria-label="inbound Rules List"] tbody tr';
  const firstRow = 'div[aria-label="inbound Rules List"] tbody tr:nth-child(1)';
  const secondRow =
    'div[aria-label="inbound Rules List"] tbody tr:nth-child(2)';

  before(() => {
    cleanUp('firewalls');
  });
  beforeEach(() => {
    const firewallRequest = firewallFactory.build({
      label: randomLabel(),
      rules: firewallRulesFactory.build({
        inbound: [],
        outbound: [],
      }),
    });

    inboundRule1 = createInboundRule('inbound_rule_1');
    inboundRule2 = createInboundRule('inbound_rule_2');
    inboundRule3 = createInboundRule('inbound_rule_3');

    cy.defer(() => createFirewalls(firewallRequest), 'creating firewall').then(
      ([firewall]) => {
        cy.visitWithLogin('/firewalls');

        // Confirm that firewall is listed on landing page with expected configuration.
        cy.findByText(firewall.label)
          .closest('tr')
          .within(() => {
            cy.findByText(firewall.label).should('be.visible');
            cy.findByText('Enabled').should('be.visible');
            cy.findByText('No rules').should('be.visible');
            cy.findByText('None assigned').should('be.visible');
          });

        // Go to the firewalls edit page
        cy.findByText(firewall.label).click();

        // In Rules tab, add inbound rules
        addFirewallRules(inboundRule1, 'inbound');
        addFirewallRules(inboundRule2, 'inbound');
        addFirewallRules(inboundRule3, 'inbound');
      }
    );
  });

  /*
   * - Confirms that firewall inbound rule table drag and drop functionality works as expected.
   */
  it('drag and drop functionality should work for firewall inbound rules table', () => {
    // Drag the 1st row rule to 2nd row position
    // Note that eq is 0-indexed
    cy.get(tableRow).eq(0).drag(secondRow);

    // Verify the labels in the 1st, 2nd, and 3rd rows
    cy.get(tableRow).eq(0).should('contain', inboundRule2.label);
    cy.get(tableRow).eq(1).should('contain', inboundRule1.label);
    cy.get(tableRow).eq(2).should('contain', inboundRule3.label);

    // Drag the 3rd row rule to 2nd row position
    cy.get(tableRow).eq(2).drag(secondRow);

    // Verify the labels in the 1st, 2nd, and 3rd rows
    cy.get(tableRow).eq(0).should('contain', inboundRule2.label);
    cy.get(tableRow).eq(1).should('contain', inboundRule3.label);
    cy.get(tableRow).eq(2).should('contain', inboundRule1.label);

    // Drag the 3rd row rule to 1st position
    cy.get(tableRow).eq(2).drag(firstRow);

    // Verify the labels in the 1st, 2nd, and 3rd rows
    cy.get(tableRow).eq(0).should('contain', inboundRule1.label);
    cy.get(tableRow).eq(1).should('contain', inboundRule2.label);
    cy.get(tableRow).eq(2).should('contain', inboundRule3.label);
  });
});

describe('firewall outbound rules drag & drop and keyboard interactions tests', () => {
  let outboundRule1: FirewallRuleType;
  let outboundRule2: FirewallRuleType;
  let outboundRule3: FirewallRuleType;
  // Note that nth-child is 1-indexed
  const tableRow = 'div[aria-label="outbound Rules List"] tbody tr';
  const firstRow =
    'div[aria-label="outbound Rules List"] tbody tr:nth-child(1)';
  const secondRow =
    'div[aria-label="outbound Rules List"] tbody tr:nth-child(2)';

  before(() => {
    cleanUp('firewalls');
  });
  beforeEach(() => {
    const firewallRequest = firewallFactory.build({
      label: randomLabel(),
      rules: firewallRulesFactory.build({
        inbound: [],
        outbound: [],
      }),
    });

    outboundRule1 = createOutboundRule('outbound_rule_1');
    outboundRule2 = createOutboundRule('outbound_rule_2');
    outboundRule3 = createOutboundRule('outbound_rule_3');

    cy.defer(() => createFirewalls(firewallRequest), 'creating firewall').then(
      ([firewall]) => {
        cy.visitWithLogin('/firewalls');

        // Confirm that firewall is listed on landing page with expected configuration.
        cy.findByText(firewall.label)
          .closest('tr')
          .within(() => {
            cy.findByText(firewall.label).should('be.visible');
            cy.findByText('Enabled').should('be.visible');
            cy.findByText('No rules').should('be.visible');
            cy.findByText('None assigned').should('be.visible');
          });

        // Go to the firewalls edit page
        cy.findByText(firewall.label).click();

        // In Rules tab, add inbound rules
        addFirewallRules(outboundRule1, 'outbound');
        addFirewallRules(outboundRule2, 'outbound');
        addFirewallRules(outboundRule3, 'outbound');
      }
    );
  });

  /*
   * - Confirms that firewall outbound rule table drag and drop functionality works as expected.
   */
  it('drag and drop functionality should work for firewall outbound rules table', () => {
    // Drag the 1st row rule to 2nd row position
    // Note that eq is 0-indexed
    cy.get(tableRow).eq(0).drag(secondRow);

    // Verify the labels in the 1st, 2nd, and 3rd rows
    cy.get(tableRow).eq(0).should('contain', outboundRule2.label);
    cy.get(tableRow).eq(1).should('contain', outboundRule1.label);
    cy.get(tableRow).eq(2).should('contain', outboundRule3.label);

    // Drag the 3rd row rule to 2nd row position
    cy.get(tableRow).eq(2).drag(secondRow);

    // Verify the labels in the 1st, 2nd, and 3rd rows
    cy.get(tableRow).eq(0).should('contain', outboundRule2.label);
    cy.get(tableRow).eq(1).should('contain', outboundRule3.label);
    cy.get(tableRow).eq(2).should('contain', outboundRule1.label);

    // Drag the 3rd row rule to 1st position
    cy.get(tableRow).eq(2).drag(firstRow);

    // Verify the labels in the 1st, 2nd, and 3rd rows
    cy.get(tableRow).eq(0).should('contain', outboundRule1.label);
    cy.get(tableRow).eq(1).should('contain', outboundRule2.label);
    cy.get(tableRow).eq(2).should('contain', outboundRule3.label);
  });
});
