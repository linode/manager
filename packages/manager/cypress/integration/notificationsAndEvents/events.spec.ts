import { Event, EventAction } from '@linode/api-v4/lib/account';
import { eventFactory } from '@src/factories/events';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import { RecPartial } from 'factory.ts';
import { getClick } from '../../support/helpers';

const eventActions: RecPartial<EventAction>[] = [
  'account_update',
  'account_settings_update',
  'backups_enable',
  'backups_cancel',
  'backups_restore',
  'community_question_reply',
  'community_like',
  'credit_card_updated',
  'disk_create',
  'disk_delete',
  'disk_update',
  'disk_duplicate',
  'disk_imagize',
  'disk_resize',
  'dns_record_create',
  'dns_record_delete',
  'dns_record_update',
  'dns_zone_create',
  'dns_zone_delete',
  'dns_zone_import',
  'dns_zone_update',
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
  'ipaddress_update',
  'lassie_reboot',
  'lish_boot',
  'linode_addip',
  'linode_boot',
  'linode_clone',
  'linode_create',
  'linode_delete',
  'linode_update',
  'linode_deleteip',
  'linode_migrate',
  'linode_migrate_datacenter',
  'linode_migrate_datacenter_create',
  'linode_mutate',
  'linode_mutate_create',
  'linode_reboot',
  'linode_rebuild',
  'linode_resize',
  'linode_resize_create',
  'linode_shutdown',
  'linode_snapshot',
  'linode_config_create',
  'linode_config_delete',
  'linode_config_update',
  'lke_node_create',
  'longviewclient_create',
  'longviewclient_delete',
  'longviewclient_update',
  'managed_disabled',
  'managed_enabled',
  'managed_service_create',
  'managed_service_delete',
  'nodebalancer_create',
  'nodebalancer_delete',
  'nodebalancer_update',
  'nodebalancer_config_create',
  'nodebalancer_config_delete',
  'nodebalancer_config_update',
  'nodebalancer_node_create',
  'nodebalancer_node_delete',
  'nodebalancer_node_update',
  'oauth_client_create',
  'oauth_client_delete',
  'oauth_client_secret_reset',
  'oauth_client_update',
  'password_reset',
  'payment_submitted',
  'profile_update',
  'stackscript_create',
  'stackscript_delete',
  'stackscript_update',
  'stackscript_publicize',
  'stackscript_revise',
  'tag_create',
  'tag_delete',
  'tfa_disabled',
  'tfa_enabled',
  'ticket_attachment_upload',
  'ticket_create',
  'ticket_update',
  'token_create',
  'token_delete',
  'token_update',
  'user_create',
  'user_update',
  'user_delete',
  'user_ssh_key_add',
  'user_ssh_key_delete',
  'user_ssh_key_update',
  'vlan_attach',
  'vlan_detach',
  'volume_attach,',
  'volume_clone',
  'volume_create',
  'volume_delete',
  'volume_update',
  'volume_detach',
  'volume_resize',
];

const events: Event[] = [];

eventActions.forEach((action) => {
  events.push(eventFactory.build({ action }));
});

describe('verify notification types and icons', () => {
  it(`notifications`, () => {
    cy.intercept('GET', '*/account/notifications*', (req) => {
      req.reply((res) => {
        res.send(makeResourcePage(events));
      });
    }).as('mockNotification');
    cy.visitWithLogin('/linodes');
    cy.waitFor('@mockNotifications');
    getClick('button[aria-label="Notifications"]');
    getClick('[data-test-id="showMoreButton"');
    events.forEach((event) => {
      cy.get(`[data-test-id="${event.action}"]`).within(() => {
        cy.get(`[data-test-id="${event.action + 'Icon'}"]`);
      });
    });
  });
});
