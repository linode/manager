import { gdprComplianceNotification, notificationFactory } from 'src/factories';

import { adjustSeverity, isEUModelContractNotification } from './utils';

// Migration types are considered as types of maintenance notifications.
const migrationScheduled = notificationFactory.build({
  entity: { id: 0, label: 'linode-0', type: 'linode' },
  severity: 'major',
  type: 'migration_scheduled',
});

const migrationPending = notificationFactory.build({
  entity: { id: 1, label: 'linode-1', type: 'linode' },
  severity: 'major',
  type: 'migration_pending',
});

const maintenanceNotice = notificationFactory.build();
const maintenanceWithLowSeverity = notificationFactory.build({
  entity: { id: 4, label: 'linode-4', type: 'linode' },
  severity: 'minor',
  type: 'maintenance',
});

const emailBounce = notificationFactory.build({
  body: null,
  entity: null,
  label: 'We are unable to send emails to your billing email address!',
  message: 'We are unable to send emails to your billing email address!',
  severity: 'major',
  type: 'billing_email_bounce',
  until: null,
  when: null,
});

describe('Notification Severity', () => {
  describe('adjustSeverity helper', () => {
    it("should return 'major' severity for all maintenance types", () => {
      expect(adjustSeverity(maintenanceNotice)).toMatch('major');
      expect(adjustSeverity(maintenanceWithLowSeverity)).toMatch('major');
    });

    it('should return severity as returned by the API with no modification for non-maintenance types', () => {
      expect(adjustSeverity(emailBounce)).toMatch(emailBounce.severity);
      expect(adjustSeverity(migrationScheduled)).toMatch(
        migrationScheduled.severity
      );
      expect(adjustSeverity(migrationPending)).toMatch(
        migrationPending.severity
      );
    });
  });
});

describe('EU Model Contract Notification', () => {
  it('returns `true` only if the Notification is regarding the EU Model Contract', () => {
    const gdprNotification = gdprComplianceNotification.build();
    const otherNotification = notificationFactory.build();

    expect(isEUModelContractNotification(gdprNotification)).toBe(true);
    expect(isEUModelContractNotification(otherNotification)).toBe(false);
  });
});
