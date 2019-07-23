import { getLinodeBackups } from 'src/services/linodes';
import { mostRecentFromResponse } from 'src/utilities/backups';

const requestMostRecentBackupForLinode: (
  linode: Linode.Linode
) => Promise<Linode.Linode> = (linode: Linode.Linode) =>
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
