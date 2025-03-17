import { createLinodeRequestFactory, linodeFactory } from '@linode/utilities';
import {
  accountUserFactory,
  grantsFactory,
  profileFactory,
} from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { entityTag } from 'support/constants/cypress';
import { mockGetAccount, mockGetUser } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetLinodeDetails,
  mockGetLinodes,
} from 'support/intercepts/linodes';
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import {
  interceptCreateVolume,
  mockGetVolume,
  mockGetVolumes,
} from 'support/intercepts/volumes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import { randomLabel, randomNumber, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { accountFactory, regionFactory, volumeFactory } from 'src/factories';

import type { Linode, Region } from '@linode/api-v4';

// Local storage override to force volume table to list up to 100 items.
// This is a workaround while we wait to get stuck volumes removed.
// @TODO Remove local storage override when stuck volumes are removed from test accounts.
const pageSizeOverride = {
  PAGE_SIZE: 100,
};

const mockRegions: Region[] = [
  regionFactory.build({
    capabilities: ['Linodes', 'Block Storage', 'Block Storage Encryption'],
    id: 'us-east',
    label: 'Newark, NJ',
    site_type: 'core',
  }),
];

const CLIENT_LIBRARY_UPDATE_COPY =
  'This Linode requires a client library update and will need to be rebooted prior to attaching an encrypted volume.';

