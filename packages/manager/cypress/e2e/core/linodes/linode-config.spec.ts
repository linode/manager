import { createLinode } from 'support/api/linodes';
import { containsVisible } from 'support/helpers';
import { ui } from 'support/ui';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { mockGetVPC, mockGetVPCs } from 'support/intercepts/vpc';
import { dcPricingMockLinodeTypes } from 'support/constants/dc-specific-pricing';
import { getRegionById } from 'support/util/regions';
import { mockGetVLANs } from 'support/intercepts/vlans';
import {
  interceptRebootLinode,
  mockGetLinodeDetails,
  mockGetLinodeDisks,
  mockGetLinodeVolumes,
} from 'support/intercepts/linodes';
import {
  interceptDeleteLinodeConfig,
  interceptCreateLinodeConfigs,
  interceptUpdateLinodeConfigs,
  mockGetLinodeConfigs,
  mockCreateLinodeConfigs,
  mockUpdateLinodeConfigs,
} from 'support/intercepts/configs';
import {
  createLinodeAndGetConfig,
  createAndBootLinode,
} from 'support/util/linodes';
import {
  vpcFactory,
  linodeFactory,
  linodeConfigFactory,
  VLANFactory,
} from '@src/factories';
import { randomNumber, randomLabel } from 'support/util/random';

import type { Config, Linode, VLAN, VPC, Disk, Region } from '@linode/api-v4';

authenticate();

