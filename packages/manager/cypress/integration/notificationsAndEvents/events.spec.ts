import { Event, EventAction } from '@linode/api-v4/lib/account';
import { eventFactory } from '@src/factories/events';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import { RecPartial } from 'factory.ts';
import { containsClick, getClick } from '../../support/helpers';

const eventActions: RecPartial<EventAction>[] = [
  'backups_enable',
  'backups_cancel',
  'backups_restore',
  'community_question_reply',
  'community_like',
  'disk_create',
  'disk_delete',
  'disk_update',
  'disk_duplicate',
  'disk_imagize',
  'disk_resize',
  'entity_transfer_accept',
  'entity_transfer_cancel',
  'entity_transfer_create',
  'entity_transfer_fail',
  'entity_transfer_stale',
  'firewall_create',
  'firewall_delete',
  'firewall_disable',
  'firewall_enable',
  'firewall_update',
  'firewall_device_add',
  'firewall_device_remove',
  'host_reboot',
  'image_delete',
  'image_update',
  'image_upload',
  'lassie_reboot',
  'linode_addip',
  'linode_boot',
  'linode_clone',
  'linode_create',
  'linode_delete',
  'linode_update',
  'linode_deleteip',
  'linode_migrate',
  'linode_migrate_datacenter',
  'linode_mutate',
  'linode_reboot',
  'linode_rebuild',
  'linode_resize',
  'linode_shutdown',
  'linode_snapshot',
  'linode_config_create',
  'linode_config_delete',
  'linode_config_update',
  'lke_node_create',
  'longviewclient_create',
  'longviewclient_delete',
  'longviewclient_update',
  'nodebalancer_create',
  'nodebalancer_delete',
  'nodebalancer_update',
  'nodebalancer_config_create',
  'nodebalancer_config_delete',
  'nodebalancer_config_update',
  'stackscript_create',
  'stackscript_delete',
  'stackscript_update',
  'stackscript_publicize',
  'stackscript_revise',
  'tfa_disabled',
  'tfa_enabled',
  'ticket_attachment_upload',
  'user_ssh_key_add',
  'user_ssh_key_delete',
  'user_ssh_key_update',
  'volume_clone',
  'volume_create',
  'volume_update',
  'volume_detach',
  'volume_resize',
  'linode_create',
  'account_update',
  'account_settings_update',
  'credit_card_updated',
  // 'linode_migrate_datacenter_create',
  // 'linode_mutate_create',
  // 'linode_resize_create',
  // 'profile_update',
  // 'volume_delete',
  // unwanted 'account_update',
  // unwanted 'account_settings_update',
  // unwanted 'credit_card_updated',
  // unwanted 'profile_update',
  // unwanted 'ticket_attachment_upload',
  // unwanted 'volume_update',
];

const events: Event[] = [];

eventActions.forEach((action) => {
  const buildEvent = eventFactory.build({
    action,
    message: `${action + ' message'}`,
    seen: false,
    read: false,
    percent_complete: null,
    entity: { id: 0, label: 'linode-0' },
  });
  events.push(buildEvent);
});

describe('verify notification types and icons', () => {
  it(`notifications`, () => {
    cy.intercept('*/account/events*', (req) => {
      req.reply(makeResourcePage(events));
    }).as('mockEvents');
    cy.visitWithLogin('/linodes');
    cy.wait('@mockEvents').then(() => {
      getClick('button[aria-label="Notifications"]');
      for (let i = 0; i < 20; i++) {
        cy.get(`[data-test-id="${events[i].action}"]`).within(() => {
          cy.contains(`${events[i].message}`);
        });
      }
      containsClick('View all events');
      events.forEach((event) => {
        cy.get(`[data-test-id="${event.action}"]`).within(() => {
          cy.contains(`${event.message}`);
        });
      });
    });
  });
});
