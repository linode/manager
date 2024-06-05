import type { Linode, Region } from '@linode/api-v4';
import { accountFactory, linodeFactory, regionFactory } from 'src/factories';
import { authenticate } from 'support/api/authentication';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { createTestLinode } from 'support/util/linodes';
import { randomLabel, randomPhrase } from 'support/util/random';
import { mockGetRegions } from 'support/intercepts/regions';
import {
  mockGetLinodeDetails,
  mockGetLinodes,
} from 'support/intercepts/linodes';

const mockRegions: Region[] = [
  regionFactory.build({
    capabilities: ['Linodes', 'Disk Encryption'],
    id: 'us-east',
    label: 'Newark, NJ',
    site_type: 'core',
  }),
  regionFactory.build({
    capabilities: ['Linodes', 'Disk Encryption'],
    id: 'us-den-edge-1',
    label: 'Edge - Denver, CO',
    site_type: 'edge',
  }),
];

const mockLinodes: Linode[] = [
  linodeFactory.build({
    label: 'core-region-linode',
    region: mockRegions[0].id,
  }),
  linodeFactory.build({
    label: 'edge-region-linode',
    region: mockRegions[1].id,
  }),
];

const DISK_ENCRYPTION_IMAGES_CAVEAT_COPY =
  'Virtual Machine Images are not encrypted.';

authenticate();
describe('create image (e2e)', () => {
  before(() => {
    cleanUp(['linodes', 'images']);
  });

  it('create image from a linode', () => {
    const label = randomLabel();
    const description = randomPhrase();

    // When Alpine 3.19 becomes deprecated, we will have to update these values for the test to pass.
    const image = 'linode/alpine3.19';
    const disk = 'Alpine 3.19 Disk';

    cy.defer(
      () => createTestLinode({ image }, { waitForDisks: true }),
      'create linode'
    ).then((linode: Linode) => {
      cy.visitWithLogin('/images/create');

      // Find the Linode select and open it
      cy.findByLabelText('Linode')
        .should('be.visible')
        .should('be.enabled')
        .should('have.attr', 'placeholder', 'Select a Linode')
        .click()
        .type(linode.label);

      // Select the Linode
      ui.autocompletePopper
        .findByTitle(linode.label)
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Find the Disk select and open it
      cy.findByLabelText('Disk')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Select the Linode disk
      ui.autocompletePopper.findByTitle(disk).should('be.visible').click();

      // Give the Image a label
      cy.findByLabelText('Label')
        .should('be.enabled')
        .should('be.visible')
        .type(label);

      // Give the Image a description
      cy.findByLabelText('Description')
        .should('be.enabled')
        .should('be.visible')
        .type(description);

      // Submit the image create form
      ui.button
        .findByTitle('Create Image')
        .should('be.enabled')
        .should('have.attr', 'type', 'submit')
        .click();

      ui.toast.assertMessage('Image scheduled for creation.');

      // Verify we redirect to the images landing page upon successful creation
      cy.url().should('endWith', 'images');

      // Verify the newly created image shows on the Images landing page
      cy.findByText(label)
        .closest('tr')
        .within(() => {
          // Verify Image label shows
          cy.findByText(label).should('be.visible');
          // Verify Image has status of "Creating"
          cy.findByText('Creating', { exact: false }).should('be.visible');
        });
    });
  });

  it('displays notice informing user that Images are not encrypted, provided the LDE feature is enabled and the selected linode is not in an Edge region', () => {
    // Mock feature flag -- @TODO LDE: Remove feature flag once LDE is fully rolled out
    mockAppendFeatureFlags({
      linodeDiskEncryption: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    // Mock responses
    const mockAccount = accountFactory.build({
      capabilities: ['Linodes', 'Disk Encryption'],
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetRegions(mockRegions).as('getRegions');
    mockGetLinodes(mockLinodes).as('getLinodes');

    // intercept request
    cy.visitWithLogin('/images/create');
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getAccount',
      '@getLinodes',
      '@getRegions',
    ]);

    // Find the Linode select and open it
    cy.findByLabelText('Linode')
      .should('be.visible')
      .should('be.enabled')
      .should('have.attr', 'placeholder', 'Select a Linode')
      .click();

    // Select the Linode
    ui.autocompletePopper
      .findByTitle(mockLinodes[0].label)
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Check if notice is visible
    cy.findByText(DISK_ENCRYPTION_IMAGES_CAVEAT_COPY).should('be.visible');
  });

  it('does not display a notice informing user that Images are not encrypted if the LDE feature is disabled', () => {
    // Mock feature flag -- @TODO LDE: Remove feature flag once LDE is fully rolled out
    mockAppendFeatureFlags({
      linodeDiskEncryption: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    // Mock responses
    const mockAccount = accountFactory.build({
      capabilities: ['Linodes', 'Disk Encryption'],
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetRegions(mockRegions).as('getRegions');
    mockGetLinodes(mockLinodes).as('getLinodes');

    // intercept request
    cy.visitWithLogin('/images/create');
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getAccount',
      '@getLinodes',
      '@getRegions',
    ]);

    // Find the Linode select and open it
    cy.findByLabelText('Linode')
      .should('be.visible')
      .should('be.enabled')
      .should('have.attr', 'placeholder', 'Select a Linode')
      .click();

    // Select the Linode
    ui.autocompletePopper
      .findByTitle(mockLinodes[0].label)
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Check if notice is visible
    cy.findByText(DISK_ENCRYPTION_IMAGES_CAVEAT_COPY).should('not.exist');
  });

  it('does not display a notice informing user that Images are not encrypted if the selected linode is in an Edge region', () => {
    // Mock feature flag -- @TODO LDE: Remove feature flag once LDE is fully rolled out
    mockAppendFeatureFlags({
      linodeDiskEncryption: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    // Mock responses
    const mockAccount = accountFactory.build({
      capabilities: ['Linodes', 'Disk Encryption'],
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetRegions(mockRegions).as('getRegions');
    mockGetLinodes(mockLinodes).as('getLinodes');
    mockGetLinodeDetails(mockLinodes[1].id, mockLinodes[1]);

    // intercept request
    cy.visitWithLogin('/images/create');
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getAccount',
      '@getRegions',
      '@getLinodes',
    ]);

    // Find the Linode select and open it
    cy.findByLabelText('Linode')
      .should('be.visible')
      .should('be.enabled')
      .should('have.attr', 'placeholder', 'Select a Linode')
      .click();

    // Select the Linode
    ui.autocompletePopper
      .findByTitle(mockLinodes[1].label)
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Check if notice is visible
    cy.findByText(DISK_ENCRYPTION_IMAGES_CAVEAT_COPY).should('not.exist');
  });
});
