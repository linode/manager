export const collectBackups = ({
  automatic,
  snapshot
}: Linode.LinodeBackupsResponse) =>
  [...automatic, snapshot.current, snapshot.in_progress].filter(Boolean);

export const mostRecentFromResponse: (
  r: Linode.LinodeBackupsResponse
) => null | string = response => {
  return (
    collectBackups(response)
      /** Filter unsuccessful/in-progress backups */
      .filter((backup: Linode.LinodeBackup) => backup.status === 'successful')

      /** Just make sure the backup isnt null somehow. */
      .filter(
        (backup: Linode.LinodeBackup) => typeof backup.finished === 'string'
      )

      /** Return the highest value date. */
      .reduce(
        (result: undefined | string, { finished }: Linode.LinodeBackup) => {
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
