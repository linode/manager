import { adjustSeverity } from './useFormattedNotifications';
import { notificationFactory } from 'src/factories';

// Migration types are considered as types of maintenance notifications.
const migrationScheduled = notificationFactory.build({
  type: 'migration_scheduled',
  entity: { id: 0, type: 'linode', label: 'linode-0' },
  severity: 'major',
});

const migrationPending = notificationFactory.build({
  type: 'migration_pending',
  entity: { id: 1, type: 'linode', label: 'linode-1' },
  severity: 'major',
});

const maintenanceNotice = notificationFactory.build();
const maintenanceWithLowSeverity = notificationFactory.build({
  type: 'maintenance',
  entity: { id: 4, type: 'linode', label: 'linode-4' },
  severity: 'minor',
});

const emailBounce = notificationFactory.build({
  type: 'billing_email_bounce',
  entity: null,
  when: null,
  message: 'We are unable to send emails to your billing email address!',
  label: 'We are unable to send emails to your billing email address!',
  severity: 'major',
  until: null,
  body: null,
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
