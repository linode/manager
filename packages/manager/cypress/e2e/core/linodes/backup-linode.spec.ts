/* eslint-disable sonarjs/no-duplicate-string */
import type { Linode } from '@linode/api-v4';
import {
  linodeFactory,
  linodeBackupsFactory,
  accountSettingsFactory,
} from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { createLinode, deleteLinodeById } from 'support/api/linodes';
import {
  containsClick,
  containsVisible,
  fbtClick,
  fbtVisible,
  getClick,
} from 'support/helpers';
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
} from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { apiMatcher } from 'support/util/intercepts';
import { buildArray } from 'support/util/arrays';
import { randomLabel } from 'support/util/random';
import { dcPricingMockLinodeTypes } from 'support/constants/dc-specific-pricing';

authenticate();
describe('linode backups', () => {
  before(() => {
    cleanUp('linodes');
  });

  it('enable backups', () => {
    createLinode().then((linode) => {
      // intercept request
      cy.intercept(
        'POST',
        apiMatcher(`linode/instances/${linode.id}/backups/enable`)
      ).as('enableBackups');
      // intercept response
      cy.intercept(apiMatcher('account/settings')).as('getSettings');
      cy.visitWithLogin(`/linodes/${linode.id}/backup`);
      // if account is managed, test will pass but skip enabling backups
      containsVisible(`${linode.label}`);
      cy.wait('@getSettings').then((xhr) => {
        const response = xhr.response?.body;
        const managed: boolean = response['managed'];
        if (!managed) {
          containsClick('Enable Backups');
          getClick('[data-qa-confirm-enable-backups="true"]');
          cy.wait('@enableBackups');
        }
      });
      if (
        // TODO Resolve potential flake.
        // If Cloud Manager loads slowly (e.g. due to slow API requests, network issues, etc.),
        // it is possible to load the Linode details page after it has finished booting. In those
        // cases, Cypress will never find the `PROVISIONING` status indicator and the test will fail.
        cy.contains('PROVISIONING', { timeout: 180000 }).should('not.exist') &&
        cy.contains('BOOTING', { timeout: 180000 }).should('not.exist')
      ) {
        containsVisible('Automatic and manual backups will be listed here');
      }
      deleteLinodeById(linode.id);
    });
  });

  it('create linode from snapshot', () => {
    createLinode({ backups_enabled: true }).then((linode) => {
      cy.intercept(
        'POST',
        apiMatcher(`linode/instances/${linode.id}/backups`)
      ).as('enableBackups');
      cy.visitWithLogin(`/linodes/${linode.id}/backup`);
      // intercept request

      fbtVisible(`${linode.label}`);
      if (
        // TODO Resolve potential flake.
        cy.contains('PROVISIONING', { timeout: 180000 }).should('not.exist') &&
        cy.contains('BOOTING', { timeout: 180000 }).should('not.exist')
      ) {
        cy.get('[data-qa-manual-name="true"]').type(`${linode.label} backup`);
        fbtClick('Take Snapshot');
        getClick('[data-qa-confirm="true"]');
      }
      if (!cy.contains('Linode busy.').should('not.exist')) {
        getClick('[data-qa-confirm="true"]');
      }
      cy.wait('@enableBackups').its('response.statusCode').should('eq', 200);
      ui.toast.assertMessage('Starting to capture snapshot');
      deleteLinodeById(linode.id);
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
    cy.findByLabelText('Dismiss Enable Linode Backups notice')
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
        cy.findByLabelText('List of Linodes')
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
        cy.findByLabelText('List of Linodes')
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
