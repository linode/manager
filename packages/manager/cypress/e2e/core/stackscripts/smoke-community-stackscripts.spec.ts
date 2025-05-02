import { getProfile } from '@linode/api-v4';
import { authenticate } from 'support/api/authentication';
import { interceptCreateLinode } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import {
  interceptGetStackScripts,
  mockGetStackScript,
  mockGetStackScripts,
} from 'support/intercepts/stackscripts';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { randomLabel, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { stackScriptFactory } from 'src/factories';
import { formatDate } from 'src/utilities/formatDate';

import type { Profile, StackScript } from '@linode/api-v4';

const mockStackScripts: StackScript[] = [
  stackScriptFactory.build({
    created: '2019-05-23T16:21:41',
    deployments_active: 238,
    deployments_total: 4400,
    description:
      'Blazing-fast WordPress with LSCache, 300+ times faster than regular WordPress\n\nOpenLiteSpeed is the Open Source edition of LiteSpeed Web Server Enterprise and contains all of the essential features. OLS provides enormous scalability, and an accelerated hosting platform for WordPress. \n\nWhole process maybe take up to 10 minutes to finish. ',
    id: 443929,
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
      'linode/ubuntu24.04',
      'linode/almalinux9',
      'linode/rocky9',
    ],
    is_public: true,
    label: 'OpenLiteSpeed-WordPress',
    logo_url: '',
    mine: false,
    ordinal: 0,
    rev_note: 'add more OS',
    script:
      '#!/bin/bash\n### linode\n### Install OpenLiteSpeed and WordPress\nbash <( curl -sk https://raw.githubusercontent.com/litespeedtech/ls-cloud-image/master/Setup/wpimgsetup.sh )\n### Regenerate password for Web Admin, Database, setup Welcome Message\nbash <( curl -sk https://raw.githubusercontent.com/litespeedtech/ls-cloud-image/master/Cloud-init/per-instance.sh )\n### Reboot server\nreboot\n',
    updated: '2023-08-22T16:41:48',
    user_defined_fields: [],
    user_gravatar_id: 'f7360fb588b5f65d81ee1afe11b6c0ad',
    username: 'litespeed',
  }),
  stackScriptFactory.build({
    created: '2017-02-07T02:28:49',
    deployments_active: 13,
    deployments_total: 35469,
    description: 'Auto setup Squid Proxy Server on Ubuntu 16.04 LTS',
    id: 68166,
    images: ['linode/ubuntu16.04lts'],
    is_public: true,
    label: 'Squid Proxy Server',
    logo_url: '',
    mine: false,
    ordinal: 0,
    rev_note: 'Initial import',
    script:
      '#!/bin/bash\n# <UDF name="squid_user" Label="Proxy Username" />\n# <UDF name="squid_password" Label="Proxy Password" />\n# Squid Proxy Server\n# Author: admin@serverok.in\n# Blog: https://www.serverok.in\n\n\n/usr/bin/apt update\n/usr/bin/apt -y install apache2-utils squid3\n\n/usr/bin/htpasswd -b -c /etc/squid/passwd $SQUID_USER $SQUID_PASSWORD\n\n/bin/rm -f /etc/squid/squid.conf\n/usr/bin/touch /etc/squid/blacklist.acl\n/usr/bin/wget --no-check-certificate -O /etc/squid/squid.conf https://raw.githubusercontent.com/hostonnet/squid-proxy-installer/master/squid.conf\n\n/sbin/iptables -I INPUT -p tcp --dport 3128 -j ACCEPT\n/sbin/iptables-save\n\nservice squid restart\nupdate-rc.d squid defaults',
    updated: '2023-08-07T02:34:15',
    user_defined_fields: [
      {
        label: 'Proxy Username',
        name: 'squid_user',
      },
      {
        label: 'Proxy Password',
        name: 'squid_password',
      },
    ],
    user_gravatar_id: '8c2562f63286df4f8aae5babe5920ade',
    username: 'serverok',
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

    // Confirm that empty state is not shown.
    cy.get('[data-qa-placeholder-container="resources-section"]').should(
      'not.exist'
    );
    cy.findByText('Automate deployment scripts').should('not.exist');

    cy.defer(getProfile, 'getting profile').then((profile: Profile) => {
      const dateFormatOptionsLanding = {
        displayTime: false,
        timezone: profile.timezone,
      };

      const dateFormatOptionsDetails = {
        displayTime: true,
        timezone: profile.timezone,
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
      cy.findByPlaceholderText(
        'Search by Label, Username, or Description'
      ).click();
      cy.focused().type(`${stackScript.label}{enter}`);
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
    cy.tag('method:e2e', 'env:stackScripts');
    interceptGetStackScripts().as('getStackScripts');

    // Fetch all public Images to later use while filtering StackScripts.
    cy.visitWithLogin('/stackscripts/community');
    cy.wait('@getStackScripts');

    // Confirm that empty state is not shown.
    cy.get('[data-qa-placeholder-container="resources-section"]').should(
      'not.exist'
    );
    cy.findByText('Automate deployment scripts').should('not.exist');

    // Confirm that scrolling to the bottom of the StackScripts list causes
    // pagination to occur automatically. Perform this check 3 times.
    for (let i = 0; i < 3; i += 1) {
      cy.findByLabelText('List of StackScripts')
        .should('be.visible')
        .within(() => {
          // Scroll to the bottom of the StackScripts list, confirm Cloud fetches StackScripts,
          // then confirm that list updates with the new StackScripts shown.
          cy.get('tr').last().scrollIntoView();
          cy.wait('@getStackScripts').then((xhr) => {
            const stackScripts = xhr.response?.body['data'] as
              | StackScript[]
              | undefined;

            if (!stackScripts) {
              throw new Error(
                'Unexpected response received when fetching StackScripts'
              );
            }

            cy.contains(
              `${stackScripts[0].username} / ${stackScripts[0].label}`
            ).should('be.visible');
          });
        });
    }
  });

  /*
   * - Searhes Community StackScripts in the landing page.
   * - Confirms that search can filter the expected results.
   */
  it('search function filters results correctly', () => {
    cy.tag('method:e2e', 'env:stackScripts');
    const stackScript = mockStackScripts[0];

    interceptGetStackScripts().as('getStackScripts');
    cy.visitWithLogin('/stackscripts/community');
    cy.wait('@getStackScripts');

    // Confirm that empty state is not shown.
    cy.get('[data-qa-placeholder-container="resources-section"]').should(
      'not.exist'
    );
    cy.findByText('Automate deployment scripts').should('not.exist');

    cy.get('tr').then((value) => {
      const rowCount = Cypress.$(value).length - 1; // Remove the table title row

      cy.findByPlaceholderText(
        'Search by Label, Username, or Description'
      ).click();
      cy.focused().type(`${stackScript.label}{enter}`);
      cy.get(`[data-qa-table-row="${stackScript.label}"]`).should('be.visible');

      cy.get('tr').its('length').should('be.lt', rowCount);
    });
  });

  /*
   * - Deploys a Linode from Community StackScripts.
   * - Confirms that the deployment flow works.
   */
  it('deploys a new linode as expected', () => {
    cy.tag('method:e2e', 'env:stackScripts');
    const stackScriptId = '37239';
    const stackScriptName = 'setup-ipsec-vpn';
    const sharedKey = randomString();
    const vpnUser = randomLabel();
    const vpnPassword = randomString(16);
    const weakPassword = '123';
    const fairPassword = 'Akamai123';
    const rootPassword = randomString(16);
    const image = 'AlmaLinux 9';
    const region = chooseRegion({ capabilities: ['Vlans'] });
    const linodeLabel = randomLabel();

    // Ensure that the Primary Nav is open
    mockGetUserPreferences({ desktop_sidebar_open: false }).as(
      'getPreferences'
    );
    interceptGetStackScripts().as('getStackScripts');
    cy.visitWithLogin('/stackscripts/community');
    cy.wait(['@getStackScripts', '@getPreferences']);

    cy.findByPlaceholderText(
      'Search by Label, Username, or Description'
    ).click();
    cy.focused().type(`${stackScriptName}{enter}`);
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
    cy.get('[id="ipsec-pre-shared-key"]').should('be.visible').click();
    cy.focused().type(`${sharedKey}{enter}`);
    cy.get('[id="vpn-username"]').should('be.visible').click();
    cy.focused().type(`${vpnUser}{enter}`);
    cy.get('[id="vpn-password"]').should('be.visible').click();
    cy.focused().type(`${vpnPassword}{enter}`);

    // Check each field should persist when moving onto another field
    cy.get('[id="ipsec-pre-shared-key"]').should('have.value', sharedKey);
    cy.get('[id="vpn-username"]').should('have.value', vpnUser);
    cy.get('[id="vpn-password"]').should('have.value', vpnPassword);

    // Choose an image
    cy.findByPlaceholderText('Choose an image').should('be.visible').click();
    cy.focused().type(image);
    ui.autocompletePopper.findByTitle(image).should('be.visible').click();

    cy.findByText(image).should('be.visible').click();

    // Choose a region
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();
    // An error message shows up when no region is selected
    cy.contains('Region is required.').should('be.visible');
    ui.regionSelect.find().click();
    cy.focused().type(`${region.id}{enter}`);

    // Choose a plan
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Enter a label.
    cy.findByText('Linode Label').should('be.visible').click();
    cy.focused().type('{selectAll}{backspace}');
    cy.focused().type(linodeLabel);

    // An error message shows up when no region is selected
    cy.contains('Plan is required.').should('be.visible');
    cy.get('[data-qa-plan-row="Dedicated 8 GB"]')
      .closest('tr')
      .within(() => {
        cy.get('[data-qa-radio]').click();
      });

    // Input root password
    // Weak or fair root password cannot rebuild the linode
    cy.get('[id="root-password"]').clear();
    cy.focused().type(weakPassword);
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.findByText('Password does not meet', { exact: false }).should(
      'be.visible'
    );

    cy.get('[id="root-password"]').clear();
    cy.focused().type(fairPassword);
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.findByText('Password does not meet', { exact: false }).should(
      'be.visible'
    );

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
