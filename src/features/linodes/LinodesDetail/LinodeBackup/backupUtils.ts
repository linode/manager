import { updateLinode } from 'src/services/linodes';


/**
 * updateBackupsWindow
 * 
 * Update the schedule for automatic backups on a Linode.
 * 
 * @param linodeId { number } The id of the Linode to be updated.
 * @param day { string } The day of the week backups will be taken.
 * @param window { enum } The window in which your backups will be taken, in UTC.
 * A backups window is a two-hour span of time in which the backup may occur.
 */
export const updateBackupsWindow = (linodeId: number, day: Linode.Day, window: Linode.Window) =>
    updateLinode(linodeId, { backups: { schedule: { day, window } } });