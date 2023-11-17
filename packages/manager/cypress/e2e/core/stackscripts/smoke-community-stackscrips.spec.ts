import { authenticate } from 'support/api/authentication';
import { stackScriptFactory } from 'src/factories';
import {
  interceptGetStackScripts,
  mockGetStackScripts,
  mockGetStackScript,
} from 'support/intercepts/stackscripts';
import { containsClick } from 'support/helpers';
import { ui } from 'support/ui';
import { randomLabel, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { cleanUp } from 'support/util/cleanup';
import { interceptCreateLinode } from 'support/intercepts/linodes';
import { getProfile } from '@linode/api-v4/lib';
import { Profile, StackScript } from '@linode/api-v4/types';
import { formatDate } from '@src/utilities/formatDate';

const mockStackScripts: StackScript[] = [
  stackScriptFactory.build({
    id: 443929,
    username: 'litespeed',
    user_gravatar_id: 'f7360fb588b5f65d81ee1afe11b6c0ad',
    label: 'OpenLiteSpeed-WordPress',
    description:
      'Blazing-fast WordPress with LSCache, 300+ times faster than regular WordPress\n\nOpenLiteSpeed is the Open Source edition of LiteSpeed Web Server Enterprise and contains all of the essential features. OLS provides enormous scalability, and an accelerated hosting platform for WordPress. \n\nWhole process maybe take up to 10 minutes to finish. ',
    ordinal: 0,
    logo_url: '',
    images: [
      'linode/centos7',
      'linode/debian9',
      'linode/ubuntu18.04',
      'linode/debian10',
      'linode/centos8',
      'linode/ubuntu20.04',
      'linode/centos-stream8',
      'linode/almalinux8',
      'linode/rocky8',
      'linode/debian11',
      'linode/centos-stream9',
      'linode/ubuntu22.04',
      'linode/almalinux9',
      'linode/rocky9',
    ],
    deployments_total: 4400,
    deployments_active: 238,
    is_public: true,
    mine: false,
    created: '2019-05-23T16:21:41',
    updated: '2023-08-22T16:41:48',
    rev_note: 'add more OS',
    script:
      '#!/bin/bash\n### linode\n### Install OpenLiteSpeed and WordPress\nbash <( curl -sk https://raw.githubusercontent.com/litespeedtech/ls-cloud-image/master/Setup/wpimgsetup.sh )\n### Regenerate password for Web Admin, Database, setup Welcome Message\nbash <( curl -sk https://raw.githubusercontent.com/litespeedtech/ls-cloud-image/master/Cloud-init/per-instance.sh )\n### Reboot server\nreboot\n',
    user_defined_fields: [],
  }),
  stackScriptFactory.build({
    id: 68166,
    username: 'serverok',
    user_gravatar_id: '8c2562f63286df4f8aae5babe5920ade',
    label: 'Squid Proxy Server',
    description: 'Auto setup Squid Proxy Server on Ubuntu 16.04 LTS',
    ordinal: 0,
    logo_url: '',
    images: ['linode/ubuntu16.04lts'],
    deployments_total: 35469,
    deployments_active: 13,
    is_public: true,
    mine: false,
    created: '2017-02-07T02:28:49',
    updated: '2023-08-07T02:34:15',
    rev_note: 'Initial import',
    script:
      '#!/bin/bash\n# <UDF name="squid_user" Label="Proxy Username" />\n# <UDF name="squid_password" Label="Proxy Password" />\n# Squid Proxy Server\n# Author: admin@serverok.in\n# Blog: https://www.serverok.in\n\n\n/usr/bin/apt update\n/usr/bin/apt -y install apache2-utils squid3\n\n/usr/bin/htpasswd -b -c /etc/squid/passwd $SQUID_USER $SQUID_PASSWORD\n\n/bin/rm -f /etc/squid/squid.conf\n/usr/bin/touch /etc/squid/blacklist.acl\n/usr/bin/wget --no-check-certificate -O /etc/squid/squid.conf https://raw.githubusercontent.com/hostonnet/squid-proxy-installer/master/squid.conf\n\n/sbin/iptables -I INPUT -p tcp --dport 3128 -j ACCEPT\n/sbin/iptables-save\n\nservice squid restart\nupdate-rc.d squid defaults',
    user_defined_fields: [
      {
        name: 'squid_user',
        label: 'Proxy Username',
      },
      {
        name: 'squid_password',
        label: 'Proxy Password',
      },
    ],
  }),
];

authenticate();
describe('Community Stackscripts integration tests', () => {
  before(() => {
    cleanUp(['linodes']);
  });

  /*
   * - Displays Community StackScripts in the landing page.
   * - Confirms that Community page is not empty.
   */
  it('displays Community StackScripts with expected flows', () => {
    const stackScript = mockStackScripts[0];

    mockGetStackScripts(mockStackScripts).as('getStackScripts');
    cy.visitWithLogin('/stackscripts/community');
    cy.wait('@getStackScripts');

    cy.get('[data-qa-stackscript-empty-msg="true"]').should('not.exist');
    cy.findByText('Automate deployment scripts').should('not.exist');

    cy.defer(getProfile(), 'getting profile').then((profile: Profile) => {
      const dateFormatOptionsLanding = {
        timezone: profile.timezone,
        displayTime: false,
      };

      const dateFormatOptionsDetails = {
        timezone: profile.timezone,
        displayTime: true,
      };

      const updatedTimeLanding = formatDate(
        stackScript.updated,
        dateFormatOptionsLanding
      );
      const updatedTimeDetails = formatDate(
        stackScript.updated,
        dateFormatOptionsDetails
      );

      cy.get(`[data-qa-table-row="${stackScript.label}"]`)
        .should('be.visible')
        .within(() => {
          cy.findByText(stackScript.deployments_total).should('be.visible');
          cy.findByText(updatedTimeLanding).should('be.visible');
        });

      // Search the corresponding community stack script
      mockGetStackScripts([stackScript]).as('getFilteredStackScripts');
      cy.get('[id="search-by-label,-username,-or-description"]')
        .click()
        .type(`${stackScript.label}{enter}`);
      cy.wait('@getFilteredStackScripts');

      // Check filtered results
      cy.get(`[data-qa-table-row="${mockStackScripts[1].label}"]`).should(
        'not.exist'
      );

      mockGetStackScript(stackScript.id, stackScript).as('getStackScript');
      cy.get(`[href="/stackscripts/${stackScript.id}"]`)
        .should('be.visible')
        .click();
      cy.wait('@getStackScript');

      // Check the details page of the community stackscript
      cy.get(`[data-qa-stack-author="${stackScript.username}"]`).should(
        'be.visible'
      );
      cy.get('[data-qa-stack-deployments="true"]').within(() => {
        cy.findByText('deployments')
          .should('be.visible')
          .within(() => {
            cy.findByText(stackScript.deployments_total).should('be.visible');
          });
        cy.findByText('still active')
          .should('be.visible')
          .within(() => {
            cy.findByText(stackScript.deployments_active).should('be.visible');
          });
        cy.findByText('Last revision:')
          .should('be.visible')
          .parent()
          .within(() => {
            cy.findByText(updatedTimeDetails).should('be.visible');
          });
        cy.findByText('StackScript ID:')
          .should('be.visible')
          .parent()
          .within(() => {
            cy.findByText(stackScript.id).should('be.visible');
          });
      });
    });
  });

  /*
   * - Scrolls Community StackScripts landing page.
   * - Confirms that pagination works as expected.
   */
  it('pagination works with infinite scrolling', () => {
    interceptGetStackScripts().as('getStackScripts');
    cy.visitWithLogin('/stackscripts/community');
    cy.wait('@getStackScripts');

    cy.get('[data-qa-stackscript-empty-msg="true"]').should('not.exist');
    cy.findByText('Automate deployment scripts').should('not.exist');

    cy.get('tr').then((value) => {
      const rowCount = Cypress.$(value).length - 1; // Remove the table title row

      interceptGetStackScripts().as('getStackScripts1');
      cy.scrollTo(0, 500);
      cy.wait('@getStackScripts1');

      cy.get('tr').its('length').should('be.gt', rowCount);

      cy.get('tr').then((value) => {
        const rowCount = Cypress.$(value).length - 1;

        interceptGetStackScripts().as('getStackScripts2');
        cy.get('tr')
          .eq(rowCount)
          .scrollIntoView({ offset: { top: 150, left: 0 } });
        cy.wait('@getStackScripts2');

        cy.get('tr').its('length').should('be.gt', rowCount);
      });
    });
  });

  /*
   * - Searhes Community StackScripts in the landing page.
   * - Confirms that search can filter the expected results.
   */
  it('search function filters results correctly', () => {
    const stackScript = mockStackScripts[0];

    interceptGetStackScripts().as('getStackScripts');
    cy.visitWithLogin('/stackscripts/community');
    cy.wait('@getStackScripts');

    cy.get('[data-qa-stackscript-empty-msg="true"]').should('not.exist');
    cy.findByText('Automate deployment scripts').should('not.exist');

    cy.get('tr').then((value) => {
      const rowCount = Cypress.$(value).length - 1; // Remove the table title row

      cy.get('[id="search-by-label,-username,-or-description"]')
        .click()
        .type(`${stackScript.label}{enter}`);
      cy.get(`[data-qa-table-row="${stackScript.label}"]`).should('be.visible');

      cy.get('tr').its('length').should('be.lt', rowCount);
    });
  });

  /*
   * - Deploys a Linode from Community StackScripts.
   * - Confirms that the deployment flow works.
   */
  it('deploys a new linode as expected', () => {
    const stackScriptId = '37239';
    const stackScriptName = 'setup-ipsec-vpn';
    const sharedKey = randomString();
    const vpnUser = randomLabel();
    const vpnPassword = randomString(16);
    const weakPassword = '123';
    const fairPassword = 'Akamai123';
    const rootPassword = randomString(16);
    const image = 'AlmaLinux 9';
    const region = chooseRegion();
    const linodeLabel = randomLabel();

    interceptGetStackScripts().as('getStackScripts');
    cy.visitWithLogin('/stackscripts/community');
    cy.wait('@getStackScripts');

    cy.get('[id="search-by-label,-username,-or-description"]')
      .click()
      .type(`${stackScriptName}{enter}`);
    cy.get(`[data-qa-table-row="${stackScriptName}"]`)
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Deploy New Linode')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.url().should(
          'endWith',
          `linodes/create?type=StackScripts&subtype=Community&stackScriptID=${stackScriptId}`
        );
      });

    ui.nav.findItemByTitle('StackScripts').should('be.visible').click();

    ui.tabList
      .findTabByTitle('Community StackScripts')
      .should('be.visible')
      .click();

    cy.url().should('endWith', '/stackscripts/community');

    cy.get(`[href="/stackscripts/${stackScriptId}"]`)
      .should('be.visible')
      .click();
    ui.button
      .findByTitle('Deploy New Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.url().should(
      'endWith',
      `linodes/create?type=StackScripts&subtype=Community&stackScriptID=${stackScriptId}`
    );

    // Input VPN information
    cy.get('[id="ipsec-pre-shared-key"]')
      .should('be.visible')
      .click()
      .type(`${sharedKey}{enter}`);
    cy.get('[id="vpn-username"]')
      .should('be.visible')
      .click()
      .type(`${vpnUser}{enter}`);
    cy.get('[id="vpn-password"]')
      .should('be.visible')
      .click()
      .type(`${vpnPassword}{enter}`);

    // Check each field should persist when moving onto another field
    cy.get('[id="ipsec-pre-shared-key"]').should('have.value', sharedKey);
    cy.get('[id="vpn-username"]').should('have.value', vpnUser);
    cy.get('[id="vpn-password"]').should('have.value', vpnPassword);

    // Choose an image
    cy.get('[data-qa-enhanced-select="Choose an image"]').within(() => {
      containsClick('Choose an image').type(`${image}{enter}`);
    });

    // Choose a region
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();
    // An error message shows up when no region is selected
    cy.contains('Region is required.').should('be.visible');
    ui.regionSelect.find().click().type(`${region.id}{enter}`);

    // Choose a plan
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Enter a label.
    cy.findByText('Linode Label')
      .should('be.visible')
      .click()
      .type('{selectAll}{backspace}')
      .type(linodeLabel);

    // An error message shows up when no region is selected
    cy.contains('Plan is required.').should('be.visible');
    cy.get('[data-qa-plan-row="Dedicated 8 GB"]')
      .closest('tr')
      .within(() => {
        cy.get('[data-qa-radio]').click();
      });

    // Input root password
    // Weak or fair root password cannot rebuild the linode
    cy.get('[id="root-password"]').clear().type(weakPassword);
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.contains('Password does not meet complexity requirements.');

    cy.get('[id="root-password"]').clear().type(fairPassword);
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.contains('Password does not meet complexity requirements.');

    // Only strong password is allowed to rebuild the linode
    cy.get('[id="root-password"]').type(rootPassword);
    interceptCreateLinode().as('createLinode');

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createLinode');
    ui.toast.assertMessage(`Your Linode ${linodeLabel} is being created.`);
  });
});
