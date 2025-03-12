/**
 * @file Linode Create end-to-end tests.
 */

import {
  linodeConfigInterfaceFactory,
  linodeConfigInterfaceFactoryWithVPC,
} from '@linode/utilities';
import { authenticate } from 'support/api/authentication';
import { dcPricingMockLinodeTypes } from 'support/constants/dc-specific-pricing';
import { LINODE_CREATE_TIMEOUT } from 'support/constants/linodes';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetUser } from 'support/intercepts/account';
import { mockGetLinodeConfigs } from 'support/intercepts/configs';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  interceptCreateLinode,
  mockCreateLinode,
  mockCreateLinodeError,
  mockGetLinodeDisks,
  mockGetLinodeType,
  mockGetLinodeTypes,
  mockGetLinodeVolumes,
} from 'support/intercepts/linodes';
import { interceptGetProfile } from 'support/intercepts/profile';
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetVLANs } from 'support/intercepts/vlans';
import { mockGetVPC, mockGetVPCs } from 'support/intercepts/vpc';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import { cleanUp } from 'support/util/cleanup';
import { randomLabel, randomNumber, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { getRegionById } from 'support/util/regions';

import {
  VLANFactory,
  accountFactory,
  accountUserFactory,
  grantsFactory,
  linodeConfigFactory,
  linodeFactory,
  linodeTypeFactory,
  profileFactory,
  regionFactory,
  subnetFactory,
  vpcFactory,
} from 'src/factories';

import type { Config, Disk, Region, VLAN } from '@linode/api-v4';

let username: string;

authenticate();
describe('Create Linode', () => {
  before(() => {
    cleanUp('linodes');
    cleanUp('ssh-keys');
  });
  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeInterfaces: { enabled: false },
    });
  });

  /*
   * End-to-end tests to create Linodes for each available plan type.
   */
  describe('End-to-end', () => {
    // Run an end-to-end test to create a basic Linode for each plan type described below.
    describe('By plan type', () => {
      [
        {
          planId: 'g6-nanode-1',
          planLabel: 'Nanode 1 GB',
          planType: 'Shared CPU',
        },
        {
          planId: 'g6-dedicated-2',
          planLabel: 'Dedicated 4 GB',
          planType: 'Dedicated CPU',
        },
        {
          planId: 'g7-highmem-1',
          planLabel: 'Linode 24 GB',
          planType: 'High Memory',
        },
        {
          planId: 'g7-premium-2',
          planLabel: 'Premium 4 GB',
          planType: 'Premium CPU',
        },
        // TODO Include GPU plan types.
        // TODO Include Accelerated plan types (when they're no longer as restricted)
      ].forEach((planConfig) => {
        /*
         * - Parameterized end-to-end test to create a Linode for each plan type.
         * - Confirms that a Linode of the given plan type can be deployed.
         */
        it(`creates a ${planConfig.planType} Linode`, () => {
          const linodeRegion = chooseRegion({
            capabilities: ['Linodes', 'Premium Plans', 'Vlans'],
          });
          const linodeLabel = randomLabel();

          interceptGetProfile().as('getProfile');

          interceptCreateLinode().as('createLinode');
          cy.visitWithLogin('/linodes/create');

          // Set Linode label, OS, plan type, password, etc.
          linodeCreatePage.setLabel(linodeLabel);
          linodeCreatePage.selectImage('Debian 12');
          linodeCreatePage.selectRegionById(linodeRegion.id);
          linodeCreatePage.selectPlan(
            planConfig.planType,
            planConfig.planLabel
          );
          linodeCreatePage.setRootPassword(randomString(32));

          // Confirm information in summary is shown as expected.
          cy.get('[data-qa-linode-create-summary]').scrollIntoView();
          cy.get('[data-qa-linode-create-summary]').within(() => {
            cy.findByText('Debian 12').should('be.visible');
            cy.findByText(linodeRegion.label).should('be.visible');
            cy.findByText(planConfig.planLabel).should('be.visible');
          });

          // Create Linode and confirm it's provisioned as expected.
          ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();

          cy.wait('@createLinode').then((xhr) => {
            const requestPayload = xhr.request.body;
            const responsePayload = xhr.response?.body;

            // Confirm that API request and response contain expected data
            expect(requestPayload['label']).to.equal(linodeLabel);
            expect(requestPayload['region']).to.equal(linodeRegion.id);
            expect(requestPayload['type']).to.equal(planConfig.planId);

            expect(responsePayload['label']).to.equal(linodeLabel);
            expect(responsePayload['region']).to.equal(linodeRegion.id);
            expect(responsePayload['type']).to.equal(planConfig.planId);

            // Confirm that Cloud redirects to details page
            cy.url().should('endWith', `/linodes/${responsePayload['id']}`);
          });

          cy.wait('@getProfile').then((xhr) => {
            username = xhr.response?.body.username;
          });

          // Confirm toast notification should appear on Linode create.
          ui.toast.assertMessage(
            `Your Linode ${linodeLabel} is being created.`
          );
          cy.findByText('RUNNING', { timeout: LINODE_CREATE_TIMEOUT }).should(
            'be.visible'
          );

          // confirm that LISH Console via SSH section is correct
          cy.contains('LISH Console via SSH')
            .should('be.visible')
            .closest('tr')
            .within(() => {
              cy.contains(
                `ssh -t ${username}@lish-${linodeRegion.id}.linode.com ${linodeLabel}`
              ).should('be.visible');
            });
        });
      });
    });
  });

  // Mocks creating an accelerated Linode due to accelerated linodes currently having limited deployment availability
  // TODO: eventually transition this to an e2e test (in the above test)
  it('creates a mock accelerated Linode and confirms response', () => {
    // Create mocks
    const linodeLabel = randomLabel();
    const mockLinode = linodeFactory.build({
      label: linodeLabel,
      specs: {
        accelerated_devices: 2,
        disk: 51200,
        gpus: 0,
        memory: 2048,
        transfer: 2000,
        vcpus: 1,
      },
      type: 'accelerated-1',
    });
    const mockAcceleratedType = [
      linodeTypeFactory.build({
        class: 'accelerated',
        id: 'accelerated-1',
        label: 'accelerated-1',
      }),
    ];
    const mockRegions = [
      regionFactory.build({
        capabilities: ['Linodes', 'Kubernetes', 'NETINT Quadra T1U'],
        id: 'us-east',
        label: 'Newark, NJ',
      }),
    ];
    const linodeRegion = mockRegions[0];

    // Create request intercepts
    mockGetAccount(
      accountFactory.build({
        capabilities: ['NETINT Quadra T1U'],
      })
    ).as('getAccount');
    mockAppendFeatureFlags({
      acceleratedPlans: {
        linodePlans: true,
        lkePlans: false,
      },
    }).as('getFeatureFlags');
    mockGetRegions(mockRegions).as('getRegions');
    mockGetLinodeTypes([...mockAcceleratedType]).as('getLinodeTypes');
    mockCreateLinode(mockLinode).as('createLinode');

    cy.visitWithLogin('/linodes/create');
    cy.wait([
      '@getRegions',
      '@getLinodeTypes',
      '@getAccount',
      '@getFeatureFlags',
    ]);

    // Set Linode label, OS, plan type, password, etc.
    linodeCreatePage.setLabel(linodeLabel);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Accelerated', mockAcceleratedType[0].label);
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm information in summary is shown as expected.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
      cy.findByText('Debian 12').should('be.visible');
      cy.findByText(`US, ${linodeRegion.label}`).should('be.visible');
      cy.findByText(mockAcceleratedType[0].label).should('be.visible');
    });

    // Create Linode and confirm it's provisioned as expected.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const responsePayload = xhr.response?.body;

      // Confirm that API request and response contain expected data
      expect(requestPayload['label']).to.equal(linodeLabel);
      expect(requestPayload['region']).to.equal(linodeRegion.id);
      expect(requestPayload['type']).to.equal(mockAcceleratedType[0].id);

      expect(responsePayload['label']).to.equal(linodeLabel);
      expect(responsePayload['region']).to.equal(linodeRegion.id);
      expect(responsePayload['type']).to.equal(mockAcceleratedType[0].id);

      // Accelerated linodes: Confirm accelerated_devices value is returned as expected
      expect(responsePayload['specs']).has.property('accelerated_devices', 2);

      // Confirm that Cloud redirects to details page
      cy.url().should('endWith', `/linodes/${responsePayload['id']}`);
    });
  });

  it('adds an SSH key to the linode during create flow', () => {
    const rootpass = randomString(32);
    const sshPublicKeyLabel = randomLabel();
    const randomKey = randomString(400, {
      lowercase: true,
      numbers: true,
      spaces: false,
      symbols: false,
      uppercase: true,
    });
    const sshPublicKey = `ssh-rsa e2etestkey${randomKey} e2etest@linode`;
    const linodeLabel = randomLabel();
    const region: Region = getRegionById('us-southeast');
    const diskLabel: string = 'Debian 10 Disk';
    const mockLinode = linodeFactory.build({
      label: linodeLabel,
      region: region.id,
      type: dcPricingMockLinodeTypes[0].id,
    });
    const mockVLANs: VLAN[] = VLANFactory.buildList(2);
    const mockSubnet = subnetFactory.build({
      id: randomNumber(2),
      label: randomLabel(),
    });
    const mockVPC = vpcFactory.build({
      id: randomNumber(),
      region: 'us-southeast',
      subnets: [mockSubnet],
    });
    const mockVPCRegion = regionFactory.build({
      capabilities: ['Linodes', 'VPCs', 'Vlans'],
      id: region.id,
      label: region.label,
    });
    const mockPublicConfigInterface = linodeConfigInterfaceFactory.build({
      ipam_address: null,
      purpose: 'public',
    });
    const mockVlanConfigInterface = linodeConfigInterfaceFactory.build();
    const mockVpcConfigInterface = linodeConfigInterfaceFactoryWithVPC.build({
      active: true,
      purpose: 'vpc',
      vpc_id: mockVPC.id,
    });
    const mockConfig: Config = linodeConfigFactory.build({
      id: randomNumber(),
      interfaces: [
        // The order of this array is significant. Index 0 (eth0) should be public.
        mockPublicConfigInterface,
        mockVlanConfigInterface,
        mockVpcConfigInterface,
      ],
    });
    const mockDisks: Disk[] = [
      {
        created: '2020-08-21T17:26:14',
        filesystem: 'ext4',
        id: 44311273,
        label: diskLabel,
        size: 81408,
        status: 'ready',
        updated: '2020-08-21T17:26:30',
      },
      {
        created: '2020-08-21T17:26:14',
        filesystem: 'swap',
        id: 44311274,
        label: '512 MB Swap Image',
        size: 512,
        status: 'ready',
        updated: '2020-08-21T17:26:31',
      },
    ];

    // Mock requests to get individual types.
    mockGetLinodeType(dcPricingMockLinodeTypes[0]);
    mockGetLinodeType(dcPricingMockLinodeTypes[1]);
    mockGetLinodeTypes(dcPricingMockLinodeTypes).as('getLinodeTypes');

    mockGetRegions([mockVPCRegion]).as('getRegions');

    mockGetVLANs(mockVLANs);
    mockGetVPC(mockVPC).as('getVPC');
    mockGetVPCs([mockVPC]).as('getVPCs');
    mockCreateLinode(mockLinode).as('linodeCreated');
    mockGetLinodeConfigs(mockLinode.id, [mockConfig]).as('getLinodeConfigs');
    mockGetLinodeDisks(mockLinode.id, mockDisks).as('getDisks');
    mockGetLinodeVolumes(mockLinode.id, []).as('getVolumes');

    // intercept request
    cy.visitWithLogin('/linodes/create');
    cy.wait('@getLinodeTypes');

    cy.get('[data-qa-header="Create"]').should('have.text', 'Create');

    // Check the 'Backups' add on
    cy.get('[data-testid="backups"]').should('be.visible').click();
    ui.regionSelect.find().click().type(`${region.label} {enter}`);

    // Verify VPCs get fetched once a region is selected
    cy.wait('@getVPCs');

    cy.findByText('Shared CPU').click();
    cy.get(`[id="${dcPricingMockLinodeTypes[0].id}"]`).click();

    // the "VPC" section is present, and the VPC in the same region of
    // the linode can be selected.
    cy.get('[data-testid="vpc-panel"]')
      .should('be.visible')
      .within(() => {
        cy.contains('Assign this Linode to an existing VPC.').should(
          'be.visible'
        );
        // select VPC
        cy.findByLabelText('Assign VPC').should('be.visible').focus();
        cy.focused().type(`${mockVPC.label}{downArrow}{enter}`);
        // select subnet
        cy.findByPlaceholderText('Select Subnet')
          .should('be.visible')
          .type(`${mockSubnet.label}{downArrow}{enter}`);
      });

    // The drawer opens when clicking "Add an SSH Key" button
    ui.button
      .findByTitle('Add an SSH Key')
      .should('be.visible')
      .should('be.enabled')
      .click();
    ui.drawer
      .findByTitle('Add SSH Key')
      .should('be.visible')
      .within(() => {
        cy.get('[id="label"]').clear();
        cy.focused().type(sshPublicKeyLabel);

        // An alert displays when the format of SSH key is incorrect
        cy.get('[id="ssh-public-key"]').clear();
        cy.focused().type('WrongFormatSshKey');
        ui.button
          .findByTitle('Add Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findAllByText(
          'SSH Key key-type must be ssh-dss, ssh-rsa, ecdsa-sha2-nistp, ssh-ed25519, or sk-ecdsa-sha2-nistp256.'
        ).should('be.visible');

        // Create a new ssh key
        cy.get('[id="ssh-public-key"]').clear();
        cy.focused().type(sshPublicKey);
        ui.button
          .findByTitle('Add Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // When a user creates an SSH key, a toast notification appears that says "Successfully created SSH key."
    ui.toast.assertMessage('Successfully created SSH key.');

    // When a user creates an SSH key, the list of SSH keys for each user updates to show the new key for the signed in user
    cy.findByText(sshPublicKeyLabel, { exact: false }).should('be.visible');

    cy.get('#linode-label').clear();
    cy.focused().type(linodeLabel);
    cy.focused().click();
    cy.get('#root-password').type(rootpass);

    ui.button.findByTitle('Create Linode').click();

    cy.wait('@linodeCreated').its('response.statusCode').should('eq', 200);
    cy.findByText(linodeLabel).should('be.visible');
    cy.contains('RUNNING', { timeout: 300000 }).should('be.visible');
  });

  /*
   * - Confirms error message can show up during Linode create flow.
   * - Confirms Linode can be created after retry.
   */
  it('shows unexpected error during Linode create flow', () => {
    const linodeRegion = chooseRegion({
      capabilities: ['Linodes'],
    });
    const linodeLabel = randomLabel();
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: linodeLabel,
      region: linodeRegion.id,
    });
    const createLinodeErrorMessage =
      'An error has occurred during Linode creation flow';

    mockCreateLinodeError(createLinodeErrorMessage).as('createLinodeError');
    cy.visitWithLogin('/linodes/create');

    // Set Linode label, OS, plan type, password, etc.
    linodeCreatePage.setLabel(linodeLabel);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Create Linode by clicking the button.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.wait('@createLinodeError');

    // Confirm the createLinodeErrorMessage show up on the web page.
    cy.findByText(`${createLinodeErrorMessage}`).should('be.visible');

    // Retry to create a Linode.
    mockCreateLinode(mockLinode).as('createLinode');
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.wait('@createLinode');
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${linodeLabel} is being created.`);
    // Confirm the createLinodeErrorMessage disappears.
    cy.findByText(`${createLinodeErrorMessage}`).should('not.exist');
  });

  it('shows correct validation errors if no backup or plan is selected', () => {
    cy.visitWithLogin('/linodes/create');

    // Navigate to Linode Create page "Backups" tab
    cy.get('[role="tablist"]')
      .should('be.visible')
      .findByText('Backups')
      .click();

    // Submit without selecting any options
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm the correct validation errors show up on the page.
    cy.findByText('You must select a Backup.').should('be.visible');
    cy.findByText('Plan is required.').should('be.visible');
  });

  /*
   * - Confirms UI flow when creating a Linode with a restricted user.
   * - Confirms that a notice is shown informing the user they do not have permission to create a Linode.
   * - Confirms that "Regions" field is disabled.
   * - Confirms that "Linux Distribution" field is disabled.
   * - Confirms that "Create Linode" button is disabled.
   */
  it('should not allow restricted users to create linodes', () => {
    // Mock setup for user profile, account user, and user grants with restricted permissions,
    // simulating a default user without the ability to add Linodes.
    const mockProfile = profileFactory.build({
      restricted: true,
      username: randomLabel(),
    });

    const mockUser = accountUserFactory.build({
      restricted: true,
      user_type: 'default',
      username: mockProfile.username,
    });

    const mockGrants = grantsFactory.build({
      global: {
        add_linodes: false,
      },
    });

    mockGetProfile(mockProfile);
    mockGetProfileGrants(mockGrants);
    mockGetUser(mockUser);

    // Login and wait for application to load
    cy.visitWithLogin('/linodes/create');

    // Confirm that a notice should be shown informing the user they do not have permission to create a Linode.
    cy.findByText(
      "You don't have permissions to create Linodes. Please contact your account administrator to request the necessary permissions."
    ).should('be.visible');

    // Confirm that "Region" select dropdown is disabled
    ui.regionSelect.find().should('be.visible').should('be.disabled');

    // Confirm that "Linux Distribution" select dropdown is disabled
    cy.get('[data-qa-autocomplete="Linux Distribution"]').within(() => {
      cy.get('[placeholder="Choose a Linux distribution"]')
        .should('be.visible')
        .should('be.disabled');

      cy.get('[aria-label="Open"]').should('be.visible').should('be.disabled');
    });

    // Confirm that "Create Linode" button is visible and disabled
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .and('be.disabled');
  });
});
