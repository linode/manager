/**
 * @file Linode Create end-to-end tests.
 */

import { ui } from 'support/ui';
import { chooseRegion } from 'support/util/regions';
import { randomLabel, randomString, randomNumber } from 'support/util/random';
import { LINODE_CREATE_TIMEOUT } from 'support/constants/linodes';
import { cleanUp } from 'support/util/cleanup';
import { linodeCreatePage } from 'support/ui/pages';
import { authenticate } from 'support/api/authentication';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { interceptCreateLinode } from 'support/intercepts/linodes';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { interceptGetProfile } from 'support/intercepts/profile';
import { Region, VLAN, Config, Disk } from '@linode/api-v4';
import { getRegionById } from 'support/util/regions';
import {
  linodeFactory,
  linodeConfigFactory,
  VLANFactory,
  vpcFactory,
  subnetFactory,
  regionFactory,
  LinodeConfigInterfaceFactory,
  LinodeConfigInterfaceFactoryWithVPC,
} from 'src/factories';
import { dcPricingMockLinodeTypes } from 'support/constants/dc-specific-pricing';
import {
  mockGetLinodeType,
  mockGetLinodeTypes,
} from 'support/intercepts/linodes';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetVLANs } from 'support/intercepts/vlans';
import { mockGetVPC, mockGetVPCs } from 'support/intercepts/vpc';
import {
  mockCreateLinode,
  mockGetLinodeDisks,
  mockGetLinodeVolumes,
} from 'support/intercepts/linodes';
import { mockGetLinodeConfigs } from 'support/intercepts/configs';
import {
  fbtClick,
  fbtVisible,
  getClick,
  getVisible,
  containsVisible,
} from 'support/helpers';
import {} from 'support/helpers';
let username: string;

authenticate();
describe('Create Linode', () => {
  before(() => {
    cleanUp('linodes');
    cleanUp('ssh-keys');
  });

  // Enable the `linodeCreateRefactor` feature flag.
  // TODO Delete these mocks once `linodeCreateRefactor` feature flag is retired.
  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeCreateRefactor: makeFeatureFlagData(true),
    });
    mockGetFeatureFlagClientstream();
  });

  /*
   * End-to-end tests to create Linodes for each available plan type.
   */
  describe('End-to-end', () => {
    // Run an end-to-end test to create a basic Linode for each plan type described below.
    describe('By plan type', () => {
      [
        {
          planType: 'Shared CPU',
          planLabel: 'Nanode 1 GB',
          planId: 'g6-nanode-1',
        },
        {
          planType: 'Dedicated CPU',
          planLabel: 'Dedicated 4 GB',
          planId: 'g6-dedicated-2',
        },
        {
          planType: 'High Memory',
          planLabel: 'Linode 24 GB',
          planId: 'g7-highmem-1',
        },
        {
          planType: 'Premium CPU',
          planLabel: 'Premium 4 GB',
          planId: 'g7-premium-2',
        },
        // TODO Include GPU plan types.
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
          linodeCreatePage.selectImage('Debian 11');
          linodeCreatePage.selectRegionById(linodeRegion.id);
          linodeCreatePage.selectPlan(
            planConfig.planType,
            planConfig.planLabel
          );
          linodeCreatePage.setRootPassword(randomString(32));

          // Confirm information in summary is shown as expected.
          cy.get('[data-qa-linode-create-summary]')
            .scrollIntoView()
            .within(() => {
              cy.findByText('Debian 11').should('be.visible');
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

          // TODO Confirm whether or not toast notification should appear here.
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

  it('adds an SSH key to the linode during create flow', () => {
    const rootpass = randomString(32);
    const sshPublicKeyLabel = randomLabel();
    const randomKey = randomString(400, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      spaces: false,
      symbols: false,
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
      id: region.id,
      label: region.label,
      capabilities: ['Linodes', 'VPCs', 'Vlans'],
    });
    const mockPublicConfigInterface = LinodeConfigInterfaceFactory.build({
      ipam_address: null,
      purpose: 'public',
    });
    const mockVlanConfigInterface = LinodeConfigInterfaceFactory.build();
    const mockVpcConfigInterface = LinodeConfigInterfaceFactoryWithVPC.build({
      vpc_id: mockVPC.id,
      purpose: 'vpc',
      active: true,
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

    // Mock requests to get individual types.
    mockGetLinodeType(dcPricingMockLinodeTypes[0]);
    mockGetLinodeType(dcPricingMockLinodeTypes[1]);
    mockGetLinodeTypes(dcPricingMockLinodeTypes).as('getLinodeTypes');

    mockAppendFeatureFlags({
      vpc: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

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
    cy.wait([
      '@getLinodeTypes',
      '@getClientStream',
      '@getFeatureFlags',
      '@getVPCs',
    ]);

    cy.get('[data-qa-header="Create"]').should('have.text', 'Create');

    // Check the 'Backups' add on
    cy.get('[data-testid="backups"]').should('be.visible').click();
    ui.regionSelect.find().click().type(`${region.label} {enter}`);
    fbtClick('Shared CPU');
    getClick(`[id="${dcPricingMockLinodeTypes[0].id}"]`);

    // the "VPC" section is present, and the VPC in the same region of
    // the linode can be selected.
    getVisible('[data-testid="vpc-panel"]').within(() => {
      containsVisible('Assign this Linode to an existing VPC.');
      // select VPC
      cy.get('[data-qa-enhanced-select="None"]')
        .should('be.visible')
        .click()
        .type(`${mockVPC.label}{enter}`);
      // select subnet
      cy.findByText('Select Subnet')
        .should('be.visible')
        .click()
        .type(`${mockSubnet.label}{enter}`);
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
        cy.get('[id="label"]').clear().type(sshPublicKeyLabel);

        // An alert displays when the format of SSH key is incorrect
        cy.get('[id="ssh-public-key"]').clear().type('WrongFormatSshKey');
        ui.button
          .findByTitle('Add Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findAllByText(
          'SSH Key key-type must be ssh-dss, ssh-rsa, ecdsa-sha2-nistp, ssh-ed25519, or sk-ecdsa-sha2-nistp256.'
        ).should('be.visible');

        // Create a new ssh key
        cy.get('[id="ssh-public-key"]').clear().type(sshPublicKey);
        ui.button
          .findByTitle('Add Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // When a user creates an SSH key, a toast notification appears that says "Successfully created SSH key."
    ui.toast.assertMessage('Successfully created SSH key.');

    // When a user creates an SSH key, the list of SSH keys for each user updates to show the new key for the signed in user
    cy.findAllByText(sshPublicKeyLabel).should('be.visible');

    getClick('#linode-label').clear().type(linodeLabel);
    cy.get('#root-password').type(rootpass);
    getClick('[data-qa-deploy-linode]');
    cy.wait('@linodeCreated').its('response.statusCode').should('eq', 200);
    fbtVisible(linodeLabel);
    cy.contains('RUNNING', { timeout: 300000 }).should('be.visible');
  });
});