authenticate();
describe('volume create flow', () => {
  before(() => {
    cleanUp(['volumes', 'linodes']);
  });

  /*
   * - Creates a volume that is not attached to a Linode.
   * - Confirms that volume is listed correctly on volumes landing page.
   * - Add a single tag to the volume during creation.
   */
  it('creates an unattached volume', () => {
    cy.tag('purpose:syntheticTesting', 'method:e2e', 'purpose:dcTesting');

    const region = chooseRegion();
    const volume = {
      label: randomLabel(),
      region: region.id,
      regionLabel: region.label,
      size: `${randomNumber(10, 250)}`,
    };

    interceptCreateVolume().as('createVolume');

    cy.visitWithLogin('/volumes/create', {
      localStorageOverrides: pageSizeOverride,
    });

    // Fill out and submit volume create form.
    cy.contains('Label').click();
    cy.focused().type(volume.label);
    cy.findByLabelText('Tags').click();
    cy.focused().type(entityTag);
    cy.contains('Size').click();
    cy.focused().type(`{selectall}{backspace}${volume.size}`);
    ui.regionSelect.find().click().type(`${volume.region}{enter}`);

    cy.findByText('Create Volume').click();
    cy.wait('@createVolume');

    // Validate volume configuration drawer opens, then close it.
    cy.findByText('Volume scheduled for creation.').should('be.visible');
    cy.get('[data-qa-close-drawer="true"]').click();

    // Confirm that volume is listed on landing page with expected configuration.
    cy.findByText(volume.label)
      .closest('tr')
      .within(() => {
        cy.findByText(volume.label).should('be.visible');
        cy.findByText(`${volume.size} GB`).should('be.visible');
        cy.findByText(volume.regionLabel).should('be.visible');
        cy.findByText('Unattached');
      });
  });

  /*
   * - Creates a volume that is attached to an existing Linode.
   * - Confirms that volume is listed correctly on Volumes landing page.
   * - Confirms that volume is listed correctly on Linode 'Storage' details page.
   */
  it('creates an attached volume', () => {
    cy.tag('method:e2e', 'purpose:dcTesting');
    const region = chooseRegion();

    const linodeRequest = createLinodeRequestFactory.build({
      booted: false,
      label: randomLabel(),
      region: region.id,
      root_pass: randomString(16),
    });

    const volume = {
      label: randomLabel(),
      region: region.id,
      regionLabel: region.label,
      size: `${randomNumber(10, 250)}`,
    };

    cy.defer(() => createTestLinode(linodeRequest), 'creating Linode').then(
      (linode) => {
        interceptCreateVolume().as('createVolume');

        cy.visitWithLogin('/volumes/create', {
          localStorageOverrides: pageSizeOverride,
        });

        // Fill out and submit volume create form.
        cy.contains('Label').click();
        cy.focused().type(volume.label);
        cy.contains('Size').click();
        cy.focused().type(`{selectall}{backspace}${volume.size}`);
        ui.regionSelect.find().click().type(`${volume.region}{enter}`);

        cy.findByLabelText('Linode').should('be.visible').click();
        cy.focused().type(linode.label);

        ui.autocompletePopper
          .findByTitle(linode.label)
          .should('be.visible')
          .click();

        // @TODO BSE: once BSE is fully rolled out, check for the notice (selected linode doesn't have
        // "Block Storage Encryption" capability + user checked "Encrypt Volume" checkbox) instead of the absence of it
        cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('not.exist');

        cy.findByText('Create Volume').click();
        cy.wait('@createVolume');

        // Confirm volume configuration drawer opens, then close it.
        cy.findByText('Volume scheduled for creation.').should('be.visible');
        cy.get('[data-qa-close-drawer="true"]').click();

        // Confirm that volume is listed on landing page with expected configuration.
        cy.findByText(volume.label)
          .closest('tr')
          .within(() => {
            cy.findByText(volume.label).should('be.visible');
            cy.findByText(`${volume.size} GB`).should('be.visible');
            cy.findByText(volume.regionLabel).should('be.visible');
            cy.findByText(linode.label).should('be.visible');
          });

        // Confirm that volume is listed on Linode 'Storage' details page.
        cy.visitWithLogin(`/linodes/${linode.id}/storage`);
        cy.findByText(volume.label)
          .closest('tr')
          .within(() => {
            cy.findByText(volume.label).should('be.visible');
            cy.findByText(`${volume.size} GB`).should('be.visible');
          });
      }
    );
  });

  /*
   * - Checks for Block Storage Encryption client library update notice on the Volume Create page.
   */
  it('displays a warning notice on Volume Create page re: rebooting for client library updates under the appropriate conditions', () => {
    // Conditions: Block Storage encryption feature flag is on; user has Block Storage Encryption capability; volume being created is encrypted and the
    // selected Linode does not support Block Storage Encryption

    // Mock feature flag -- @TODO BSE: Remove feature flag once BSE is fully rolled out
    mockAppendFeatureFlags({
      blockStorageEncryption: true,
    }).as('getFeatureFlags');

    // Mock account response
    const mockAccount = accountFactory.build({
      capabilities: ['Linodes', 'Block Storage Encryption'],
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetRegions(mockRegions).as('getRegions');

    const linodeRequest = createLinodeRequestFactory.build({
      booted: false,
      label: randomLabel(),
      region: mockRegions[0].id,
      root_pass: randomString(16),
    });

    cy.defer(() => createTestLinode(linodeRequest), 'creating Linode').then(
      (linode: Linode) => {
        cy.visitWithLogin('/volumes/create');
        cy.wait(['@getFeatureFlags', '@getAccount']);

        // Select a linode without the BSE capability
        cy.findByLabelText('Linode').should('be.visible').click();
        cy.focused().type(linode.label);

        ui.autocompletePopper
          .findByTitle(linode.label)
          .should('be.visible')
          .click();

        // Check the "Encrypt Volume" checkbox
        cy.get('[data-qa-checked]').should('be.visible').click();
        // });

        // Ensure warning notice is displayed and "Create Volume" button is disabled
        cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('be.visible');
        ui.button
          .findByTitle('Create Volume')
          .should('be.visible')
          .should('be.disabled');
      }
    );
  });

  /*
   * - Checks for absence of Block Storage Encryption client library update notice on the Volume Create page
   *   when selected linode supports BSE
   */
  it('does not display a warning notice on Volume Create page re: rebooting for client library updates when selected linode supports BSE', () => {
    // Conditions: Block Storage encryption feature flag is on; user has Block Storage Encryption capability; volume being created is encrypted and the
    // selected Linode supports Block Storage Encryption

    // Mock feature flag -- @TODO BSE: Remove feature flag once BSE is fully rolled out
    mockAppendFeatureFlags({
      blockStorageEncryption: true,
    }).as('getFeatureFlags');

    // Mock account response
    const mockAccount = accountFactory.build({
      capabilities: ['Linodes', 'Block Storage Encryption'],
    });

    // Mock linode
    const mockLinode = linodeFactory.build({
      capabilities: ['Block Storage Encryption'],
      id: 123456,
      region: mockRegions[0].id,
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetRegions(mockRegions).as('getRegions');
    mockGetLinodes([mockLinode]).as('getLinodes');
    mockGetLinodeDetails(mockLinode.id, mockLinode);

    cy.visitWithLogin(`/volumes/create`);
    cy.wait(['@getAccount', '@getRegions', '@getLinodes']);

    // Select a linode without the BSE capability
    cy.findByLabelText('Linode').should('be.visible').click();
    cy.focused().type(mockLinode.label);

    ui.autocompletePopper
      .findByTitle(mockLinode.label)
      .should('be.visible')
      .click();

    // Check the "Encrypt Volume" checkbox
    cy.get('[data-qa-checked]').should('be.visible').click();
    // });

    // Ensure warning notice is not displayed and "Create Volume" button is enabled
    cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('not.exist');
    ui.button
      .findByTitle('Create Volume')
      .should('be.visible')
      .should('be.enabled');
  });

  /*
   * - Checks for Block Storage Encryption client library update notice in the Create/Attach Volume drawer from the
       'Storage' details page of an existing Linode.
   */
  it('displays a warning notice re: rebooting for client library updates under the appropriate conditions in Create/Attach Volume drawer', () => {
    // Conditions: Block Storage encryption feature flag is on; user has Block Storage Encryption capability; Linode does not support Block Storage Encryption and the user is trying to attach an encrypted volume

    // Mock feature flag -- @TODO BSE: Remove feature flag once BSE is fully rolled out
    mockAppendFeatureFlags({
      blockStorageEncryption: true,
    }).as('getFeatureFlags');

    // Mock account response
    const mockAccount = accountFactory.build({
      capabilities: ['Linodes', 'Block Storage Encryption'],
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetRegions(mockRegions).as('getRegions');

    const volume = volumeFactory.build({
      encryption: 'enabled',
      region: mockRegions[0].id,
    });

    const linodeRequest = createLinodeRequestFactory.build({
      booted: false,
      label: randomLabel(),
      region: mockRegions[0].id,
      root_pass: randomString(16),
    });

    cy.defer(() => createTestLinode(linodeRequest), 'creating Linode').then(
      (linode: Linode) => {
        mockGetVolumes([volume]).as('getVolumes');
        mockGetVolume(volume);

        cy.visitWithLogin(`/linodes/${linode.id}/storage`);
        cy.wait(['@getFeatureFlags', '@getAccount']);

        // Click "Add Volume" button
        cy.findByText('Add Volume').click();

        // Check "Encrypt Volume" checkbox
        cy.get('[data-qa-drawer="true"]').within(() => {
          cy.get('[data-qa-checked]').should('be.visible').click();
        });

        // Ensure client library update notice is displayed and the "Create Volume" button is disabled
        cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('be.visible');
        ui.button.findByTitle('Create Volume').should('be.disabled');

        // Ensure notice is cleared when switching views in drawer
        cy.get('[data-qa-radio="Attach Existing Volume"]').click();
        cy.wait(['@getVolumes']);
        cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('not.exist');
        ui.button
          .findByTitle('Attach Volume')
          .should('be.visible')
          .should('be.enabled');

        // Ensure notice is displayed in "Attach Existing Volume" view when an encrypted volume is selected, & that the "Attach Volume" button is disabled
        cy.findByPlaceholderText('Select a Volume')
          .should('be.visible')
          .click();
        cy.focused().type(`${volume.label}{downarrow}{enter}`);
        ui.autocompletePopper
          .findByTitle(volume.label)
          .should('be.visible')
          .click();

        cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('be.visible');
        ui.button
          .findByTitle('Attach Volume')
          .should('be.visible')
          .should('be.disabled');
      }
    );
  });

  /*
   * - Creates a volume from the 'Storage' details page of an existing Linode.
   * - Confirms that volume is listed correctly on Linode 'Storage' details page.
   * - Confirms that volume is listed correctly on Volumes landing page.
   */
  it('creates a volume from an existing Linode', () => {
    cy.tag('method:e2e');
    const linodeRequest = createLinodeRequestFactory.build({
      booted: false,
      label: randomLabel(),
      region: chooseRegion().id,
      root_pass: randomString(16),
    });

    cy.defer(() => createTestLinode(linodeRequest), 'creating Linode').then(
      (linode: Linode) => {
        const volume = {
          label: randomLabel(),
          size: `${randomNumber(10, 250)}`,
        };

        cy.visitWithLogin(`/linodes/${linode.id}/storage`, {
          localStorageOverrides: pageSizeOverride,
        });

        // Click "Add Volume" button, fill out and submit volume create drawer form.
        cy.findByText('Add Volume').click();
        cy.get('[data-qa-drawer="true"]').within(() => {
          cy.findByText(`Create Volume for ${linode.label}`).should(
            'be.visible'
          );
          cy.contains('Create and Attach Volume').click();
          cy.contains('Label').click();
          cy.focused().type(volume.label);
          cy.contains('Size').type(`{selectall}{backspace}${volume.size}`);
          cy.findByText('Create Volume').click();
        });

        // Confirm volume configuration drawer opens, then close it.
        cy.get('[data-qa-drawer="true"]').within(() => {
          cy.get('[data-qa-close-drawer="true"]').click();
        });

        // Confirm that volume is listed on Linode 'Storage' details page.
        cy.findByText(volume.label)
          .closest('tr')
          .within(() => {
            cy.findByText(volume.label).should('be.visible');
            cy.findByText(`${volume.size} GB`).should('be.visible');
          });

        // Confirm that volume is listed on landing page with expected configuration.
        cy.visitWithLogin('/volumes', {
          localStorageOverrides: pageSizeOverride,
        });
        cy.findByText(volume.label)
          .closest('tr')
          .within(() => {
            cy.findByText(volume.label).should('be.visible');
            cy.findByText(`${volume.size} GB`).should('be.visible');
            cy.findByText(linode.label).should('be.visible');
          });
      }
    );
  });

  it('does not allow creation of a volume for restricted users from volume create page', () => {
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
        add_volumes: false,
      },
    });

    mockGetProfile(mockProfile);
    mockGetProfileGrants(mockGrants);
    mockGetUser(mockUser);

    cy.visitWithLogin('/volumes/create', {
      localStorageOverrides: pageSizeOverride,
    });

    // Confirm that a notice should be shown informing the user they do not have permission to create a Linode.
    cy.findByText(
      "You don't have permissions to create this Volume. Please contact your account administrator to request the necessary permissions."
    ).should('be.visible');

    // Confirm that the "Label" field should be disabled.
    cy.get('[id="label"]').should('be.visible').should('be.disabled');

    // Confirm that the "Tags" field should be disabled.
    cy.findByLabelText('Tags').should('be.visible').should('be.disabled');

    // Confirm that the "Region" field should be disabled.
    ui.regionSelect.find().should('be.visible').should('be.disabled');

    // Confirm that the "Linode" field should be disabled.
    cy.findByLabelText('Linode').should('be.visible').should('be.disabled');

    // Confirm that the "Config" field should be disabled.
    cy.findByLabelText('Config').should('be.visible').should('be.disabled');

    // Confirm that the "Size" field should be disabled.
    cy.get('[id="size"]').should('be.visible').should('be.disabled');

    // Confirm that the "Create Volume" button is disabled.
    cy.findByText('Create Volume').should('be.visible').should('be.disabled');
  });
});
