import { notificationChannelAlertsFactory } from 'src/factories/cloudpulse/channels';
import { serviceTypesFactory } from 'src/factories/cloudpulse/services';

import { DELETE_CHANNEL_TOOLTIP_TEXT } from '../../constants';
import {
  getAssociatedAlerts,
  getNotificationChannelActionsList,
  getServicesList,
} from './utils';

describe('NotificationChannels utils', () => {
  describe('getNotificationChannelActionsList', () => {
    it('should return proper actions for system channel type', () => {
      const handlers = {
        handleDelete: vi.fn(),
        handleDetails: vi.fn(),
        handleEdit: vi.fn(),
      };

      const actions = getNotificationChannelActionsList({
        alertsCount: 0,
        handlers,
      });

      expect(actions.system).toHaveLength(1);
      expect(actions.system[0].title).toBe('Show Details');
      expect(actions.system[0].onClick).toBe(handlers.handleDetails);
    });

    it('should disable delete action and show tooltip when alertsCount > 0', () => {
      const handlers = {
        handleDelete: vi.fn(),
        handleDetails: vi.fn(),
        handleEdit: vi.fn(),
      };

      const actions = getNotificationChannelActionsList({
        alertsCount: 2,
        handlers,
      });

      const deleteAction = actions.user.find((action) =>
        action.title.includes('Delete')
      );

      expect(deleteAction?.disabled).toBe(true);
      expect(deleteAction?.tooltip).toBe(DELETE_CHANNEL_TOOLTIP_TEXT);
    });

    it('should enable delete action when no alerts are associated', () => {
      const handlers = {
        handleDelete: vi.fn(),
        handleDetails: vi.fn(),
        handleEdit: vi.fn(),
      };

      const actions = getNotificationChannelActionsList({
        alertsCount: 0,
        handlers,
      });

      const deleteAction = actions.user.find((action) =>
        action.title.includes('Delete')
      );

      expect(deleteAction?.disabled).toBe(false);
      expect(deleteAction?.tooltip).toBeUndefined();
    });
  });

  describe('getServicesList', () => {
    it('should return an empty array when serviceTypeList is undefined', () => {
      expect(getServicesList(undefined, undefined)).toEqual([]);
    });

    it('should return an empty array when serviceTypeList has no data', () => {
      expect(getServicesList({ data: [] }, {})).toEqual([]);
    });

    it('should return only services with alerts enabled in flags', () => {
      const services = [
        serviceTypesFactory.build({
          label: 'Linode',
          service_type: 'linode',
        }),
        serviceTypesFactory.build({
          label: 'Managed Databases',
          service_type: 'dbaas',
        }),
        serviceTypesFactory.build({
          label: 'Object Storage',
          service_type: 'objectstorage',
        }),
      ];

      const aclpServices = {
        dbaas: { alerts: { enabled: false, beta: false } },
        linode: { alerts: { enabled: true, beta: false } },
      };

      expect(getServicesList({ data: services }, aclpServices)).toEqual([
        { label: 'Linode', value: 'linode' },
      ]);
    });
  });

  describe('getAssociatedAlerts', () => {
    it('should return an empty array when alerts are undefined', () => {
      expect(getAssociatedAlerts(undefined, [], '')).toEqual([]);
    });

    it('should filter alerts by service types', () => {
      const alerts = [
        notificationChannelAlertsFactory.build({
          label: 'DB Alert',
          service_type: 'dbaas',
        }),
        notificationChannelAlertsFactory.build({
          label: 'Linode Alert',
          service_type: 'linode',
        }),
      ];

      const filtered = getAssociatedAlerts(
        alerts,
        [{ label: 'Databases', value: 'dbaas' }],
        ''
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].label).toBe('DB Alert');
    });

    it('should filter alerts by search text', () => {
      const alerts = [
        notificationChannelAlertsFactory.build({
          label: 'CPU Alert',
          service_type: 'linode',
        }),
        notificationChannelAlertsFactory.build({
          label: 'Memory Alert',
          service_type: 'linode',
        }),
      ];

      const filtered = getAssociatedAlerts(alerts, [], 'cpu');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].label).toBe('CPU Alert');
    });

    it('should filter alerts by both service type and search text', () => {
      const alerts = [
        notificationChannelAlertsFactory.build({
          label: 'DB CPU Alert',
          service_type: 'dbaas',
        }),
        notificationChannelAlertsFactory.build({
          label: 'DB Memory Alert',
          service_type: 'dbaas',
        }),
        notificationChannelAlertsFactory.build({
          label: 'Linode CPU Alert',
          service_type: 'linode',
        }),
      ];

      const filtered = getAssociatedAlerts(
        alerts,
        [{ label: 'Databases', value: 'dbaas' }],
        'cpu'
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].label).toBe('DB CPU Alert');
    });
  });
});
