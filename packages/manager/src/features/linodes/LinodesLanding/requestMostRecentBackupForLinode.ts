import { getLinodeBackups, Linode } from 'linode-js-sdk/lib/linodes';
import { LinodeWithMaintenanceAndMostRecentBackup } from 'src/store/linodes/types';
import { mostRecentFromResponse } from 'src/utilities/backups';

const requestMostRecentBackupForLinode: (
  linode: Linode
) => Promise<LinodeWithMaintenanceAndMostRecentBackup> = (linode: Linode) =>
  linode.backups.enabled === false
    ? Promise.resolve({
        ...linode,
        mostRecentBackup: null
      })
    : getLinodeBackups(linode.id).then(backupsResponse => ({
        ...linode,
        mostRecentBackup: mostRecentFromResponse(backupsResponse)
      }));

export default requestMostRecentBackupForLinode;
