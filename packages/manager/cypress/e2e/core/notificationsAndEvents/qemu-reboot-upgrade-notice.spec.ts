import {
  capitalize,
  linodeConfigInterfaceFactory,
  linodeFactory,
  profileFactory,
} from '@linode/utilities';
import { notificationFactory } from '@src/factories/notification';
import { mockGetAccount, mockGetMaintenance } from 'support/intercepts/account';
import { mockGetLinodeConfigs } from 'support/intercepts/configs';
import { mockGetNotifications } from 'support/intercepts/events';
import {
  mockGetLinodeDetails,
  mockGetLinodes,
  mockGetLinodeVolumes,
} from 'support/intercepts/linodes';
import { mockGetProfile } from 'support/intercepts/profile';
import { mockGetVLANs } from 'support/intercepts/vlans';
import { randomIp, randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import {
  accountFactory,
  accountMaintenanceFactory,
  linodeConfigFactory,
  VLANFactory,
  volumeFactory,
} from 'src/factories';
import { formatDate } from 'src/utilities/formatDate';

import type { Notification } from '@linode/api-v4';

describe('QEMU reboot upgrade notification', () => {
  const NOTIFICATION_BANNER_TEXT = 'critical platform maintenance';
  const noticeMessageShort =
    'One or more Linodes need to be rebooted for critical platform maintenance.';
  const noticeMessage = `${noticeMessageShort} See which Linodes are scheduled for reboot on the Account Maintenance page.`;
  const rebootReason =
    'This maintenance is scheduled to upgrade the QEMU version.';

  const notifications: Notification[] = [
    notificationFactory.build({
      severity: 'major',
      type: 'security_reboot_maintenance_scheduled',
      message: noticeMessageShort,
      label: 'QEMU Reboot Upgrade Notice',
    }),
  ];

  /**
   * This test verifies that the QEMU reboot upgrade notice is displayed in the Linode landing page.
   *
   * - Check that the notice is visible and contains the expected message.
   * - Check that user gets notified and the notification is present in the notifications dropdown.
   * - Check that a maintenance help button is displayed near the status of impacted Linodes.
   */
  it(`should display maintenance banner in 'Linode' landing page when one or more Linodes get impacted.`, () => {
    const mockAccount = accountFactory.build();
    const mockProfile = profileFactory.build({
      restricted: false,
      username: 'mock-user',
    });
    const mockLinodes = linodeFactory.buildList(5, {
      region: chooseRegion({
        capabilities: ['Linodes', 'Vlans'],
      }).id,
    });
    const upcomingMaintenance = [
      accountMaintenanceFactory.build({
        status: 'scheduled',
        type: 'reboot',
        reason: rebootReason,
        entity: {
          label: `${mockLinodes[0].label}`,
          id: mockLinodes[0].id,
          type: 'linode',
          url: `/v4/linode/instances/${mockLinodes[0].id}`,
        },
        start_time: new Date().toISOString(),
      }),
    ];

    // We use ! since in `LinodeMaintenanceText` the `start_time` is never null.
    const formattedTime = formatDate(upcomingMaintenance[0].start_time!, {
      timezone: mockProfile.timezone,
    });

    const maintenanceTooltipText = `This Linode’s maintenance window opens at ${formattedTime}. For more information, see your open support tickets.`;

    mockGetAccount(mockAccount).as('getAccount');
    mockGetLinodes(mockLinodes).as('getLinodes');
    mockGetNotifications(notifications).as('getNotifications');
    mockGetProfile(mockProfile).as('getProfile');

    mockGetMaintenance(upcomingMaintenance, []).as('getMaintenance');

    cy.visitWithLogin('/linodes');
    cy.wait(['@getAccount', '@getLinodes', '@getNotifications', '@getProfile']);

    // Confirm that a maintenance help button is present
    cy.get('[data-qa-help-tooltip="true"]')
      .should('be.visible')
      .trigger('mouseover');
    // Click the button first, then confirm the tooltip is shown.
    cy.get('[role="tooltip"]').then(($tooltip) => {
      expect($tooltip).to.have.length(1);
      expect($tooltip.text()).to.include(maintenanceTooltipText);
    });

    // Confirm that the notice is visible and contains the expected message
    cy.findByText(NOTIFICATION_BANNER_TEXT, { exact: false })
      .should('be.visible')
      .closest('[data-testid="platform-maintenance-banner"]')
      .within(() => {
        cy.get('p').then(($el) => {
          const noticeText = $el.text();
          expect(noticeText).to.include(noticeMessage);
        });
      });

    cy.get('button[aria-label="Notifications"]').click();
    cy.findByText(notifications[0].message).should('be.visible');
  });

  /**
   * This test verifies that the QEMU reboot upgrade notice is displayed in the Linode Details page.
   *
   * - Check that the notice is visible and contains the expected message.
   * - Check that user gets notified and the notification is present in the notifications dropdown.
   */
  it(`should display maintenance banner in 'Linode Details' page when the Linode instance gets impacted.`, () => {
    const mockLinodeRegion = chooseRegion({
      capabilities: ['Linodes', 'Vlans'],
    });
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockLinodeRegion.id,
      status: 'running',
    });
    const mockVolume = volumeFactory.build();
    const mockPublicConfigInterface = linodeConfigInterfaceFactory.build({
      ipam_address: null,
      purpose: 'public',
    });
    const mockConfig = linodeConfigFactory.build({
      id: randomNumber(),
      interfaces: [
        // The order of this array is significant. Index 0 (eth0) should be public.
        mockPublicConfigInterface,
      ],
    });
    const mockVlan = VLANFactory.build({
      cidr_block: `${randomIp()}/24`,
      id: randomNumber(),
      label: randomLabel(),
      linodes: [],
      region: mockLinodeRegion.id,
    });
    const rebootNoticeMessage = `${mockLinode.label} needs to be rebooted for critical platform maintenance.`;
    const notifications: Notification[] = [
      notificationFactory.build({
        severity: 'major',
        type: 'security_reboot_maintenance_scheduled',
        message: rebootNoticeMessage,
        label: 'QEMU Reboot Upgrade Notice',
        entity: {
          label: mockLinode.label,
          id: mockLinode.id,
          type: 'linode',
          url: `/v4/linode/instances/${mockLinode.id}`,
        },
      }),
    ];

    mockGetVLANs([mockVlan]);
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetLinodeVolumes(mockLinode.id, [mockVolume]).as('getLinodeVolumes');
    mockGetLinodeConfigs(mockLinode.id, [mockConfig]).as('getLinodeConfigs');
    mockGetNotifications(notifications).as('getNotifications');
    cy.visitWithLogin(`/linodes/${mockLinode.id}`);
    cy.wait(['@getLinode', '@getNotifications']);

    cy.findByText(NOTIFICATION_BANNER_TEXT, { exact: false })
      .should('be.visible')
      .closest('[data-testid="notice-warning"]')
      .within(() => {
        cy.get('p').then(($el) => {
          const noticeText = $el.text();
          expect(noticeText).to.include(rebootNoticeMessage);
        });
      });

    cy.get('button[aria-label="Notifications"]').click();
    cy.get('[data-testid="security_reboot_maintenance_scheduled"]').within(
      () => {
        cy.get('p').then(($el) => {
          const noticeText = $el.text();
          expect(noticeText).to.include(rebootNoticeMessage);
        });
      }
    );
  });

  /**
   * This test verifies that the QEMU reboot upgrade notice is displayed in the Account page.
   *
   * - Check that the notice is visible and contains the expected message.
   * - Check that user gets notified and the notification is present in the notifications dropdown.
   * - Check that the status of impacted Linodes will be changed to "Scheduled" under the upcoming table of Account Maintenance page.
   */
  it(`should display maintenance banner in 'Account Maintenance' page when one or more Linodes get impacted.`, () => {
    const linodeId = randomNumber(10000, 20000);
    const completedMaintenanceNumber = 2;
    const accountpendingMaintenance = [
      accountMaintenanceFactory.build({
        status: 'scheduled',
        type: 'reboot',
        reason: rebootReason,
        entity: {
          label: `linode-${linodeId}`,
          id: linodeId,
          type: 'linode',
          url: `/v4/linode/instances/${linodeId}`,
        },
        start_time: new Date().toISOString(),
      }),
    ];
    const accountcompletedMaintenance = accountMaintenanceFactory.buildList(
      completedMaintenanceNumber,
      { status: 'completed' }
    );

    mockGetMaintenance(
      accountpendingMaintenance,
      accountcompletedMaintenance
    ).as('getMaintenance');

    mockGetNotifications(notifications).as('getNotifications');
    cy.visitWithLogin('/account/maintenance');
    cy.wait(['@getMaintenance', '@getNotifications']);

    cy.contains('No pending maintenance').should('not.exist');
    cy.contains('No completed maintenance').should('not.exist');

    // Confirm In Progress table is not empty and contains exact number of pending maintenances
    cy.get('[aria-label="List of in progress maintenance"]')
      .should('be.visible')
      .find('tbody')
      .within(() => {
        const upcomingMaintenance = accountpendingMaintenance[0];
        // Confirm that the type of entity is displayed correctly
        cy.findByText(upcomingMaintenance.entity.type).should('be.visible');
        // Confirm that the label of entity is displayed correctly
        cy.findByText(upcomingMaintenance.entity.label).should('be.visible');
        // Confirm that the type of maintenance is displayed correctly
        cy.findByText(capitalize(upcomingMaintenance.type)).should(
          'be.visible'
        );
        // Confirm that the reason of maintenance is displayed correctly
        cy.findByText(upcomingMaintenance.reason, { exact: false }).should(
          'be.visible'
        );
      });

    // Confirm Upcoming table is not empty and contains exact number of pending maintenances
    cy.get('[aria-label="List of upcoming maintenance"]')
      .should('be.visible')
      .find('tbody')
      .within(() => {
        const upcomingMaintenance = accountpendingMaintenance[0];
        // Confirm that the type of entity is displayed correctly
        cy.findByText(upcomingMaintenance.entity.type).should('be.visible');
        // Confirm that the label of entity is displayed correctly
        cy.findByText(upcomingMaintenance.entity.label).should('be.visible');
        // Confirm that the type of maintenance is displayed correctly
        cy.findAllByText(capitalize(upcomingMaintenance.type)).should(
          'be.visible'
        );
        // Confirm that the status of maintenance is displayed correctly
        cy.get('[aria-label="Status is active"]')
          .parent()
          .contains(capitalize(upcomingMaintenance.status))
          .should('be.visible');
        // Confirm that the reason of maintenance is displayed correctly
        cy.findByText(upcomingMaintenance.reason, { exact: false }).should(
          'be.visible'
        );
      });

    // Confirm Completed table is not empty and contains exact number of completed maintenances
    cy.get('[aria-label="List of completed maintenance"]')
      .should('be.visible')
      .find('tbody')
      .within(() => {
        accountcompletedMaintenance.forEach(() => {
          cy.get('tr')
            .should('have.length', accountcompletedMaintenance.length)
            .each((row, index) => {
              const completedMaintenance = accountcompletedMaintenance[index];
              cy.wrap(row).within(() => {
                cy.contains(completedMaintenance.entity.label).should(
                  'be.visible'
                );
                // Confirm that the first 90 characters of each reason string are rendered on screen
                const truncatedReason = completedMaintenance.reason.substring(
                  0,
                  90
                );
                cy.findByText(truncatedReason, { exact: false }).should(
                  'be.visible'
                );
                // Check the content of each <td> element
                cy.get('td').each(($cell, idx, $cells) => {
                  cy.wrap($cell).should('not.be.empty');
                });
              });
            });
        });
      });

    // Confirm that the notice is visible and contains the expected message
    cy.findByText(NOTIFICATION_BANNER_TEXT, { exact: false })
      .should('be.visible')
      .closest('[data-testid="platform-maintenance-banner"]')
      .within(() => {
        cy.get('p').then(($el) => {
          const noticeText = $el.text();
          expect(noticeText).to.include(noticeMessageShort);
        });
      });
    cy.findByText(' upcoming', { exact: false })
      .closest('[data-testid="maintenance-banner"]')
      .should('be.visible')
      .within(() => {
        cy.get('p').then(($el) => {
          const noticeText = $el.text();
          expect(noticeText).to.include(
            `${accountpendingMaintenance.length} Linode has upcoming scheduled maintenance.`
          );
        });
      });

    cy.get('button[aria-label="Notifications"]').click();
    cy.findByText(notifications[0].message).should('be.visible');
  });
});
