import { LinodeBackup, LinodeBackupsResponse } from 'linode-js-sdk/lib/linodes'

export const collectBackups = ({
  automatic,
  snapshot
}: LinodeBackupsResponse) =>
  [
    ...automatic,
    snapshot && snapshot.current,
    snapshot && snapshot.in_progress
  ].filter(Boolean);

export const mostRecentFromResponse: (
  r: LinodeBackupsResponse
) => null | string = response => {
  return (
    collectBackups(response)
      /** Filter unsuccessful/in-progress backups */
      .filter((backup: LinodeBackup) => backup.status === 'successful')

      /** Just make sure the backup isn't null somehow. */
      .filter(
        (backup: LinodeBackup) => typeof backup.finished === 'string'
      )

      /** Return the highest value date. */
      .reduce(
        (result: undefined | string, { finished }: LinodeBackup) => {
          if (result === undefined) {
            return finished;
          }

          if (new Date(finished) > new Date(result)) {
            return finished;
          }

          return result;
        },
        null
      ) || null
  );
};
