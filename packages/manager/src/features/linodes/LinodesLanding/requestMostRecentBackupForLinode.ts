import { getLinodeBackups, Linode } from 'linode-js-sdk/lib/linodes';
import { mostRecentFromResponse } from 'src/utilities/backups';

const requestMostRecentBackupForLinode: (linode: Linode) => Promise<Linode> = (
  linode: Linode
) =>
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
