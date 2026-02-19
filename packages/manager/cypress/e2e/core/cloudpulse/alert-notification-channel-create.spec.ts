/**
 * @file Integration Tests for CloudPulse Alerting — Notification Channel Creation Validation
 */
import { profileFactory } from '@linode/utilities';
import { mockGetAccount, mockGetUsers } from 'support/intercepts/account';
import {
  mockCreateAlertChannelError,
  mockCreateAlertChannelSuccess,
  mockGetAlertChannels,
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
import { CREATE_CHANNEL_SUCCESS_MESSAGE } from 'src/features/CloudPulse/Alerts/constants';

// Define mock data for the test.

const mockAccount = accountFactory.build();
const mockProfile = profileFactory.build({
  restricted: false,
});
const notificationChannels = notificationChannelFactory.buildList(5);
const createNotificationChannel = notificationChannelFactory.build({
  label: 'Test Channel Name',
  channel_type: 'email',
  content: {
    email: {
      email_addresses: ['user1', 'user2'],
      message: 'You have a new Alert',
      subject: 'Sample Alert',
    },
  },
});

describe('CloudPulse Alerting - Notification Channel Creation Validation', () => {
  /**
   * Verify successful creation of a new email notification channel with success snackbar
   * Verifies the payload sent to the API and the UI listing of the newly created channel.
   * Verifies server error handling during channel creation.
   */
  beforeEach(() => {
    mockGetAccount(mockAccount);
    mockGetProfile(mockProfile);
    const mockflags = flagsFactory.build({
      aclpAlerting: {
        notificationChannels: true,
      },
    });
    mockAppendFeatureFlags(mockflags);
    mockGetAlertChannels(notificationChannels).as(
      'getAlertNotificationChannels'
    );
    mockCreateAlertChannelSuccess(createNotificationChannel).as(
      'createAlertChannelNew'
    );

    // Mock 2 users for recipient selection
    const users = [
      accountUserFactory.build({ username: 'user1' }),
      accountUserFactory.build({ username: 'user2' }),
    ];

    mockGetUsers(users).as('getAccountUsers');

    //  Visit Notification Channels page
    cy.visitWithLogin('/alerts/notification-channels');
  });
  it('should create email notification channel, verify payload and UI listing', () => {
    // Open Create Channel page
    ui.button
      .findByTitle('Create Channel')
      .should('be.visible')
      .and('be.enabled')
      .click();

    // Verify breadcrumb heading
    ui.breadcrumb.find().within(() => {
      cy.contains('Notification Channels').should('be.visible');
      cy.contains('Create Channel').should('be.visible');
    });

    // Verify Channel Settings heading
    ui.heading.findByText('Channel Settings').should('be.visible');

    // Select notification type (Email)
    cy.get('[data-qa-textfield-label="Type"]').should('be.visible');
    ui.autocomplete
      .findByLabel('channel-type-select')
      .should('be.visible')
      .click();
    ui.autocompletePopper.findByTitle('Email').click();

    // Enter channel name
    cy.get('[data-qa-textfield-label="Name"]').should('be.visible');
    cy.findByPlaceholderText('Enter a name for the channel')
      .should('be.visible')
      .type('Test Channel Name');

    cy.get('[data-qa-textfield-helper-text="true"]')
      .should('be.visible')
      .and('have.text', 'Select up to 10 Recipients');

    // Open recipients autocomplete and select users
    cy.get('[data-qa-textfield-label="Recipients"]').should('be.visible');
    ui.autocomplete
      .findByLabel('recipients-select')
      .should('be.visible')
      .click();
    ui.autocompletePopper.findByTitle('user1').click();
    ui.autocompletePopper.findByTitle('user2').click();

    // Verify selected chips
    cy.get('[data-tag-index]')
      .should('have.length', 2)
      .each(($chip, index) => {
        const expectedUsers = ['user1', 'user2'];
        cy.wrap($chip)
          .find('.MuiChip-label')
          .should('contain.text', expectedUsers[index]);
      });

    // Verify Cancel button is enabled
    ui.buttonGroup
      .findButtonByTitle('Cancel')
      .should('be.visible')
      .and('be.enabled');

    // Verify Submit button is enabled and click
    ui.buttonGroup
      .findButtonByTitle('Submit')
      .should('be.visible')
      .and('be.enabled')
      .click();

    // Validate API request payload for notification channel creation
    cy.wait('@createAlertChannelNew').then((interception) => {
      expect(interception)
        .to.have.property('response')
        .with.property('statusCode', 200);

      const payload = interception.request.body;

      // Top-level fields
      expect(payload.label).to.equal('Test Channel Name');
      expect(payload.channel_type).to.equal('email');

      // Email details validation
      expect(payload.details).to.have.property('email');
      expect(payload.details.email.usernames).to.have.length(2);

      const expectedRecipients = ['user1', 'user2'];

      expectedRecipients.forEach((username, index) => {
        expect(payload.details.email.usernames[index]).to.equal(username);
      });
    });

    // Verify success toast
    ui.toast.assertMessage(CREATE_CHANNEL_SUCCESS_MESSAGE);

    cy.wait('@getAlertNotificationChannels');

    // Verify navigation back to Notification Channels listing page
    cy.url().should('include', '/alerts/notification-channels');
    ui.tabList.find().within(() => {
      cy.get('[data-testid="Notification Channels"]').should(
        'have.text',
        'Notification Channels'
      );
    });
    // Verify the newly created channel appears in the listing
    const expected = createNotificationChannel;

    cy.findByPlaceholderText('Search for Notification Channels').as(
      'searchInput'
    );
    cy.get('@searchInput').clear();
    cy.get('@searchInput').type(expected.label);

    cy.get('[data-qa="notification-channels-table"]')
      .find('tbody:visible')
      .within(() => {
        cy.get('tr').should('have.length', 1);
        cy.get('tr')
          .first()
          .within(() => {
            cy.findByText(expected.label).should('be.visible');
            cy.findByText('Email').should('be.visible');
          });
      });
  });
  it('should display server related message when API returns an error during channel creation', () => {
    mockCreateAlertChannelError('Internal Server Error', 500).as(
      'createAlertChannelServerError'
    );

    cy.visitWithLogin('/alerts/notification-channels');

    // Open Create Channel drawer
    ui.button
      .findByTitle('Create Channel')
      .should('be.visible')
      .and('be.enabled')
      .click();

    // Select notification type
    ui.autocomplete.findByLabel('channel-type-select').click();
    ui.autocompletePopper.findByTitle('Email').click();

    // Enter channel name
    cy.findByPlaceholderText('Enter a name for the channel').type(
      'Error Channel'
    );

    // Select recipients
    ui.autocomplete.findByLabel('recipients-select').click();
    ui.autocompletePopper.findByTitle('user1').click();

    // Submit form
    ui.buttonGroup.findButtonByTitle('Submit').click();

    // Wait for the intercepted API call
    cy.wait('@createAlertChannelServerError')
      .its('response.statusCode')
      .should('eq', 500);

    // Verify toast message
    ui.toast.assertMessage('Internal Server Error');
  });
});
