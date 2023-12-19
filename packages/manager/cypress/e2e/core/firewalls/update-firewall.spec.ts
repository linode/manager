import type {
  Linode,
  Firewall,
  FirewallRuleType,
  CreateLinodeRequest,
  CreateFirewallPayload,
} from '@linode/api-v4';
import { createLinode, createFirewall } from '@linode/api-v4';
import {
  createLinodeRequestFactory,
  firewallFactory,
  firewallRuleFactory,
  linodeFactory,
} from 'src/factories';
import { authenticate } from 'support/api/authentication';
import { containsClick } from 'support/helpers';
import {
  interceptUpdateFirewallLinodes,
  interceptUpdateFirewallRules,
} from 'support/intercepts/firewalls';
import { randomItem, randomString, randomLabel } from 'support/util/random';
import { fbtVisible, fbtClick } from 'support/helpers';
import { ui } from 'support/ui';
import { chooseRegion } from 'support/util/regions';
import { cleanUp } from 'support/util/cleanup';

const portPresetMap = {
  '22': 'SSH',
  '80': 'HTTP',
  '443': 'HTTPS',
  '3306': 'MySQL',
  '53': 'DNS',
};

const inboundRule = firewallRuleFactory.build({
  label: randomLabel(),
  description: randomString(),
  action: 'Accept',
  ports: randomItem(Object.keys(portPresetMap)),
});

const outboundRule = firewallRuleFactory.build({
  label: randomLabel(),
  description: randomString(),
  action: 'Drop',
  ports: randomItem(Object.keys(portPresetMap)),
});

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
      cy.get('[data-qa-enhanced-select="Select a rule preset..."]').type(
        portPresetMap[port] + '{enter}'
      );

      const label = rule.label ? rule.label : 'test-label';
      const description = rule.description
        ? rule.description
        : 'test-description';
      containsClick('Label').type('{selectall}{backspace}' + label);
      containsClick('Description').type(description);

      const action = rule.action
        ? rule.action.charAt(0).toUpperCase() +
          rule.action.slice(1).toLowerCase()
        : 'Accept';
      containsClick(action).click();

      ui.button
        .findByTitle('Add Rule')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });
};

/**
 * Removes an inbound / outbound firewall rule.
 *
 * No assertion is made on the result of the rule addition attempt.
 *
 * @param ruleLabel - the label of the firewall rule to be removed.
 */
const removeFirewallRules = (ruleLabel: string) => {
  // Go to Rules tab
  ui.tabList.findTabByTitle('Rules').should('be.visible').click();

  cy.get(`[aria-label="${ruleLabel}"]`)
    .first()
    .should('be.visible')
    .within(() => {
      ui.button.findByTitle('Delete').should('be.visible').click();
    });
};

/**
 * Adds a linode to the firewall.
 *
 * No assertion is made on the result of the rule addition attempt.
 *
 * @param firewall - the firewall that is modified.
 * @param linode - the linode that is added to the firewall.
 */
const addLinodesToFirewall = (firewall: Firewall, linode: Linode) => {
  // Go to Linodes tab
  ui.tabList
    .findTabByTitle('Linodes', { exact: false })
    .should('be.visible')
    .click();

  ui.button.findByTitle('Add Linodes to Firewall').should('be.visible').click();

  ui.drawer
    .findByTitle(`Add Linode to Firewall: ${firewall.label}`)
    .should('be.visible')
    .within(() => {
      // Fill out and submit firewall edit form.
      cy.findByLabelText('Linodes')
        .should('be.visible')
        .click()
        .type(linode.label);

      ui.autocompletePopper
        .findByTitle(linode.label)
        .should('be.visible')
        .click();

      cy.findByLabelText('Linodes').should('be.visible').click();

      ui.button.findByTitle('Add').should('be.visible').click();
    });
};

const createLinodeAndFirewall = async (
  linodeRequestPayload: CreateLinodeRequest,
  firewallRequestPayload: CreateFirewallPayload
) => {
  return Promise.all([
    createLinode(linodeRequestPayload),
    createFirewall(firewallRequestPayload),
  ]);
};

