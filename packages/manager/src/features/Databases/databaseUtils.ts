import { DatabaseBackup } from '@linode/api-v4';

export const backupTypeMap: Record<DatabaseBackup['type'], string> = {
  auto: 'Automatic',
  snapshot: 'Manual',
};

export const generateManualBackupLabel = (): string => {
  const currDate = new Date();

  return `Manual${currDate.getFullYear()}${
    currDate.getMonth() + 1
  }${currDate.getDate()}H${currDate.getHours()}M${currDate.getMinutes()}S${currDate.getSeconds()}`;
};
