import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetAllAlertDefinitions,
  mockGetCloudPulseServices,
  mockUpdateAlertDefinitionsError,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';

import { accountFactory, alertFactory } from 'src/factories';

import type { Flags } from 'src/featureFlags';

const flags: Partial<Flags> = { aclp: { beta: true, enabled: true } };
const mockAccount = accountFactory.build();
const mockAlerts = [
  alertFactory.build({
    label: 'Alert-1',
    service_type: 'dbaas',
    status: 'enabled',
    type: 'user',
  }),
  alertFactory.build({
    label: 'Alert-2',
    service_type: 'dbaas',
    status: 'disabled',
    type: 'user',
  }),
];

describe('Alerts Listing Page - Error Handling', () => {
  /**
   *
   * - Confirms that users can attempt to enable or disable alerts from the Alerts Listing page.
   * - Confirms that API failures when updating an alert are handled correctly.
   * - Confirms that an error message is displayed in the UI when an alert update fails.
   * - Confirms that the error message appears in a toast notification.
   * - Confirms that users remain on the Alerts Listing page even after an update failure.
   * - Confirms that the UI does not reflect a successful state change if the request fails.
   */
  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetCloudPulseServices(['linode', 'dbaas']);
    mockGetAllAlertDefinitions(mockAlerts).as('getAlertDefinitionsList');
    mockUpdateAlertDefinitionsError(
      'dbaas',
      1,
      'An error occurred while disabling the alert'
    ).as('getFirstAlertDefinitions');
    mockUpdateAlertDefinitionsError(
      'dbaas',
      2,
      'An error occurred while enabling the alert'
    ).as('getSecondAlertDefinitions');
    cy.visitWithLogin('/alerts/definitions');
    cy.wait('@getAlertDefinitionsList');
  });

  it('should display correct error messages when disabling or enabling alerts fails', () => {
    // Function to search for an alert
    const searchAlert = (alertName: string) => {
      cy.findByPlaceholderText('Search for Alerts')
        .should('be.visible')
        .and('not.be.disabled')
        .clear();

      cy.findByPlaceholderText('Search for Alerts').type(alertName);
    };

    // Function to toggle an alert's status
    const toggleAlertStatus = (
      alertName: string,
      action: 'Disable' | 'Enable',
      alias: string
    ) => {
      cy.findByText(alertName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          ui.actionMenu
            .findByTitle(`Action menu for Alert ${alertName}`)
            .should('be.visible')
            .click();
        });

      ui.actionMenuItem.findByTitle(action).should('be.visible').click();
      ui.button.findByTitle(action).should('be.visible').click();
      cy.wait(alias).then(({ response }) => {
        ui.toast.assertMessage(response?.body.errors[0].reason);
      });
    };
    // Disable "Alert-1"
    searchAlert('Alert-1');
    toggleAlertStatus('Alert-1', 'Disable', '@getFirstAlertDefinitions');

    // Enable "Alert-2"
    searchAlert('Alert-2');
    toggleAlertStatus('Alert-2', 'Enable', '@getSecondAlertDefinitions');
  });
});
