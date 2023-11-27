import {
  containsVisible,
  fbtClick,
  fbtVisible,
  getClick,
  getVisible,
} from 'support/helpers';
import { ui } from 'support/ui';
import { apiMatcher } from 'support/util/intercepts';
import { randomString, randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { getRegionById } from 'support/util/regions';
import {
  subnetFactory,
  vpcFactory,
  linodeFactory,
  linodeConfigFactory,
  regionFactory,
  VLANFactory,
  LinodeConfigInterfaceFactory,
  LinodeConfigInterfaceFactoryWithVPC,
} from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import { mockGetRegions } from 'support/intercepts/regions';
import {
  dcPricingPlanPlaceholder,
  dcPricingMockLinodeTypes,
  dcPricingDocsLabel,
  dcPricingDocsUrl,
} from 'support/constants/dc-specific-pricing';
import { mockGetVLANs } from 'support/intercepts/vlans';
import { mockGetLinodeConfigs } from 'support/intercepts/configs';
import {
  mockCreateLinode,
  mockGetLinodeType,
  mockGetLinodeTypes,
  mockGetLinodeDisks,
  mockGetLinodeVolumes,
} from 'support/intercepts/linodes';
import { mockGetVPC, mockGetVPCs } from 'support/intercepts/vpc';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';

import type { Config, VLAN, VPC, Disk, Region } from '@linode/api-v4';

const mockRegions: Region[] = [
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'uk',
    id: 'eu-west',
    label: 'London, UK',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'sg',
    id: 'ap-south',
    label: 'Singapore, SG',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    id: 'us-east',
    label: 'Newark, NJ',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    id: 'us-central',
    label: 'Dallas, TX',
  }),
];

