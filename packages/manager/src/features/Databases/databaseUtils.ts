export const formatBackupLabel = (backup: any): string => {
  if (backup.type === 'auto') {
    return 'Automatic Backup';
  } else if (backup.type === 'snapshot') {
    return backup.label;
  }
  // The backup type is unknown, so return an empty string.
  return '';
};