describe('Linode Config', () => {
  const region: Region = getRegionById('us-southeast');
  const diskLabel: string = 'Debian 10 Disk';
  const mockConfig: Config = linodeConfigFactory.build({
    id: randomNumber(),
  });
  const mockDisks: Disk[] = [
    {
      id: 44311273,
      status: 'ready',
      label: diskLabel,
      created: '2020-08-21T17:26:14',
      updated: '2020-08-21T17:26:30',
      filesystem: 'ext4',
      size: 81408,
    },
    {
      id: 44311274,
      status: 'ready',
      label: '512 MB Swap Image',
      created: '2020-08-21T17:26:14',
      updated: '2020-08-21T17:26:31',
      filesystem: 'swap',
      size: 512,
    },
  ];
  const mockVLANs: VLAN[] = VLANFactory.buildList(2);
  const mockVPCs: VPC[] = vpcFactory.buildList(5);

  before(() => {
    mockConfig.interfaces.splice(2, 1);
  });

  beforeEach(() => {
    cleanUp(['linodes']);
  });

  it('Creates a new config and list all configs', () => {
    createLinode().then((linode: Linode) => {
      interceptCreateLinodeConfigs(linode.id).as('postLinodeConfigs');

      cy.visitWithLogin(`/linodes/${linode.id}/configurations`);

      cy.findByLabelText('List of Configurations').within(() => {
        containsVisible('My Debian 10 Disk Profile – GRUB 2');
      });
      containsVisible('My Debian 10 Disk Profile – GRUB 2');

      cy.findByText('Add Configuration').click();
      ui.dialog
        .findByTitle('Add Configuration')
        .should('be.visible')
        .within(() => {
          cy.get('#label').type(`${linode.id}-test-config`);
          ui.buttonGroup
            .findButtonByTitle('Add Configuration')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@postLinodeConfigs')
        .its('response.statusCode')
        .should('eq', 200);

      cy.findByLabelText('List of Configurations').within(() => {
        cy.get('tr').should('have.length', 2);
        containsVisible(
          `${linode.id}-test-config – Latest 64 bit (6.2.9-x86_64-linode160)`
        );
        containsVisible('eth0 – Public Internet');
      });
    });
  });

  it('Creates a new config and assigns a VPC as a network interface', () => {
    const mockLinode = linodeFactory.build({
      region: region.id,
      type: dcPricingMockLinodeTypes[0].id,
    });

    const mockVPC = vpcFactory.build({
      id: 1,
      label: randomLabel(),
    });

    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockAppendFeatureFlags({
      vpc: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    mockGetVPCs(mockVPCs).as('getVPCs');
    mockGetLinodeDisks(mockLinode.id, mockDisks).as('getDisks');
    mockGetLinodeConfigs(mockLinode.id, []);
    mockGetVPC(mockVPC).as('getVPC');
    mockGetLinodeVolumes(mockLinode.id, []).as('getVolumes');

    cy.visitWithLogin(`/linodes/${mockLinode.id}/configurations`);
    cy.wait([
      '@getClientStream',
      '@getFeatureFlags',
      '@getLinode',
      '@getVPCs',
      '@getDisks',
      '@getVolumes',
    ]);

    // Confirm that there is no configuration yet.
    cy.findByLabelText('List of Configurations').within(() => {
      cy.contains(`${mockConfig.label} – GRUB 2`).should('not.exist');
    });

    mockGetVLANs(mockVLANs);
    mockGetVPC(mockVPC).as('getVPC');
    mockCreateLinodeConfigs(mockLinode.id, mockConfig).as('createLinodeConfig');
    mockGetLinodeConfigs(mockLinode.id, [mockConfig]).as('getLinodeConfigs');
    cy.findByText('Add Configuration').click();
    ui.dialog
      .findByTitle('Add Configuration')
      .should('be.visible')
      .within(() => {
        cy.get('#label').type(`${mockConfig.label}`);
        // Confirm that "VPC" can be selected for either "eth0", "eth1", or "eth2".
        // Add VPC to eth0
        cy.get('[data-qa-textfield-label="eth0"]')
          .scrollIntoView()
          .parent()
          .parent()
          .within(() => {
            ui.select
              .findByText('Public Internet')
              .should('be.visible')
              .click()
              .type('VPC{enter}');
          });
        // Add VPC to eth1
        cy.get('[data-qa-textfield-label="eth1"]')
          .scrollIntoView()
          .parent()
          .parent()
          .within(() => {
            ui.select
              .findByText('None')
              .should('be.visible')
              .click()
              .type('VPC{enter}');
          });
        // Add VPC to eth2
        cy.get('[data-qa-textfield-label="eth2"]')
          .scrollIntoView()
          .parent()
          .parent()
          .within(() => {
            ui.select
              .findByText('None')
              .should('be.visible')
              .click()
              .type('VPC{enter}');
          });
        ui.buttonGroup
          .findButtonByTitle('Add Configuration')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    cy.wait(['@createLinodeConfig', '@getLinodeConfigs', '@getVPC']);

    // Confirm that VLAN and VPC have been assigned.
    cy.findByLabelText('List of Configurations').within(() => {
      cy.get('tr').should('have.length', 2);
      containsVisible(`${mockConfig.label} – GRUB 2`);
      containsVisible('eth0 – Public Internet');
      containsVisible(`eth2 – VPC: ${mockVPC.label}`);
    });
  });

  it('Edits an existing config', () => {
    cy.defer(
      createLinodeAndGetConfig({
        waitForLinodeToBeRunning: false,
        linodeConfigRequestOverride: {
          label: 'cy-test-edit-config-linode',
          interfaces: [
            {
              ipam_address: '',
              label: '',
              purpose: 'public',
            },
            {
              ipam_address: '',
              label: 'testvlan',
              purpose: 'vlan',
            },
          ],
          region: 'us-east',
        },
      }),
      'creating a linode and getting its config'
    ).then(([linode, config]: [Linode, Config]) => {
      cy.visitWithLogin(`/linodes/${linode.id}/configurations`);
      interceptUpdateLinodeConfigs(linode.id, config.id).as('putLinodeConfigs');

      containsVisible('My Debian 10 Disk Profile – GRUB 2');
      cy.findByText('Edit').click();

      ui.dialog
        .findByTitle('Edit Configuration')
        .should('be.visible')
        .within(() => {
          cy.get('#ipam-input-1').type('192.0.2.0/25');
          ui.button
            .findByTitle('Save Changes')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@putLinodeConfigs').its('response.statusCode').should('eq', 200);

      cy.findByLabelText('List of Configurations').within(() => {
        containsVisible('eth0 – Public Internet');
        containsVisible('eth1 – VLAN: testvlan (192.0.2.0/25)');
      });
    });
  });

  it('Edits an existing config and assigns a VPC as a network interface', () => {
    const mockLinode = linodeFactory.build({
      region: region.id,
      type: dcPricingMockLinodeTypes[0].id,
    });

    const mockVPC = vpcFactory.build({
      id: 1,
      label: randomLabel(),
    });

    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockAppendFeatureFlags({
      vpc: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    mockGetVPCs(mockVPCs).as('getVPCs');
    mockGetLinodeDisks(mockLinode.id, mockDisks).as('getDisks');
    mockGetLinodeConfigs(mockLinode.id, [mockConfig]).as('getConfig');
    mockGetVPC(mockVPC).as('getVPC');
    mockGetLinodeVolumes(mockLinode.id, []).as('getVolumes');

    cy.visitWithLogin(`/linodes/${mockLinode.id}/configurations`);
    cy.wait([
      '@getClientStream',
      '@getFeatureFlags',
      '@getLinode',
      '@getConfig',
      '@getVPCs',
      '@getDisks',
      '@getVolumes',
    ]);

    cy.findByLabelText('List of Configurations').within(() => {
      containsVisible(`${mockConfig.label} – GRUB 2`);
    });
    cy.findByText('Edit').click();

    mockGetVLANs(mockVLANs);
    mockGetVPC(mockVPC).as('getVPC');
    mockUpdateLinodeConfigs(mockLinode.id, mockConfig).as(
      'updateLinodeConfigs'
    );
    mockGetLinodeConfigs(mockLinode.id, [mockConfig]).as('getLinodeConfigs');
    ui.dialog
      .findByTitle('Edit Configuration')
      .should('be.visible')
      .within(() => {
        // Change eth0 to VPC
        cy.get('[data-qa-textfield-label="eth0"]')
          .scrollIntoView()
          .parent()
          .parent()
          .within(() => {
            ui.select
              .findByText('Public Internet')
              .should('be.visible')
              .click()
              .type('VPC{enter}');
          });
        // Change eth1 to VPC
        cy.get('[data-qa-textfield-label="eth1"]')
          .scrollIntoView()
          .parent()
          .parent()
          .within(() => {
            ui.select
              .findByText('VLAN')
              .should('be.visible')
              .click()
              .type('VPC{enter}');
          });
        // Change eth2 to VPC
        cy.get('[data-qa-textfield-label="eth2"]')
          .scrollIntoView()
          .parent()
          .parent()
          .within(() => {
            ui.select
              .findByText('VPC')
              .should('be.visible')
              .click()
              .type('VPC{enter}');
          });
        ui.button
          .findByTitle('Save Changes')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    cy.wait(['@updateLinodeConfigs', '@getLinodeConfigs', '@getVPC']);

    // Confirm that VLAN and VPC have been assigned.
    cy.findByLabelText('List of Configurations').within(() => {
      cy.get('tr').should('have.length', 2);
      containsVisible(`${mockConfig.label} – GRUB 2`);
      containsVisible('eth0 – Public Internet');
      containsVisible(`eth2 – VPC: ${mockVPC.label}`);
    });
  });

  it('Boots an existing config', () => {
    cy.defer(createAndBootLinode()).then((linode: Linode) => {
      cy.visitWithLogin(`/linodes/${linode.id}/configurations`);
      interceptRebootLinode(linode.id).as('rebootLinode');

      containsVisible('My Debian 10 Disk Profile – GRUB 2');
      cy.findByText('Boot').click();

      ui.dialog
        .findByTitle('Confirm Boot')
        .should('be.visible')
        .within(() => {
          containsVisible(
            'Are you sure you want to boot "My Debian 10 Disk Profile"?'
          );
          ui.button
            .findByTitle('Boot')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@rebootLinode').its('response.statusCode').should('eq', 200);

      ui.toast.assertMessage(
        'Successfully booted config My Debian 10 Disk Profile'
      );
      cy.findByText('REBOOTING').should('be.visible');
    });
  });

  it('Clones an existing config', () => {
    // Create a destination Linode to clone to
    // And delete the default config
    createLinode({
      label: 'cy-test-clone-destination-linode',
    }).then((linode: Linode) => {
      cy.visitWithLogin(`/linodes/${linode.id}/configurations`);

      ui.actionMenu
        .findByTitle('Action menu for Linode Config My Debian 10 Disk Profile')
        .should('be.visible')
        .click();
      ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

      ui.dialog
        .findByTitle('Confirm Delete')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Delete')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      ui.toast.assertMessage(
        'Configuration My Debian 10 Disk Profile successfully deleted'
      );
      cy.findByLabelText('List of Configurations').within(() => {
        containsVisible('No data to display.');
      });

      // Create a source Linode to clone from
      cy.defer(
        createLinodeAndGetConfig({
          waitForLinodeToBeRunning: true,
          linodeConfigRequestOverride: {
            label: 'cy-test-clone-origin-linode',
          },
        }),
        'creating a linode and getting its config'
      ).then(([linode, config]: [Linode, Config]) => {
        interceptDeleteLinodeConfig(linode.id, config.id).as(
          'deleteLinodeConfig'
        );
        cy.visitWithLogin(`/linodes/${linode.id}/configurations`);

        // Add a sharable config to the source Linode
        cy.findByText('Add Configuration').click();
        ui.dialog
          .findByTitle('Add Configuration')
          .should('be.visible')
          .within(() => {
            cy.get('#label').type(`sharable-configuration`);
            ui.buttonGroup
              .findButtonByTitle('Add Configuration')
              .scrollIntoView()
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        cy.findByLabelText('List of Configurations').within(() => {
          cy.get('tr').should('have.length', 2);
          containsVisible(
            `sharable-configuration – Latest 64 bit (6.2.9-x86_64-linode160)`
          );
          containsVisible('eth0 – Public Internet');
        });

        // Clone the thing
        ui.actionMenu
          .findByTitle('Action menu for Linode Config sharable-configuration')
          .should('be.visible')
          .click();
        ui.actionMenuItem.findByTitle('Clone').should('be.visible').click();

        cy.findByTestId('config-clone-selection-details')
          .should('be.visible')
          .within(() => {
            ui.button.findByTitle('Clone').should('be.disabled');
            cy.findByRole('combobox').should('be.visible').click();
            ui.select
              .findItemByText('cy-test-clone-destination-linode')
              .click();
            ui.button.findByTitle('Clone').should('be.enabled').click();
          });

        ui.toast.assertMessage(
          'Linode cy-test-clone-origin-linode successfully cloned to cy-test-clone-destination-linode.'
        );
      });
    });
  });

  it('Deletes an existing config', () => {
    cy.defer(
      createLinodeAndGetConfig({
        linodeConfigRequestOverride: {
          label: 'cy-test-delete-config-linode',
        },
      }),
      'creating a linode and getting its config'
    ).then(([linode, config]: [Linode, Config]) => {
      interceptDeleteLinodeConfig(linode.id, config.id).as(
        'deleteLinodeConfig'
      );
      cy.visitWithLogin(`/linodes/${linode.id}/configurations`);

      containsVisible('My Debian 10 Disk Profile – GRUB 2');
      ui.actionMenu
        .findByTitle('Action menu for Linode Config My Debian 10 Disk Profile')
        .should('be.visible')
        .click();
      ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

      ui.dialog
        .findByTitle('Confirm Delete')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Delete')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@deleteLinodeConfig')
        .its('response.statusCode')
        .should('eq', 200);
      ui.toast.assertMessage(
        'Configuration My Debian 10 Disk Profile successfully deleted'
      );
      cy.findByLabelText('List of Configurations').within(() => {
        containsVisible('No data to display.');
      });
    });
  });
});