authenticate();
describe('create linode', () => {
  before(() => {
    cleanUp('linodes');
  });

  /*
   * Region select test.
   * - Confirms that region select dropdown is visible and interactive.
   * - Confirms that region select dropdown is populated with expected regions.
   * - Confirms that region select dropdown is sorted alphabetically by region, with North America first.
   * - Confirms that region select dropdown is populated with expected DCs, sorted alphabetically.
   */
  it('region select', () => {
    mockGetRegions(mockRegions).as('getRegions');

    mockAppendFeatureFlags({
      soldOutTokyo: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin('linodes/create');

    cy.wait(['@getClientStream', '@getFeatureFlags', '@getRegions']);

    // Confirm that region select dropdown is visible and interactive.
    ui.regionSelect.find().click();
    cy.get('[data-qa-autocomplete-popper="true"]').should('be.visible');

    // Confirm that region select dropdown are grouped by region,
    // sorted alphabetically, with North America first.
    cy.get('.MuiAutocomplete-groupLabel')
      .should('have.length', 3)
      .should((group) => {
        expect(group[0]).to.contain('North America');
        expect(group[1]).to.contain('Asia');
        expect(group[2]).to.contain('Europe');
      });

    // Confirm that region select dropdown is populated with expected regions, sorted alphabetically.
    cy.get('[data-qa-option]').should('exist').should('have.length', 4);
    mockRegions.forEach((region) => {
      cy.get('[data-qa-option]').contains(region.label);
    });

    // Select an option
    cy.findByTestId('eu-west').click();
    // Confirm the popper is closed
    cy.get('[data-qa-autocomplete-popper="true"]').should('not.exist');
    // Confirm that the selected region is displayed in the input field.
    cy.get('[data-testid="textfield-input"]').should(
      'have.value',
      'London, UK (eu-west)'
    );

    // Confirm that selecting a valid region updates the Plan Selection panel.
    expect(cy.get('[data-testid="table-row-empty"]').should('not.exist'));
  });

  it('creates a nanode', () => {
    const rootpass = randomString(32);
    const linodeLabel = randomLabel();
    // intercept request
    cy.visitWithLogin('/linodes/create');
    cy.get('[data-qa-deploy-linode]');
    cy.intercept('POST', apiMatcher('linode/instances')).as('linodeCreated');
    cy.get('[data-qa-header="Create"]').should('have.text', 'Create');
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionLabel(chooseRegion().label).click();
    fbtClick('Shared CPU');
    getClick('[id="g6-nanode-1"]');
    getClick('#linode-label').clear().type(linodeLabel);
    cy.get('#root-password').type(rootpass);
    getClick('[data-qa-deploy-linode]');
    cy.wait('@linodeCreated').its('response.statusCode').should('eq', 200);
    ui.toast.assertMessage(`Your Linode ${linodeLabel} is being created.`);
    containsVisible('PROVISIONING');
    fbtVisible(linodeLabel);
    cy.contains('RUNNING', { timeout: 300000 }).should('be.visible');
  });

  it('creates a linode via CLI', () => {
    const linodeLabel = randomLabel();
    const linodePass = randomString(32);
    const linodeRegion = chooseRegion();

    cy.visitWithLogin('/linodes/create');

    ui.regionSelect.find().click();
    ui.autocompletePopper
      .findByTitle(`${linodeRegion.label} (${linodeRegion.id})`)
      .should('exist')
      .click();

    cy.get('[id="g6-dedicated-2"]').click();

    cy.findByLabelText('Linode Label')
      .should('be.visible')
      .should('be.enabled')
      .clear()
      .type(linodeLabel);

    cy.findByLabelText('Root Password')
      .should('be.visible')
      .should('be.enabled')
      .type(linodePass);

    ui.button
      .findByTitle('Create using command line')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.dialog
      .findByTitle('Create Linode')
      .should('be.visible')
      .within(() => {
        // Switch to cURL view if necessary.
        cy.findByText('cURL')
          .should('be.visible')
          .should('have.attr', 'data-selected');

        // Confirm that cURL command has expected details.
        [
          `"region": "${linodeRegion.id}"`,
          `"type": "g6-dedicated-2"`,
          `"label": "${linodeLabel}"`,
          `"root_pass": "${linodePass}"`,
          '"booted": true',
        ].forEach((line: string) =>
          cy.findByText(line, { exact: false }).should('be.visible')
        );

        cy.findByText('Linode CLI').should('be.visible').click();

        [
          `--region ${linodeRegion.id}`,
          '--type g6-dedicated-2',
          `--label ${linodeLabel}`,
          `--root_pass ${linodePass}`,
          `--booted true`,
        ].forEach((line: string) => cy.contains(line).should('be.visible'));

        ui.buttonGroup
          .findButtonByTitle('Close')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
  });

  /*
   * - Confirms DC-specific pricing UI flow works as expected during Linode creation.
   * - Confirms that pricing docs link is shown in "Region" section.
   * - Confirms that backups pricing is correct when selecting a region with a different price structure.
   */
  it('shows DC-specific pricing information during create flow', () => {
    const rootpass = randomString(32);
    const linodeLabel = randomLabel();
    const initialRegion = getRegionById('us-west');
    const newRegion = getRegionById('us-east');

    const mockLinode = linodeFactory.build({
      label: linodeLabel,
      region: initialRegion.id,
      type: dcPricingMockLinodeTypes[0].id,
    });

    const currentPrice = dcPricingMockLinodeTypes[0].region_prices.find(
      (regionPrice) => regionPrice.id === initialRegion.id
    );
    const currentBackupPrice = dcPricingMockLinodeTypes[0].addons.backups.region_prices.find(
      (regionPrice) => regionPrice.id === initialRegion.id
    );
    const newPrice = dcPricingMockLinodeTypes[1].region_prices.find(
      (linodeType) => linodeType.id === newRegion.id
    );
    const newBackupPrice = dcPricingMockLinodeTypes[1].addons.backups.region_prices.find(
      (regionPrice) => regionPrice.id === newRegion.id
    );

    // Mock requests to get individual types.
    mockGetLinodeType(dcPricingMockLinodeTypes[0]);
    mockGetLinodeType(dcPricingMockLinodeTypes[1]);
    mockGetLinodeTypes(dcPricingMockLinodeTypes).as('getLinodeTypes');

    // intercept request
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getLinodeTypes']);

    mockCreateLinode(mockLinode).as('linodeCreated');
    cy.get('[data-qa-header="Create"]').should('have.text', 'Create');
    getClick('[data-qa-deploy-linode]');

    // A message is shown to instruct users to select a region in order to view plans and prices
    cy.get('[data-qa-tp="Linode Plan"]').should(
      'contain.text',
      'Plan is required.'
    );
    cy.get('[data-qa-tp="Linode Plan"]').should(
      'contain.text',
      dcPricingPlanPlaceholder
    );

    // Check the 'Backups' add on
    cy.get('[data-testid="backups"]').should('be.visible').click();
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionLabel(initialRegion.label).click();
    fbtClick('Shared CPU');
    getClick(`[id="${dcPricingMockLinodeTypes[0].id}"]`);
    // Confirm that the backup prices are displayed as expected.
    cy.get('[data-qa-add-ons="true"]')
      .eq(1)
      .within(() => {
        cy.findByText(`$${currentBackupPrice.monthly}`).should('be.visible');
        cy.findByText('per month').should('be.visible');
      });
    // Confirm that the checkout summary at the bottom of the page reflects the correct price.
    cy.get('[data-qa-summary="true"]').within(() => {
      cy.findByText(`$${currentPrice.monthly.toFixed(2)}/month`).should(
        'be.visible'
      );
      cy.findByText('Backups').should('be.visible');
      cy.findByText(`$${currentBackupPrice.monthly.toFixed(2)}/month`).should(
        'be.visible'
      );
    });

    // Confirm there is a docs link to the pricing page.
    cy.findByText(dcPricingDocsLabel)
      .should('be.visible')
      .should('have.attr', 'href', dcPricingDocsUrl);

    ui.regionSelect.find().click().type(`${newRegion.label} {enter}`);
    fbtClick('Shared CPU');
    getClick(`[id="${dcPricingMockLinodeTypes[0].id}"]`);
    // Confirm that the backup prices are displayed as expected.
    cy.get('[data-qa-add-ons="true"]')
      .eq(1)
      .within(() => {
        cy.findByText(`$${newBackupPrice.monthly}`).should('be.visible');
        cy.findByText('per month').should('be.visible');
      });
    // Confirms that the summary updates to reflect price changes if the user changes their region and plan selection.
    cy.get('[data-qa-summary="true"]').within(() => {
      cy.findByText(`$${newPrice.monthly.toFixed(2)}/month`).should(
        'be.visible'
      );
      cy.findByText('Backups').should('be.visible');
      cy.findByText(`$${newBackupPrice.monthly.toFixed(2)}/month`).should(
        'be.visible'
      );
    });

    getClick('#linode-label').clear().type(linodeLabel);
    cy.get('#root-password').type(rootpass);
    getClick('[data-qa-deploy-linode]');
    cy.wait('@linodeCreated').its('response.statusCode').should('eq', 200);
    fbtVisible(linodeLabel);
    cy.contains('RUNNING', { timeout: 300000 }).should('be.visible');
  });

  it('assigns a VPC not enabled in the region to the linode during create flow', () => {
    const region: Region = getRegionById('us-southeast');
    const mockNoVPCRegion = regionFactory.build({
      id: region.id,
      label: region.label,
      capabilities: ['Linodes'],
    });

    // Mock requests to get individual types.
    mockGetLinodeType(dcPricingMockLinodeTypes[0]);
    mockGetLinodeType(dcPricingMockLinodeTypes[1]);
    mockGetLinodeTypes(dcPricingMockLinodeTypes).as('getLinodeTypes');

    mockAppendFeatureFlags({
      vpc: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    mockGetRegions([mockNoVPCRegion]).as('getRegions');

    // intercept request
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getLinodeTypes', '@getClientStream', '@getFeatureFlags']);

    cy.get('[data-qa-header="Create"]').should('have.text', 'Create');

    // Check the 'Backups' add on
    cy.get('[data-testid="backups"]').should('be.visible').click();
    ui.regionSelect.find().click().type(`${region.label} {enter}`);
    fbtClick('Shared CPU');
    getClick(`[id="${dcPricingMockLinodeTypes[0].id}"]`);

    // the "VPC" section is present
    getVisible('[data-testid="vpc-panel"]').within(() => {
      containsVisible(
        'Allow Linode to communicate in an isolated environment.'
      );
      // VPC in different region should not be available.
      containsVisible('VPC is not available in the selected region.');
    });
  });

  it('assigns a VPC to the linode during create flow', () => {
    const rootpass = randomString(32);
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
    const mockVPCs: VPC[] = vpcFactory.buildList(5, {
      region: 'us-southeast',
      subnets: [mockSubnet],
    });
    const mockVPC = mockVPCs[0];
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
    mockGetVPCs(mockVPCs).as('getVPCs');
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
        .type(`${mockVPCs[0].label}{enter}`);
      // select subnet
      cy.findByText('Select Subnet')
        .should('be.visible')
        .click()
        .type(`${mockSubnet.label}{enter}`);
    });

    getClick('#linode-label').clear().type(linodeLabel);
    cy.get('#root-password').type(rootpass);
    getClick('[data-qa-deploy-linode]');
    cy.wait('@linodeCreated').its('response.statusCode').should('eq', 200);
    fbtVisible(linodeLabel);
    cy.contains('RUNNING', { timeout: 300000 }).should('be.visible');

    fbtClick('Configurations');
    cy.wait(['@getLinodeConfigs', '@getVPC', '@getDisks', '@getVolumes']);

    // Confirm that VLAN and VPC have been assigned.
    cy.findByLabelText('List of Configurations').within(() => {
      cy.get('tr').should('have.length', 2);
      containsVisible(`${mockConfig.label} – GRUB 2`);
      containsVisible('eth0 – Public Internet');
      containsVisible(`eth2 – VPC: ${mockVPC.label}`);
    });
  });
});
