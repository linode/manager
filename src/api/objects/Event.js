import { LINODE_STATUS_TRANSITION_RESULT } from '~/api/linodes';

export class Event {
  static UNKNOWN = Symbol('unknown');
  static LINODE_DELETE = Symbol('linodeDelete');
  static LINODE_CREATE = Symbol('linodeCreate');
  static LINODE_REBOOT = Symbol('linodeReboot');
  static LINODE_BOOT = Symbol('linodeBoot');
  static LINODE_POWER_OFF = Symbol('linodePowerOff');
  static LINODE_DISK_DELETE = Symbol('linodeDiskDelete');
  static LINODE_DISK_CREATE = Symbol('linodeDiskCreate');
  static LINODE_DISK_RESIZE = Symbol('linodeDiskResize');
  static LINODE_BACKUPS_ENABLE = Symbol('linodeBackupsEnable');
  static LINODE_BACKUPS_DISABLE = Symbol('linodeBackupsDisable');

  constructor(rawEvent) {
    this._event = rawEvent;
  }

  getLinodeId() {
    return this._event.linode_id;
  }

  _categoryAndAction() {
    return this._event.event_type.split('_').map(s => s.toLowerCase());
  }

  getUpdatedAt() {
    return new Date(this._event.updated);
  }

  getCreatedAt() {
    return new Date(this._event.created);
  }

  getStatus() {
    let status;
    switch (this.getType()) {
      case Event.LINODE_POWER_OFF:
        status = 'shutting_down';
        break;
      case Event.LINODE_REBOOT:
        status = 'rebooting';
        break;
      case Event.LINODE_BOOT:
        status = 'booting';
        break;
      case Event.LINODE_CREATE:
        status = 'creating';
        break;
      default:
        status = null;
    }

    if (status) {
      if (this.getProgress() === 100) {
        return LINODE_STATUS_TRANSITION_RESULT[status];
      }
    }

    return '';
  }

  getProgress() {
    return Math.max(this._event.percent_complete, 100);
  }

  getType() {
    const [category, action] = this._categoryAndAction();

    if (this._event.linode_id) {
      switch (category) {
        case 'linode':
          switch (action) {
            case 'shutdown':
              return Event.LINODE_POWER_OFF;
            case 'reboot':
              return Event.LINODE_REBOOT;
            case 'boot':
              return Event.LINODE_BOOT;
            case 'delete':
              return Event.LINODE_DELETE;
            case 'create':
              return Event.LINODE_CREATE;
            default:
              return Event.UNKNOWN;
          }

        case 'disk':
          switch (action) {
            case 'delete':
              return Event.LINODE_DISK_DELETE;
            case 'create':
              return Event.LINODE_DISK_CREATE;
            case 'resize':
              return Event.LINODE_DISK_RESIZE;
            default:
              return Event.UNKNOWN;
          }

        case 'backups':
          switch (action) {
            case 'enable':
              return Event.LINODE_BACKUPS_ENABLE;
            case 'cancel':
              return Event.LINODE_BACKUPS_DISABLE;
            default:
              return Event.UNKNOWN;
          }

        default:
          return Event.UNKNOWN;
      }
    } // TODO: handle other cases

    return Event.UNKNOWN;
  }
}
