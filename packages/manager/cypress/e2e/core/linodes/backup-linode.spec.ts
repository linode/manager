/* eslint-disable sonarjs/no-duplicate-string */
import type { Linode } from '@linode/api-v4';
import { createLinode } from '@linode/api-v4';
import {
  linodeFactory,
  linodeBackupsFactory,
  accountSettingsFactory,
  createLinodeRequestFactory,
} from '@src/factories';
import { authenticate } from 'support/api/authentication';
import {
  mockGetAccountSettings,
  mockUpdateAccountSettings,
} from 'support/intercepts/account';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import {
  mockGetLinodes,
  mockEnableLinodeBackups,
  mockGetLinodeType,
  mockGetLinodeTypes,
  interceptEnableLinodeBackups,
  interceptGetLinode,
  interceptCreateLinodeSnapshot,
} from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { randomLabel } from 'support/util/random';
import { dcPricingMockLinodeTypes } from 'support/constants/dc-specific-pricing';
import { chooseRegion } from 'support/util/regions';

authenticate();
describe('linode backups', () => {
  before(() => {
    cleanUp('linodes');
  });

  /*
   * - Confirms that backups can be enabled for a Linode using real API data.
   * - Confirms that enable backup prompt is shown when backups are not enabled.
   * - Confirms that user is warned of additional backups charges before enabling.
   * - Confirms that Linode details page updates to reflect that backups are enabled.
   */
  it('can enable backups', () => {
    // Create a Linode that is not booted and which does not have backups enabled.
    const createLinodeRequest = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
      backups_enabled: false,
      booted: false,
    });

    cy.defer(createLinode(createLinodeRequest), 'creating Linode').then(
      (linode: Linode) => {
        interceptGetLinode(linode.id).as('getLinode');
        interceptEnableLinodeBackups(linode.id).as('enableBackups');

        // Navigate to Linode details page "Backups" tab.
        cy.visitWithLogin(`linodes/${linode.id}/backup`);
        cy.wait('@getLinode');

        // Wait for Linode to finish provisioning.
        cy.findByText('OFFLINE').should('be.visible');

        // Confirm that enable backups prompt is shown.
        cy.contains(
          'Three backup slots are executed and rotated automatically'
        ).should('be.visible');

        ui.button
          .findByTitle('Enable Backups')
          .should('be.visible')
          .should('be.enabled')
          .click();

        ui.dialog
          .findByTitle('Enable backups?')
          .should('be.visible')
          .within(() => {
            // Confirm that user is warned of additional backup charges.
            cy.contains(/.* This will add .* to your monthly bill\./).should(
              'be.visible'
            );
            ui.button
              .findByTitle('Enable Backups')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm that toast notification appears and UI updates to reflect enabled backups.
        cy.wait('@enableBackups');
        ui.toast.assertMessage('Backups are being enabled for this Linode.');
        cy.findByText(
          'Automatic and manual backups will be listed here'
        ).should('be.visible');
      }
    );
  });

  /*
   * - Confirms that users can create Linode snapshots using real API data.
   * - Confirms that backups page content updates to reflect new snapshot.
   */
  it('can capture a manual snapshot', () => {
    // Create a Linode that is not booted and which has backups enabled.
    const createLinodeRequest = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
      backups_enabled: true,
      booted: false,
    });

    const snapshotName = randomLabel();

    cy.defer(createLinode(createLinodeRequest), 'creating Linode').then(
      (linode: Linode) => {
        interceptGetLinode(linode.id).as('getLinode');
        interceptCreateLinodeSnapshot(linode.id).as('createSnapshot');

        // Navigate to Linode details page "Backups" tab.
        cy.visitWithLogin(`/linodes/${linode.id}/backup`);
        cy.wait('@getLinode');

        // Wait for the Linode to finish provisioning.
        cy.findByText('OFFLINE').should('be.visible');

        cy.findByText('Manual Snapshot')
          .should('be.visible')
          .parent()
          .within(() => {
            // Confirm that "Take Snapshot" button is disabled until a name is entered.
            ui.button
              .findByTitle('Take Snapshot')
              .should('be.visible')
              .should('be.disabled');

            // Enter a snapshot name, click "Take Snapshot".
            cy.findByLabelText('Name Snapshot')
              .should('be.visible')
              .clear()
              .type(snapshotName);

            ui.button
              .findByTitle('Take Snapshot')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Submit confirmation, confirm that toast message appears.
        ui.dialog
          .findByTitle('Take a snapshot?')
          .should('be.visible')
          .within(() => {
            // Confirm user is warned that previous snapshot will be replaced.
            cy.contains('overriding your previous snapshot').should(
              'be.visible'
            );
            cy.contains('Are you sure?').should('be.visible');

            ui.button
              .findByTitle('Take Snapshot')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        cy.wait('@createSnapshot');
        ui.toast.assertMessage('Starting to capture snapshot');

        // Confirm that new snapshot is listed in backups table.
        cy.findByText(snapshotName)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByText('Pending').should('be.visible');
          });
      }
    );
  });
});

