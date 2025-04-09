/* eslint-disable sonarjs/no-duplicate-string */
import {
  createLinodeRequestFactory,
  linodeBackupsFactory,
  linodeFactory,
} from '@linode/utilities';
import { accountSettingsFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { expectManagedDisabled } from 'support/api/managed';
import { dcPricingMockLinodeTypesForBackups } from 'support/constants/dc-specific-pricing';
import { LINODE_CREATE_TIMEOUT } from 'support/constants/linodes';
import {
  mockGetAccountSettings,
  mockUpdateAccountSettings,
} from 'support/intercepts/account';
import {
  interceptCancelLinodeBackups,
  interceptCreateLinodeSnapshot,
  interceptEnableLinodeBackups,
  interceptGetLinode,
  mockEnableLinodeBackups,
  mockGetLinodeType,
  mockGetLinodeTypes,
  mockGetLinodes,
} from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import type { Linode } from '@linode/api-v4';

const BackupsCancellationNote =
  'Once backups for this Linode have been canceled, you cannot re-enable them for 24 hours.';
const ReenableBackupsFailureNote =
  'Please wait 24 hours before reactivating backups for this Linode.';

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
   * - Confirms that user can cancel Linode backups.
   * - Confirms that user cannot re-enable Linode backups after canceling.
   */
  it('can enable backups', () => {
    cy.tag('method:e2e');
    // Skip or optionally fail if test account has Managed enabled.
    // This is necessary because Managed accounts have backups enabled implicitly.
    expectManagedDisabled();

    // Create a Linode that is not booted and which does not have backups enabled.
    const createLinodeRequest = createLinodeRequestFactory.build({
      backups_enabled: false,
      booted: false,
      label: randomLabel(),
      region: chooseRegion().id,
    });

    cy.defer(
      () => createTestLinode(createLinodeRequest),
      'creating Linode'
    ).then((linode: Linode) => {
      interceptGetLinode(linode.id).as('getLinode');
      interceptEnableLinodeBackups(linode.id).as('enableBackups');
      interceptCancelLinodeBackups(linode.id).as('cancelBackups');

      // Navigate to Linode details page "Backups" tab.
      cy.visitWithLogin(`linodes/${linode.id}`);
      cy.findAllByText('Backups').should('be.visible').click();
      cy.wait('@getLinode');

      // Wait for Linode to finish provisioning.
      cy.findByText('OFFLINE', { timeout: LINODE_CREATE_TIMEOUT }).should(
        'be.visible'
      );

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
          // eslint-disable-next-line sonarjs/slow-regex
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
      cy.findByText('Automatic and manual backups will be listed here').should(
        'be.visible'
      );

      // Confirm Backups Cancellation Note is visible when cancel Linode backups.
      ui.button
        .findByTitle('Cancel Backups')
        .should('be.visible')
        .should('be.enabled')
        .click();
      ui.dialog
        .findByTitle('Confirm Cancellation')
        .should('be.visible')
        .within(() => {
          cy.contains(BackupsCancellationNote).should('be.visible');
          ui.button
            .findByTitle('Cancel Backups')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });
      // Confirm toast notification appears and UI updates to reflect cancel backups.
      cy.wait('@cancelBackups');
      ui.toast.assertMessage('Backups are being canceled for this Linode');

      // Confirm that user is warned when attempting to re-enable Linode backups after canceling.
      ui.button
        .findByTitle('Enable Backups')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.dialog
        .findByTitle('Enable backups?')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Enable Backups')
            .should('be.visible')
            .should('be.enabled')
            .click();

          // Confirm that users cannot re-enable backups without first waiting 24 hrs.
          cy.contains(ReenableBackupsFailureNote).should('be.visible');
        });
    });
  });

  /*
   * - Confirms that users can create Linode snapshots using real API data.
   * - Confirms that backups page content updates to reflect new snapshot.
   */
  it('can capture a manual snapshot', () => {
    cy.tag('method:e2e');
    // Create a Linode that is not booted and which has backups enabled.
    const createLinodeRequest = createLinodeRequestFactory.build({
      backups_enabled: true,
      booted: false,
      label: randomLabel(),
      region: chooseRegion().id,
    });

    const snapshotName = randomLabel();

    cy.defer(
      () => createTestLinode(createLinodeRequest),
      'creating Linode'
    ).then((linode: Linode) => {
      interceptGetLinode(linode.id).as('getLinode');
      interceptCreateLinodeSnapshot(linode.id).as('createSnapshot');

      // Navigate to Linode details page "Backups" tab.
      cy.visitWithLogin(`linodes/${linode.id}`);
      cy.findAllByText('Backups').should('be.visible').click();
      cy.wait('@getLinode');

      // Wait for the Linode to finish provisioning.
      cy.findByText('OFFLINE', { timeout: LINODE_CREATE_TIMEOUT }).should(
        'be.visible'
      );

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
          cy.findByLabelText('Name Snapshot').should('be.visible').clear();
          cy.focused().type(snapshotName);

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
          cy.contains('overriding your previous snapshot').should('be.visible');
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
    });
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

    const mockAccountSettings = accountSettingsFactory.build({
      backups_enabled: false,
      managed: false,
    });

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
    mockGetAccountSettings(mockAccountSettings).as('getAccountSettings');
    cy.visitWithLogin('/linodes', {
      preferenceOverrides: {
        backups_cta_dismissed: false,
      },
    });
    cy.wait(['@getLinodes', '@getAccountSettings']);
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
   * - Confirms toast notification appears upon updating Linode backup settings.
   */
  it('can enable Linode backups via "Enable Linode Backups" notice', () => {
    const mockLinodesNoBackups = [
      // `us-central` has a normal pricing structure, whereas `us-east` and `us-west`
      // are mocked to have special pricing structures.
      //
      // See `dcPricingMockLinodeTypes` exported from `support/constants/dc-specific-pricing.ts`.
      linodeFactory.build({
        backups: { enabled: false },
        label: randomLabel(),
        region: 'us-ord',
        type: dcPricingMockLinodeTypesForBackups[0].id,
      }),
      linodeFactory.build({
        backups: { enabled: false },
        label: randomLabel(),
        region: 'us-east',
        type: dcPricingMockLinodeTypesForBackups[1].id,
      }),
      linodeFactory.build({
        backups: { enabled: false },
        label: randomLabel(),
        region: 'us-west',
        type: dcPricingMockLinodeTypesForBackups[2].id,
      }),
      linodeFactory.build({
        backups: { enabled: false },
        label: randomLabel(),
        region: 'us-central',
        type: 'g6-nanode-1',
      }),
    ];

    const mockLinodesBackups = linodeFactory.buildList(2, {
      backups: linodeBackupsFactory.build(),
    });

    // Combined list of Linodes, some with backups enabled and others without.
    const mockLinodes = [...mockLinodesNoBackups, ...mockLinodesBackups];

    // Mock account settings before and after enabling auto backup enrollment.
    const mockInitialAccountSettings = accountSettingsFactory.build({
      backups_enabled: false,
      managed: false,
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

    // The expected backup price for each Linode, as shown in backups drawer table.
    const expectedPrices = [
      '$0.00/mo', // us-ord mocked price.
      '$3.57/mo', // us-east mocked price.
      '$4.17/mo', // us-west mocked price.
      '$2.00/mo', // regular price.
    ];

    // The expected total cost of enabling backups, as shown in backups drawer.
    const expectedTotal = '$9.74/mo';

    mockGetLinodeType(dcPricingMockLinodeTypesForBackups[0]);
    mockGetLinodeType(dcPricingMockLinodeTypesForBackups[1]);
    mockGetLinodeTypes(dcPricingMockLinodeTypesForBackups);

    mockGetLinodes(mockLinodes).as('getLinodes');

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

    cy.wait(['@getAccountSettings', '@getLinodes']);

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

        // Confirm that expected total cost is shown.
        cy.contains(`Total for 4 Linodes: ${expectedTotal}`).should(
          'be.visible'
        );

        // Confirm that "Region" column is shown.
        cy.findByLabelText('List of Linodes without backups')
          .should('be.visible')
          .within(() => {
            cy.findByText('Region').should('be.visible');
          });

        // Confirm that each Linode without backups enabled is listed alongside its DC-specific price.
        mockLinodesNoBackups.forEach((linode: Linode, i: number) => {
          const expectedPrice = expectedPrices[i];
          cy.findByText(linode.label)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              cy.findByText(expectedPrice).should('be.visible');
              // Confirm no error indicator appears for $0.00 prices.
              cy.findByLabelText(
                'There was an error loading the price.'
              ).should('not.exist');
            });
        });

        // Confirm that Linodes with backups already enabled are not listed.
        mockLinodesBackups.forEach((linode: Linode) => {
          cy.findByText(linode.label).should('not.exist');
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
      '4 Linodes have been enrolled in automatic backups, and all new Linodes will automatically be backed up.'
    );
  });
});
