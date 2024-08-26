import { createTestLinode } from 'support/util/linodes';
import { ui } from 'support/ui';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import { mockGetVPC, mockGetVPCs } from 'support/intercepts/vpc';
import { dcPricingMockLinodeTypes } from 'support/constants/dc-specific-pricing';
import { chooseRegion, getRegionById } from 'support/util/regions';
import { mockGetVLANs } from 'support/intercepts/vlans';
import {
  interceptRebootLinode,
  mockGetLinodeDetails,
  mockGetLinodeDisks,
  mockGetLinodeKernels,
  mockGetLinodeVolumes,
  mockGetLinodeKernel,
} from 'support/intercepts/linodes';
import {
  interceptGetLinodeConfigs,
  interceptDeleteLinodeConfig,
  interceptCreateLinodeConfigs,
  interceptUpdateLinodeConfigs,
  mockGetLinodeConfigs,
  mockCreateLinodeConfigs,
  mockUpdateLinodeConfigs,
} from 'support/intercepts/configs';
import { fetchLinodeConfigs } from 'support/util/linodes';
import {
  kernelFactory,
  vpcFactory,
  linodeFactory,
  linodeConfigFactory,
  VLANFactory,
  LinodeConfigInterfaceFactory,
  LinodeConfigInterfaceFactoryWithVPC,
  subnetFactory,
} from '@src/factories';
import { randomNumber, randomLabel, randomIp } from 'support/util/random';
import { fetchAllKernels, findKernelById } from 'support/util/kernels';
import {
  LINODE_UNREACHABLE_HELPER_TEXT,
  NATTED_PUBLIC_IP_HELPER_TEXT,
  NOT_NATTED_HELPER_TEXT,
} from 'src/features/VPCs/constants';

import type { CreateTestLinodeOptions } from 'support/util/linodes';
import type {
  Config,
  CreateLinodeRequest,
  InterfacePurpose,
  Linode,
  VLAN,
  Region,
  Kernel,
} from '@linode/api-v4';

/**
 * Returns a Promise that resolves to a new test Linode and its first config object.
 *
 * @param interfaces - Interfaces with which to create test Linode.
 *
 * @throws If created Linode does not have any configs.
 */
const createLinodeAndGetConfig = async (
  payload?: Partial<CreateLinodeRequest> | null,
  options?: Partial<CreateTestLinodeOptions>
) => {
  const linode = await createTestLinode(payload, options);

  const config = (await fetchLinodeConfigs(linode.id))[0];
  if (!config) {
    throw new Error(
      `Linode '${linode.label}' (ID ${linode.id}) does not have any configs`
    );
  }

  return [linode, config];
};