authenticate();
describe('update firewall', () => {
  before(() => {
    cleanUp('firewalls');
  });

  /*
   * - Confirms that a linode can be added and removed from a firewall.
   * - Confirms that inbound rules can be added and removed from a firewall.
   * - Confirms that outbound rules can be added and removed from a firewall.
   * - Confirms that a firewall can be enabled and disabled, and their status is reflected on the landing page.
   */
  it("updates a firewall's linodes and rules", () => {
    const region = chooseRegion();

    const linodeRequest = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: region.id,
      root_pass: randomString(16),
    });

    const firewallRequest = firewallFactory.build({
      label: randomLabel(),
      region: region.id,
      rules: firewallRuleFactory.build({
        inbound: [],
        outbound: [],
      }),
    });

    cy.defer(
      createLinodeAndFirewall(linodeRequest, firewallRequest),
      'creating Linode and firewall'
    ).then(([linode, firewall]) => {
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
      addFirewallRules(inboundRule, 'inbound');

      // Confirm that the inbound rules are listed on edit page with expected configuration
      cy.get('[data-rbd-droppable-context-id="0"]')
        .should('be.visible')
        .within(() => {
          cy.findByText(inboundRule.label).should('be.visible');
          cy.findByText(inboundRule.protocol).should('be.visible');
          cy.findByText(inboundRule.ports).should('be.visible');
          cy.findByText(inboundRule.action).should('be.visible');
        });

      // Add outbound rules
      addFirewallRules(outboundRule, 'outbound');

      // Confirm that the outbound rules are listed on edit page with expected configuration
      cy.get('[data-rbd-droppable-context-id="1"]')
        .should('be.visible')
        .within(() => {
          cy.findByText(outboundRule.label).should('be.visible');
          cy.findByText(outboundRule.protocol).should('be.visible');
          cy.findByText(outboundRule.ports).should('be.visible');
          cy.findByText(outboundRule.action).should('be.visible');
        });

      // Save configuration
      interceptUpdateFirewallRules(firewall.id).as('updateFirewallRules');
      ui.button
        .findByTitle('Save Changes')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Go back to landing page and check rules are added to the firewall
      cy.wait('@updateFirewallRules');
      cy.visitWithLogin('/firewalls');
      cy.findByText(firewall.label)
        .closest('tr')
        .within(() => {
          cy.findByText('1 Inbound / 1 Outbound').should('be.visible');
        });

      // Go to the firewalls edit page
      cy.findByText(firewall.label).click();

      // Remove inbound rules
      removeFirewallRules(inboundRule.label);

      // Remove outbound rules
      removeFirewallRules(outboundRule.label);

      // Save configuration
      interceptUpdateFirewallRules(firewall.id).as('updateFirewallRules');
      ui.button
        .findByTitle('Save Changes')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Go back to landing page and check rules are removed to the firewall
      cy.wait('@updateFirewallRules');
      cy.visitWithLogin('/firewalls');
      cy.findByText(firewall.label)
        .closest('tr')
        .within(() => {
          cy.findByText('No rules').should('be.visible');
        });

      // Go to the firewalls edit page
      cy.findByText(firewall.label).click();

      // Confirm that the firewall can be assigned to the linode
      interceptUpdateFirewallLinodes(firewall.id).as('updateFirewallLinodes');
      addLinodesToFirewall(firewall, linode);
      cy.wait('@updateFirewallLinodes');
      cy.visitWithLogin('/firewalls');
      cy.findByText(firewall.label)
        .closest('tr')
        .within(() => {
          cy.findByText(linode.label).should('be.visible');
        });
    });
  });

  /*
   * - Confirms that firewall shows the correct status when it is disabled.
   */
  it("updates a firewall's status", () => {
    const region = chooseRegion();

    const linodeRequest = linodeFactory.build({
      label: randomLabel(),
      region: region.id,
      root_pass: randomString(16),
    });

    const firewallRequest = firewallFactory.build({
      label: randomLabel(),
      region: region.id,
      rules: {
        inbound: [],
        outbound: [],
      },
    });

    cy.defer(
      createLinodeAndFirewall(linodeRequest, firewallRequest),
      'creating Linode and firewall'
    ).then(([_linode, firewall]) => {
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

      // Click 'Disable' button and confirm action.
      cy.findByText(firewall.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          fbtVisible('Disable');
          fbtClick('Disable');
        });

      ui.dialog
        .findByTitle(`Disable Firewall ${firewall.label}?`)
        .should('be.visible')
        .within(() => {
          ui.buttonGroup
            .findButtonByTitle('Disable Firewall')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm status is updated on landing page.
      cy.findByText(firewall.label)
        .closest('tr')
        .within(() => {
          cy.findByText('Disabled').should('be.visible');
        });

      cy.visitWithLogin('/firewalls');

      // Click 'Enable' button and confirm action.
      cy.findByText(firewall.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          fbtVisible('Enable');
          fbtClick('Enable');
        });

      ui.dialog
        .findByTitle(`Enable Firewall ${firewall.label}?`)
        .should('be.visible')
        .within(() => {
          ui.buttonGroup
            .findButtonByTitle('Enable Firewall')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm status is updated on landing page.
      cy.findByText(firewall.label)
        .closest('tr')
        .within(() => {
          cy.findByText('Enabled').should('be.visible');
        });
    });
  });
});
