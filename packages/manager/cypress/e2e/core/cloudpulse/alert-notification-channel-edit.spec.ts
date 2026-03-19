/**
 * @file Integration Tests for CloudPulse Alerting — Notification Channel Edit Validation
 */
import { profileFactory } from '@linode/utilities';
import { mockGetAccount, mockGetUsers } from 'support/intercepts/account';
import {
  mockGetAlertChannelById,
  mockGetAlertChannels,
  mockUpdateAlertChannelById,
  mockUpdateAlertChannelByIdError,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';

import {
  accountFactory,
  accountUserFactory,
  flagsFactory,
  notificationChannelFactory,
} from 'src/factories';
import { UPDATE_CHANNEL_SUCCESS_MESSAGE } from 'src/features/CloudPulse/Alerts/constants';

// Define mock data for the test.

const mockAccount = accountFactory.build();
const mockUsers = [
  accountUserFactory.build({ username: 'user1' }),
  accountUserFactory.build({ username: 'user2' }),
  ...accountUserFactory.buildList(6),
];
const mockProfile = profileFactory.build({
  restricted: false,
});
const notificationChannels = notificationChannelFactory.buildList(5);
const editNotificationChannel = notificationChannelFactory.build({
  label: 'Test Channel Name',
  channel_type: 'email',
  details: {
    email: {
      usernames: ['user1', 'user2'],
    },
  },
});
const { id, label } = editNotificationChannel;

describe('CloudPulse Alerting - Notification Channel Edit Validation', () => {
  /**
   * Verifies successful editing of an existing email notification channel with a success snackbar.
   * Verifies the update payload sent to the API and the UI listing after the channel is edited.
   * Verifies server error handling during channel update failures.
   */
  beforeEach(() => {
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetAccount(mockAccount);
    mockGetProfile(mockProfile);
    mockGetAlertChannels([...notificationChannels, editNotificationChannel]).as(
      'getAlertNotificationChannels'
    );
    mockGetAlertChannelById(id, editNotificationChannel).as(
      'getAlertChannelById'
    );
    mockGetUsers(mockUsers).as('getAccountUsers');
    mockUpdateAlertChannelById(id, {
      ...editNotificationChannel,
      label: 'Updated Channel Name',
    }).as('updateAlertChannelById');

    //  Visit Notification Channels page
    cy.visitWithLogin('/alerts/notification-channels');
  });
  it('should verify edit action menu allows edit of the notification channel, verify payload and UI listing', () => {
    // Wait for initial data load
    cy.wait('@getAlertNotificationChannels');

    // Select the first notification channel to edit
    ui.actionMenu
      .findByTitle('Action menu for Notification Channel ' + label)
      .click();
    ui.actionMenuItem.findByTitle('Edit').click();

    cy.wait('@getAlertChannelById');

    cy.url().should('include', '/alerts/notification-channels/edit/' + id);

    // Modify the channel label
    const newChannelLabel = 'Updated Channel Name';

    cy.findByLabelText('Type').should('be.disabled').and('have.value', 'Email');
    cy.findByLabelText('Name').clear();
    cy.findByLabelText('Name').type(newChannelLabel);

    cy.findByLabelText('Recipients').click();

    // Remove one recipient
    cy.contains('.MuiChip-label', 'user1')
      .should('be.visible')
      .parents('.MuiChip-root')
      .find('.MuiChip-deleteIcon')
      .click();
    // Add a different recipient
    ui.autocompletePopper.findByTitle('user-3').click();

    // Click the Save button
    ui.buttonGroup
      .findButtonByTitle('Save')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Verify success toast
    ui.toast.assertMessage(UPDATE_CHANNEL_SUCCESS_MESSAGE);

    // Validate the request payload data
    cy.wait('@updateAlertChannelById').then((interception) => {
      expect(interception)
        .to.have.property('response')
        .with.property('statusCode', 200);

      const payload = interception.request.body;

      // Top-level fields
      expect(payload.label).to.equal(newChannelLabel);

      // Email details validation
      expect(payload.details).to.have.property('email');
      expect(payload.details.email.usernames).to.have.length(2);

      const expectedRecipients = ['user2', 'user-3'];

      expectedRecipients.forEach((username, index) => {
        expect(payload.details.email.usernames[index]).to.equal(username);
      });
    });

    // Verify navigation back to Notification Channels listing page
    cy.url().should('include', '/alerts/notification-channels');
    ui.tabList.find().within(() => {
      cy.get('[data-testid="Notification Channels"]').should(
        'have.text',
        'Notification Channels'
      );
    });

    cy.findByPlaceholderText('Search for Notification Channels').as(
      'searchInput'
    );
    cy.get('@searchInput').clear();
    cy.get('@searchInput').type(newChannelLabel);

    cy.get('[data-qa="notification-channels-table"]')
      .find('tbody:visible')
      .within(() => {
        cy.get('tr').should('have.length', 1);
        cy.get('tr')
          .first()
          .within(() => {
            cy.findByText(newChannelLabel).should('be.visible');
            cy.findByText('Email').should('be.visible');
          });
      });
  });
  it('should display server error when editing a notification channel fails', () => {
    // Simulate server error on update
    mockUpdateAlertChannelByIdError(id, 'Internal server error').as(
      'updateAlertChannelByIdError'
    );
    // Wait for initial data load
    cy.wait('@getAlertNotificationChannels');

    // Select the first notification channel to edit
    ui.actionMenu
      .findByTitle('Action menu for Notification Channel ' + label)
      .click();
    ui.actionMenuItem.findByTitle('Edit').click();

    cy.wait('@getAlertChannelById');

    // Modify the channel label
    const newChannelLabel = 'Updated Channel Name';
    cy.findByLabelText('Name').clear();
    cy.findByLabelText('Name').type(newChannelLabel);

    // Click the Save button
    ui.buttonGroup
      .findButtonByTitle('Save')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.toast.assertMessage('Internal server error');
    cy.url().should('include', '/alerts/notification-channels/edit/' + id);
  });
});