let kernels: Kernel[] = [];
authenticate();
describe('Linode Config management', () => {
  describe('End-to-End', () => {
    before(() => {
      cleanUp('linodes');

      // Fetch Linode kernel data from the API.
      // We'll use this data in the tests to confirm that config labels are rendered correctly.
      cy.defer(() => fetchAllKernels(), 'Fetching Linode kernels...').then(
        (fetchedKernels) => {
          kernels = fetchedKernels;
        }
      );
    });

    /*
     * - Tests Linode config creation end-to-end using real API requests.
     * - Confirms that a config is listed after a Linode has been created.
     * - Confirms that config creation can be initiated and completed successfully.
     * - Confirms that new config is automatically listed after being created.
     */
    it('Creates a config', () => {
      // Wait for Linode to be created for kernel data to be retrieved.
      cy.defer(() => createTestLinode(), 'Creating Linode').then(
        (linode: Linode) => {
          interceptCreateLinodeConfigs(linode.id).as('postLinodeConfigs');
          interceptGetLinodeConfigs(linode.id).as('getLinodeConfigs');

          cy.visitWithLogin(`/linodes/${linode.id}/configurations`);

          // Confirm that initial config is listed in Linode configurations table.
          cy.wait('@getLinodeConfigs');
          cy.defer(() => fetchLinodeConfigs(linode.id)).then(
            (configs: Config[]) => {
              cy.findByLabelText('List of Configurations').within(() => {
                configs.forEach((config) => {
                  const kernel = findKernelById(kernels, config.kernel);
                  cy.findByText(`${config.label} – ${kernel.label}`).should(
                    'be.visible'
                  );
                });
              });
            }
          );

          // Add new configuration.
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

          // Confirm that config creation request was successful.
          cy.wait('@postLinodeConfigs')
            .its('response.statusCode')
            .should('eq', 200);

          // Confirm that new config and existing config are both listed.
          cy.wait('@getLinodeConfigs');
          cy.defer(() => fetchLinodeConfigs(linode.id)).then(
            (configs: Config[]) => {
              cy.findByLabelText('List of Configurations').within(() => {
                configs.forEach((config) => {
                  const kernel = findKernelById(kernels, config.kernel);
                  cy.findByText(`${config.label} – ${kernel.label}`)
                    .should('be.visible')
                    .closest('tr')
                    .within(() => {
                      cy.findByText('eth0 – Public Internet').should(
                        'be.visible'
                      );
                    });
                });
              });
            }
          );
        }
      );
    });

    /**
     * - Tests Linode config edit flow end-to-end using real API requests.
     * - Confirms that an existing config can be edited.
     * - Confirms that updated config data is automatically displayed after editing.
     */
    it('Edits a config', () => {
      // Config interfaces to use when creating test Linode.
      const interfaces = [
        {
          ipam_address: '',
          label: '',
          purpose: 'public' as InterfacePurpose,
        },
        {
          ipam_address: '',
          label: 'testvlan',
          purpose: 'vlan' as InterfacePurpose,
        },
      ];

      // Create a Linode and wait for its Config to be fetched before proceeding.
      cy.defer(
        () => createLinodeAndGetConfig({ interfaces }, { waitForDisks: true }),
        'creating a linode and getting its config'
      ).then(([linode, config]: [Linode, Config]) => {
        // Get kernel info for config.
        const kernel = findKernelById(kernels, config.kernel);
        const newIpamAddress = '192.0.2.0/25';

        cy.visitWithLogin(`/linodes/${linode.id}/configurations`);
        interceptUpdateLinodeConfigs(linode.id, config.id).as(
          'putLinodeConfigs'
        );

        // Confirm that config is listed as expected, then click "Edit".
        cy.contains(`${config.label} – ${kernel.label}`).should('be.visible');
        cy.findByText('Edit').click();

        // Enter a new IPAM address for eth1 (VLAN), then click "Save Changes"
        ui.dialog
          .findByTitle('Edit Configuration')
          .should('be.visible')
          .within(() => {
            cy.get('#ipam-input-1').type(newIpamAddress);
            ui.button
              .findByTitle('Save Changes')
              .scrollIntoView()
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm that config update request succeeded and that toast appears.
        cy.wait('@putLinodeConfigs')
          .its('response.statusCode')
          .should('eq', 200);
        ui.toast.assertMessage(
          `Configuration ${config.label} successfully updated`
        );

        // Confirm that updated IPAM is automatically listed in config table.
        cy.findByLabelText('List of Configurations').within(() => {
          const configKernel = findKernelById(kernels, config.kernel);
          cy.findByText(`${config.label} – ${configKernel.label}`)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              cy.contains('eth0 – Public Internet').should('be.visible');
              cy.contains(`eth1 – VLAN: testvlan (${newIpamAddress})`).should(
                'be.visible'
              );
            });
        });
      });
    });

    /*
     * - Confirms Linode config boot flow end-to-end using real API requests.
     * - Confirms that API reboot request succeeds and Cloud UI automatically updates to reflect reboot.
     */
    it('Boots a config', () => {
      cy.defer(
        () =>
          createLinodeAndGetConfig(
            { booted: true },
            { waitForBoot: true, securityMethod: 'vlan_no_internet' }
          ),
        'Creating and booting test Linode'
      ).then(([linode, config]: [Linode, Config]) => {
        const kernel = findKernelById(kernels, config.kernel);

        cy.visitWithLogin(`/linodes/${linode.id}/configurations`);
        interceptRebootLinode(linode.id).as('rebootLinode');

        // Confirm that Linode config is listed, then click its "Boot" button.
        cy.findByText(`${config.label} – ${kernel.label}`)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByText('Boot').click();
          });

        // Proceed through boot confirmation dialog.
        ui.dialog
          .findByTitle('Confirm Boot')
          .should('be.visible')
          .within(() => {
            cy.contains(
              `Are you sure you want to boot "${config.label}"?`
            ).should('be.visible');
            ui.button
              .findByTitle('Boot')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm that API request succeeds, toast appears, and UI updates to reflect reboot.
        cy.wait('@rebootLinode').its('response.statusCode').should('eq', 200);
        ui.toast.assertMessage(`Successfully booted config ${config.label}`);
        cy.findByText('REBOOTING').should('be.visible');
      });
    });

    /*
     * - Confirms Linode config clone flow end-to-end using real API requests.
     * - Confirms that API config clone requests succeed.
     * - Confirms that Cloud UI automatically updates to reflect clone-in-progress.
     */
    it('Clones a config', () => {
      // Create clone source and destination Linodes.
      // Use `vlan_no_internet` security method.
      // This works around an issue where the Linode API responds with a 400
      // when attempting to interact with it shortly after booting up when the
      // Linode is attached to a Cloud Firewall.
      const createCloneTestLinodes = async () => {
        return Promise.all([
          createTestLinode(
            { booted: true },
            { securityMethod: 'vlan_no_internet', waitForBoot: true }
          ),
          createTestLinode(
            { booted: true },
            { securityMethod: 'vlan_no_internet' }
          ),
        ]);
      };

      // Create clone and source destination Linodes, then proceed with clone flow.
      cy.defer(
        () => createCloneTestLinodes(),
        'Waiting for 2 Linodes to be created'
      ).then(([sourceLinode, destLinode]: [Linode, Linode]) => {
        const kernel = findKernelById(kernels, 'linode/latest-64bit');
        const sharedConfigLabel = 'cy-test-sharable-config';

        cy.visitWithLogin(`/linodes/${sourceLinode.id}/configurations`);

        // Add a new configuration that we can share across our Linodes.
        ui.button
          .findByTitle('Add Configuration')
          .should('be.enabled')
          .should('be.visible')
          .click();

        ui.dialog
          .findByTitle('Add Configuration')
          .should('be.visible')
          .within(() => {
            cy.findByLabelText('Label', { exact: false })
              .should('be.visible')
              .type(sharedConfigLabel);

            cy.findByText('Select a Kernel')
              .scrollIntoView()
              .click()
              .type('Latest 64 bit{enter}');

            ui.buttonGroup
              .findButtonByTitle('Add Configuration')
              .scrollIntoView()
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm that new configuration is listed in table.
        cy.findByLabelText('List of Configurations').within(() => {
          cy.findByText(`${sharedConfigLabel} – ${kernel.label}`)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              cy.findByText('eth0 – Public Internet').should('be.visible');
            });
        });

        // Initiate configuration clone flow.
        ui.actionMenu
          .findByTitle(`Action menu for Linode Config ${sharedConfigLabel}`)
          .should('be.visible')
          .click();

        ui.actionMenuItem.findByTitle('Clone').should('be.visible').click();

        cy.findByTestId('config-clone-selection-details')
          .should('be.visible')
          .within(() => {
            ui.button.findByTitle('Clone').should('be.disabled');
            cy.findByLabelText('Linode').should('be.visible').click();

            ui.select.findItemByText(destLinode.label).click();
            ui.button.findByTitle('Clone').should('be.enabled').click();
          });

        // Confirm toast message and that UI updates to reflect clone in progress.
        ui.toast.assertMessage(
          `Linode ${sourceLinode.label} successfully cloned to ${destLinode.label}.`
        );
        cy.findByText(/CLONING \(\d+%\)/).should('be.visible');
      });
    });

    /*
     * - Confirms Linode config delete flow end-to-end using real API requests.
     * - Confirms that config can be deleted and related API requests succeed.
     * - Confirms that Cloud Manager UI automatically updates to reflect deleted config.
     */
    it('Deletes a config', () => {
      cy.defer(
        () => createLinodeAndGetConfig(),
        'creating a linode and getting its config'
      ).then(([linode, config]: [Linode, Config]) => {
        // Get kernel info for config to be deleted.
        const kernel = findKernelById(kernels, config.kernel);

        interceptDeleteLinodeConfig(linode.id, config.id).as(
          'deleteLinodeConfig'
        );
        cy.visitWithLogin(`/linodes/${linode.id}/configurations`);

        // Confirm that config is listed and initiate deletion.
        cy.findByText(`${config.label} – ${kernel.label}`).should('be.visible');
        ui.actionMenu
          .findByTitle(`Action menu for Linode Config ${config.label}`)
          .should('be.visible')
          .click();

        ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

        // Confirm config deletion.
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

        // Confirm request succeeds, toast appears, and config is removed from list.
        cy.wait('@deleteLinodeConfig')
          .its('response.statusCode')
          .should('eq', 200);

        ui.toast.assertMessage(
          `Configuration ${config.label} successfully deleted`
        );

        cy.findByLabelText('List of Configurations').within(() => {
          cy.contains('No data to display.').should('be.visible');
        });
      });
    });
  });

  describe('Mocked', () => {
    const region: Region = getRegionById('us-southeast');
    const mockKernel = kernelFactory.build();
    const mockVPC = vpcFactory.build({
      id: randomNumber(),
      label: randomLabel(),
    });

    // Mock config with public internet for eth0 and VLAN for eth1.
    const mockConfig: Config = linodeConfigFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      kernel: mockKernel.id,
      interfaces: [
        LinodeConfigInterfaceFactory.build({
          ipam_address: null,
          purpose: 'public',
          label: null,
        }),
        LinodeConfigInterfaceFactory.build({
          label: randomLabel(),
          purpose: 'vlan',
        }),
      ],
    });

    const mockVLANs: VLAN[] = VLANFactory.buildList(2);

    /*
     * - Tests Linode config create and VPC interface assignment UI flows using mock API data.
     * - Confirms that VPC can be assigned as eth0, eth1, and eth2.
     * - Confirms public internet access/NAT helper text appears when VPC is set as eth0.
     * - Confirms that "REBOOT NEEDED" status indicator appears upon creating VPC config.
     */
    it('Creates a new config and assigns a VPC as a network interface', () => {
      const mockLinode = linodeFactory.build({
        region: region.id,
        type: dcPricingMockLinodeTypes[0].id,
      });

      // Mock config with VPC for eth0 and no other interfaces.
      const mockConfigWithVpc: Config = {
        ...mockConfig,
        interfaces: [
          LinodeConfigInterfaceFactoryWithVPC.build({
            vpc_id: mockVPC.id,
            active: false,
            label: null,
          }),
        ],
      };

      // Mock a Linode with no existing configs, then visit its details page.
      mockGetLinodeKernel(mockKernel.id, mockKernel);
      mockGetLinodeKernels([mockKernel]);
      mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
      mockGetLinodeDisks(mockLinode.id, []).as('getDisks');
      mockGetLinodeVolumes(mockLinode.id, []).as('getVolumes');
      mockGetLinodeConfigs(mockLinode.id, []).as('getConfigs');
      mockGetVPC(mockVPC).as('getVPC');
      mockGetVLANs(mockVLANs);

      cy.visitWithLogin(`/linodes/${mockLinode.id}/configurations`);
      cy.wait(['@getConfigs', '@getDisks', '@getLinode', '@getVolumes']);

      // Confirm that there are no configurations displayed.
      cy.findByLabelText('List of Configurations').within(() => {
        cy.findByText('No data to display.').should('be.visible');
      });

      // Mock requests to create new config and re-fetch configs.
      mockCreateLinodeConfigs(mockLinode.id, mockConfigWithVpc).as(
        'createLinodeConfig'
      );
      mockGetLinodeConfigs(mockLinode.id, [mockConfigWithVpc]).as(
        'getLinodeConfigs'
      );

      // Create new config.
      cy.findByText('Add Configuration').click();
      ui.dialog
        .findByTitle('Add Configuration')
        .should('be.visible')
        .within(() => {
          cy.get('#label').type(`${mockConfigWithVpc.label}`);

          // Confirm that "VPC" can be selected for either "eth0", "eth1", or "eth2".
          // Add VPC to eth0
          cy.get('[data-qa-textfield-label="eth0"]')
            .scrollIntoView()
            .click()
            .type('VPC');

          ui.select.findItemByText('VPC').should('be.visible').click();

          // Confirm that internet access warning is displayed when eth0 is set
          // to VPC.
          cy.findByText(NOT_NATTED_HELPER_TEXT).should('be.visible');

          // Confirm that VPC is an option for eth1 and eth2, but don't select them.
          ['eth1', 'eth2'].forEach((interfaceName) => {
            cy.get(`[data-qa-textfield-label="${interfaceName}"]`)
              .scrollIntoView()
              .click()
              .type('VPC');

            ui.select.findItemByText('VPC').should('be.visible');

            cy.get(`[data-qa-textfield-label="${interfaceName}"]`).click();
          });

          ui.buttonGroup
            .findButtonByTitle('Add Configuration')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait(['@createLinodeConfig', '@getLinodeConfigs', '@getVPC']);

      // Confirm that VPC has been assigned to eth0, and that "REBOOT NEEDED"
      // status message is shown.
      cy.findByLabelText('List of Configurations').within(() => {
        cy.contains(`${mockConfig.label} – ${mockKernel.label}`).should(
          'be.visible'
        );
        cy.contains(`eth0 – VPC: ${mockVPC.label}`).should('be.visible');
      });

      cy.findByText('REBOOT NEEDED').should('be.visible');
    });

    /*
     * - Tests Linode config edit and VPC interface assignment UI flows using mock API data.
     * - Confirms that VPC can be assigned as eth2 in addition to existing interfaces.
     * - Confirms that "REBOOT NEEDED" status indicator appears upon creating VPC config.
     */
    it('Edits an existing config and assigns a VPC as a network interface', () => {
      const mockLinode = linodeFactory.build({
        region: region.id,
        type: dcPricingMockLinodeTypes[0].id,
      });

      // Mock config with public internet eth0, VLAN eth1, and VPC eth2.
      const mockConfigWithVpc: Config = {
        ...mockConfig,
        interfaces: [
          ...mockConfig.interfaces,
          LinodeConfigInterfaceFactoryWithVPC.build({
            label: undefined,
            vpc_id: mockVPC.id,
            active: false,
          }),
        ],
      };

      mockGetLinodeKernel(mockKernel.id, mockKernel);
      mockGetLinodeKernels([mockKernel]);
      mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');

      mockGetLinodeDisks(mockLinode.id, []).as('getDisks');
      mockGetLinodeConfigs(mockLinode.id, [mockConfig]).as('getConfig');
      mockGetVPC(mockVPC).as('getVPC');
      mockGetLinodeVolumes(mockLinode.id, []).as('getVolumes');

      cy.visitWithLogin(`/linodes/${mockLinode.id}/configurations`);
      cy.wait(['@getLinode', '@getConfig', '@getDisks', '@getVolumes']);

      // Find configuration in list and click its "Edit" button.
      cy.findByLabelText('List of Configurations').within(() => {
        cy.findByText(`${mockConfig.label} – ${mockKernel.label}`)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            ui.button.findByTitle('Edit').click();
          });
      });

      // Set up mocks for config update.
      mockGetVLANs(mockVLANs);
      mockGetVPC(mockVPC).as('getVPC');
      mockUpdateLinodeConfigs(mockLinode.id, mockConfigWithVpc).as(
        'updateLinodeConfigs'
      );
      mockGetLinodeConfigs(mockLinode.id, [mockConfigWithVpc]).as(
        'getLinodeConfigs'
      );

      ui.dialog
        .findByTitle('Edit Configuration')
        .should('be.visible')
        .within(() => {
          // Set eth2 to VPC and submit.
          cy.get('[data-qa-textfield-label="eth2"]')
            .scrollIntoView()
            .click()
            .type('VPC{enter}');

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
        cy.contains(`${mockConfig.label} – ${mockKernel.label}`).should(
          'be.visible'
        );
        cy.contains('eth0 – Public Internet').should('be.visible');
        cy.contains(`eth2 – VPC: ${mockVPC.label}`).should('be.visible');
      });

      cy.findByText('REBOOT NEEDED').should('be.visible');
    });

    /*
     * - Tests Linode config edit and VPC interface assignment UI flows using mock API data.
     * - When the user sets primary interface to eth0, sets eth0 to "Public Internet", and sets eth1 to "VPC", confirm that correct notice appears.
     * - When the user sets primary interface to eth0, sets eth0 to "Public Internet", sets eth1 to "VPC", and checks "Assign a public IPv4 address for this Linode", confirm that correct notice appears.
     * - Confirms that "REBOOT NEEDED" status indicator appears upon creating VPC config.
     */
    it('Creates a new config using non-recommended settings and confirm the informational notices', () => {
      const region = chooseRegion({ capabilities: ['VPCs'] });
      const mockLinode = linodeFactory.build({
        id: randomNumber(),
        label: randomLabel(),
        region: region.id,
      });
      const mockSubnet = subnetFactory.build({
        id: randomNumber(),
        label: randomLabel(),
        linodes: [],
        ipv4: `${randomIp()}/0`,
      });
      const mockVPC = vpcFactory.build({
        id: randomNumber(),
        label: randomLabel(),
        region: region.id,
        subnets: [mockSubnet],
      });

      // Mock config with public internet eth0, VPC eth1 and no other interfaces.
      const mockConfigWithVpc: Config = {
        ...mockConfig,
        interfaces: [
          LinodeConfigInterfaceFactory.build({
            ipam_address: null,
            purpose: 'public',
            label: null,
          }),
          LinodeConfigInterfaceFactoryWithVPC.build({
            vpc_id: mockVPC.id,
            active: false,
            label: null,
          }),
        ],
      };

      // Mock a Linode with no existing configs, then visit its details page.
      mockGetLinodeKernel(mockKernel.id, mockKernel);
      mockGetLinodeKernels([mockKernel]);
      mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
      mockGetLinodeDisks(mockLinode.id, []).as('getDisks');
      mockGetLinodeVolumes(mockLinode.id, []).as('getVolumes');
      mockGetLinodeConfigs(mockLinode.id, []).as('getConfigs');
      mockGetVPC(mockVPC).as('getVPC');
      mockGetVPCs([mockVPC]).as('getVPCs');

      cy.visitWithLogin(`/linodes/${mockLinode.id}/configurations`);
      cy.wait(['@getConfigs', '@getDisks', '@getLinode', '@getVolumes']);

      // Confirm that there are no configurations displayed.
      cy.findByLabelText('List of Configurations').within(() => {
        cy.findByText('No data to display.').should('be.visible');
      });

      // Mock requests to create new config and re-fetch configs.
      mockCreateLinodeConfigs(mockLinode.id, mockConfigWithVpc).as(
        'createLinodeConfig'
      );
      mockGetLinodeConfigs(mockLinode.id, [mockConfigWithVpc]).as(
        'getLinodeConfigs'
      );

      // Create new config.
      cy.findByText('Add Configuration').click();
      ui.dialog
        .findByTitle('Add Configuration')
        .should('be.visible')
        .within(() => {
          cy.get('#label').type(`${mockConfigWithVpc.label}`);

          // Sets eth0 to "Public Internet", and sets eth1 to "VPC"
          cy.get('[data-qa-textfield-label="eth0"]')
            .scrollIntoView()
            .click()
            .type('Public Internet');
          ui.select
            .findItemByText('Public Internet')
            .should('be.visible')
            .click();
          cy.get('[data-qa-textfield-label="eth1"]')
            .scrollIntoView()
            .click()
            .type('VPC');
          ui.select.findItemByText('VPC').should('be.visible').click();
          // Confirm that internet access warning is displayed.
          cy.findByText(LINODE_UNREACHABLE_HELPER_TEXT).should('be.visible');

          // Sets eth0 to "Public Internet", and sets eth1 to "VPC",
          // and checks "Assign a public IPv4 address for this Linode"
          cy.get('[data-qa-textfield-label="VPC"]')
            .scrollIntoView()
            .click()
            .type(`${mockVPC.label}`);
          ui.select
            .findItemByText(`${mockVPC.label}`)
            .should('be.visible')
            .click();
          cy.get('[data-qa-textfield-label="Subnet"]')
            .scrollIntoView()
            .click()
            .type(`${mockSubnet.label}`);
          ui.select
            .findItemByText(`${mockSubnet.label}`)
            .should('be.visible')
            .click();
          cy.findByText('Assign a public IPv4 address for this Linode')
            .should('be.visible')
            .click();
          // Confirm that internet access warning is displayed.
          cy.findByText(NATTED_PUBLIC_IP_HELPER_TEXT)
            .scrollIntoView()
            .should('be.visible');

          ui.buttonGroup
            .findButtonByTitle('Add Configuration')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait(['@createLinodeConfig', '@getLinodeConfigs', '@getVPC']);

      // Confirm that Public Internet assigned to eth0, VPC to eth1,
      // and that "REBOOT NEEDED" status message is shown.
      cy.findByLabelText('List of Configurations').within(() => {
        cy.contains(`${mockConfig.label} – ${mockKernel.label}`).should(
          'be.visible'
        );
        cy.contains('eth0 – Public Internet').should('be.visible');
        cy.contains(`eth1 – VPC: ${mockVPC.label}`).should('be.visible');
      });

      cy.findByText('REBOOT NEEDED').should('be.visible');
    });
  });
});