describe('"Enable Linode Backups" banner', () => {
  /**
   * - Uses mock API data to confirm that "Enable Linode Backups" notice appears.
   * - Confirms notice appears when not dismissed and when Linodes do not have backups enabled.
   * - Confirms notice does not appear once dismissed.
   * - Confirms notice does not appear when all Linodes have backups enabled.
   * - Confirms notice can be dismissed.
   */
  it('shows "Enable Linode Backups" banner', () => {
    const enableBackupsMessage =
      'Enable Linode Backups to protect your data and recover quickly in an emergency.';

    // Mock Linodes that do not have backups enabled.
    const mockLinodes = linodeFactory.buildList(2, {
      backups: { enabled: false },
    });

    // Mock Linodes which do have backups enabled.
    const mockLinodesWithBackups = linodeFactory.buildList(2, {
      backups: linodeBackupsFactory.build({
        enabled: true,
      }),
    });

    // Navigate to Linodes landing page with backups notice not dismissed.
    // Confirm notice appears when Linodes do not have backups enabled,
    // and confirm that the notice can be dismissed.
    mockGetLinodes(mockLinodes).as('getLinodes');
    cy.visitWithLogin('/linodes', {
      preferenceOverrides: {
        backups_cta_dismissed: false,
      },
    });
    cy.wait('@getLinodes');
    cy.contains(enableBackupsMessage).should('be.visible');

    // Click dismiss button.
    cy.findByLabelText('Dismiss notice enabling Linode backups')
      .should('be.visible')
      .click();

    cy.contains(enableBackupsMessage).should('not.exist');

    // Navigate to Linodes landing page with backups notice dismissed.
    // Confirm notice does not appear when it has already been dismissed.
    cy.visitWithLogin('/linodes', {
      preferenceOverrides: {
        backups_cta_dismissed: true,
      },
    });
    cy.wait('@getLinodes');
    cy.contains(enableBackupsMessage).should('not.exist');

    // Navigate to Linodes landing page with backups notice not dismissed.
    // Confirm notice does not appear when Linodes already have backups enabled.
    mockGetLinodes(mockLinodesWithBackups).as('getLinodes');
    cy.visitWithLogin('/linodes', {
      perferenceOverrides: {
        backups_cta_dismissed: false,
      },
    });
    cy.wait('@getLinodes');
    cy.contains(enableBackupsMessage).should('not.exist');
  });

  /*
   * - Confirms that Linode backups can be enabled via "Enable Linode Backups" notice.
   * - Confirms that backup auto-enrollment settings are shown when auto-enrollment is disabled.
   * - Confirms that backups drawer lists each Linode which does not have backups enabled.
   * - Confirms that backups drawer does not list Linodes which already have backups enabled.
   * - Confirms that "Region" column is not shown when DC specific pricing is disabled.
   * - Confirms toast notification appears upon updating Linode backup settings.
   */
  it('can enable Linode backups via "Enable Linode Backups" notice', () => {
    const mockLinodesNoBackups = linodeFactory.buildList(3, {
      backups: { enabled: false },
    });

    const mockLinodesBackups = linodeFactory.buildList(2, {
      backups: linodeBackupsFactory.build(),
    });

    // Combined list of Linodes, some with backups enabled and others without.
    const mockLinodes = [...mockLinodesNoBackups, ...mockLinodesBackups];

    // Mock account settings before and after enabling auto backup enrollment.
    const mockInitialAccountSettings = accountSettingsFactory.build({
      backups_enabled: false,
    });

    const mockUpdatedAccountSettings = {
      ...mockInitialAccountSettings,
      backups_enabled: true,
    };

    // Mock each API request to enable backups, and return an array of aliases for each request.
    const enableBackupAliases = mockLinodesNoBackups.map(
      (linode: Linode): string => {
        const alias = `enableLinodeBackups-${linode.label}`;
        mockEnableLinodeBackups(linode.id).as(alias);
        return `@${alias}`;
      }
    );

    // TODO: DC Pricing - M3-7073: Remove feature flag mocks when DC pricing goes live.
    mockAppendFeatureFlags({
      dcSpecificPricing: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientstream');
    mockGetLinodes(mockLinodes).as('getLinodes');
    mockGetAccountSettings(mockInitialAccountSettings).as('getAccountSettings');
    mockUpdateAccountSettings(mockUpdatedAccountSettings).as(
      'updateAccountSettings'
    );

    cy.visitWithLogin('/linodes', {
      preferenceOverrides: {
        backups_cta_dismissed: false,
      },
    });

    cy.wait([
      '@getAccountSettings',
      '@getClientstream',
      '@getFeatureFlags',
      '@getLinodes',
    ]);

    // Click "Enable Linode Backups" link within backups notice.
    cy.findByText('Enable Linode Backups').should('be.visible').click();

    ui.drawer
      .findByTitle('Enable All Backups')
      .should('be.visible')
      .within(() => {
        // Confirm that auto-enroll setting section is shown.
        cy.findByText('Auto Enroll All New Linodes in Backups').should(
          'be.visible'
        );

        // Confirm that Linodes without backups enabled are listed.
        mockLinodesNoBackups.forEach((linode: Linode) => {
          cy.findByText(linode.label).should('be.visible');
        });

        // Confirm that Linodes with backups already enabled are not listed.
        mockLinodesBackups.forEach((linode: Linode) => {
          cy.findByText(linode.label).should('not.exist');
        });

        // Confirm that "Region" column is not shown.
        // TODO: DC Pricing - M3-7073: Remove column assertions when DC pricing goes live.
        cy.findByLabelText('List of Linodes without backups')
          .should('be.visible')
          .within(() => {
            cy.findByText('Region').should('not.exist');
          });

        // Confirm backup changes.
        ui.button
          .findByTitle('Confirm')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Wait for backups to be enabled and settings to be updated, then confirm
    // that toast notification appears in order to confirm the changes.
    cy.wait([...enableBackupAliases, '@updateAccountSettings']);

    ui.toast.assertMessage(
      '3 Linodes have been enrolled in automatic backups, and all new Linodes will automatically be backed up.'
    );
  });

  /*
   * - Confirms that DC-specific pricing information is displayed in backups drawer when feature is enabled.
   */
  it('displays DC-specific pricing information when feature flag is enabled', () => {
    // TODO: DC Pricing - M3-7073: Move assertions involving pricing to above test when DC-specific pricing goes live.
    // TODO: DC Pricing - M3-7073: Remove this test when DC-specific pricing goes live.
    const mockLinodes = [
      // `us-central` has a normal pricing structure, whereas `us-east` and `us-west`
      // are mocked to have special pricing structures.
      //
      // See `dcPricingMockLinodeTypes` exported from `support/constants/dc-specific-pricing.ts`.
      linodeFactory.build({
        label: randomLabel(),
        region: 'us-east',
        backups: { enabled: false },
        type: dcPricingMockLinodeTypes[0].id,
      }),
      linodeFactory.build({
        label: randomLabel(),
        region: 'us-west',
        backups: { enabled: false },
        type: dcPricingMockLinodeTypes[1].id,
      }),
      linodeFactory.build({
        label: randomLabel(),
        region: 'us-central',
        backups: { enabled: false },
        type: 'g6-nanode-1',
      }),
    ];

    // The expected backup price for each Linode, as shown in backups drawer table.
    const expectedPrices = [
      '$3.57/mo', // us-east mocked price.
      '$4.17/mo', // us-west mocked price.
      '$2.00/mo', // regular price.
    ];

    // The expected total cost of enabling backups, as shown in backups drawer.
    const expectedTotal = '$7.74/mo';

    mockGetLinodeType(dcPricingMockLinodeTypes[0]);
    mockGetLinodeType(dcPricingMockLinodeTypes[1]);
    mockGetLinodeTypes(dcPricingMockLinodeTypes);

    mockAppendFeatureFlags({
      dcSpecificPricing: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientstream');
    mockGetLinodes(mockLinodes).as('getLinodes');

    cy.visitWithLogin('/linodes', {
      preferenceOverrides: {
        backups_cta_dismissed: false,
      },
    });

    cy.wait(['@getFeatureFlags', '@getClientstream', '@getLinodes']);

    // Click "Enable Linode Backups" link within backups notice.
    cy.findByText('Enable Linode Backups').should('be.visible').click();

    // Confirm that DC-specific pricing content is shown in the backups drawer.
    ui.drawer
      .findByTitle('Enable All Backups')
      .should('be.visible')
      .within(() => {
        // Confirm that expected total cost is shown.
        cy.contains(`Total for 3 Linodes: ${expectedTotal}`).should(
          'be.visible'
        );

        // Confirm that "Region" column is shown.
        cy.findByLabelText('List of Linodes without backups')
          .should('be.visible')
          .within(() => {
            cy.findByText('Region').should('be.visible');
          });

        // Confirm that each Linode is listed alongside its DC-specific price.
        mockLinodes.forEach((linode: Linode, i: number) => {
          const expectedPrice = expectedPrices[i];
          cy.findByText(linode.label)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              cy.findByText(expectedPrice).should('be.visible');
            });
        });
      });
  });
});
