export const formatBackupLabel = (backup: any): string => {
  if (backup.type === 'auto') {
    return 'Automatic';
  } else if (backup.type === 'snapshot') {
    return 'Manual';
  }
  // The backup type is unknown, so return an empty string.
  return '';
};

export const generateManualBackupLabel = (): string => {
  const currDate = new Date();
  return (
    'Manual' +
    currDate.getFullYear() +
    +(currDate.getMonth() + 1) +
    +currDate.getDate() +
    'H' +
    currDate.getHours() +
    'M' +
    +currDate.getMinutes() +
    'S' +
    +currDate.getSeconds()
  );
};
