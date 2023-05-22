import { createLinode } from '@linode/api-v4/lib/linodes';
import { createLinodeRequestFactory } from 'src/factories/linodes';
import { authenticate } from 'support/api/authentication';
import { containsClick, getClick } from 'support/helpers';
import { Linode, Firewall, FirewallRuleType } from '@linode/api-v4/types';
import { firewallFactory, firewallRuleFactory } from 'src/factories/firewalls';
import { interceptCreateFirewall } from 'support/intercepts/firewalls';
import { randomItem, randomString, randomLabel } from 'support/util/random';
import { fbtVisible, fbtClick } from 'support/helpers';
import { ui } from 'support/ui';
import { chooseRegion } from 'support/util/regions';

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

const firewall = firewallFactory.build({
  label: randomLabel(),
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
  ui.tabList.findTabByTitle('Linodes').should('be.visible').click();

  ui.button.findByTitle('Add Linodes to Firewall').should('be.visible').click();

  ui.drawer
    .findByTitle(`Add Linode to Firewall: ${firewall.label}`)
    .should('be.visible')
    .within(() => {
      // Fill out and submit firewall edit form.
      cy.get('[data-testid="textfield-input"]:last')
        .should('be.visible')
        .click()
        .type(linode.label);

      ui.autocompletePopper
        .findByTitle(linode.label)
        .should('be.visible')
        .click();

      ui.button.findByTitle('Add').should('be.visible').click();
    });
};

authenticate();
describe('update firewall', () => {
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

    firewall.label = randomLabel();

    cy.defer(createLinode(linodeRequest)).then((linode) => {
      interceptCreateFirewall().as('createFirewall');
      cy.visitWithLogin('/firewalls/create');

      ui.drawer
        .findByTitle('Create Firewall')
        .should('be.visible')
        .within(() => {
          // Fill out and submit firewall create form.
          containsClick('Label').type(firewall.label);
          getClick('[data-testid="create-firewall-submit"]');
        });

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
      ui.button
        .findByTitle('Save Changes')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Go back to landing page and check rules are added to the firewall
      cy.wait(100);
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
      ui.button
        .findByTitle('Save Changes')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Go back to landing page and check rules are removed to the firewall
      cy.wait(100);
      cy.visitWithLogin('/firewalls');
      cy.findByText(firewall.label)
        .closest('tr')
        .within(() => {
          cy.findByText('No rules').should('be.visible');
        });

      // Go to the firewalls edit page
      cy.findByText(firewall.label).click();

      // Confirm that the firewall can be assigned to the linode
      addLinodesToFirewall(firewall, linode);
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
    const firewall = {
      label: randomLabel(),
      region: chooseRegion().id,
    };

    interceptCreateFirewall().as('createFirewall');
    cy.visitWithLogin('/firewalls/create');

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        // An error message appears when attempting to create a Firewall without a label
        getClick('[data-testid="create-firewall-submit"]');
        cy.findByText('Label is required.');
        // Fill out and submit firewall create form.
        containsClick('Label').type(firewall.label);
        getClick('[data-testid="create-firewall-submit"]');
      });

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

    // Click 'disable' button and confirms
    cy.findByText(firewall.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        fbtVisible('Disable');
        fbtClick('Disable');
      });

    // Confirm disabling.
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

    // The firewall status changes to 'Disabled'
    cy.findByText(firewall.label)
      .closest('tr')
      .within(() => {
        cy.findByText('Disabled').should('be.visible');
      });

    cy.visitWithLogin('/firewalls');

    // Click 'enable' button and confirms
    cy.findByText(firewall.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        fbtVisible('Enable');
        fbtClick('Enable');
      });

    // Confirm enabing.
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

    // The firewall status changes to 'Enabled'
    cy.findByText(firewall.label)
      .closest('tr')
      .within(() => {
        cy.findByText('Enabled').should('be.visible');
      });
  });
});
