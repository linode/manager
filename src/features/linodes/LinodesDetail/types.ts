export interface ExtendedLinode extends Linode.Linode {
  _configs: Linode.Config[];
  _disks: Linode.Disk[];
  _events: Linode.Event[];
  _notifications: Linode.Notification[];
  _volumes: Linode.Volume[];
  _volumesError: Linode.ApiFieldError[];
  _type?: null | Linode.LinodeType;
  _permissions: Linode.GrantLevel;
}
