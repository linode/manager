import { LINODE_STATUS_TRANSITION_RESULT } from '~/api/linodes';

export class Event {
  static UNKNOWN = Symbol('unknown');
  static LINODE_REBOOT = Symbol('linodeReboot');
  static LINODE_BOOT = Symbol('linodeBoot');
  static LINODE_POWER_OFF = Symbol('linodePowerOff');
  static LINODE_DISK = Symbol('linodeDisk');
  static LINODE_BACKUP = Symbol('linodeBackup');

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
            default:
              return Event.UNKNOWN;
          }
        case 'disk':
          // TODO: refine this
          return Event.LINODE_DISK;
        case 'backups':
          // TODO: refine this
          return Event.LINODE_BACKUPS;
        default:
          return Event.UNKNOWN;
      }
    } // TODO: handle other cases

    return Event.UNKNOWN;
  }
}
