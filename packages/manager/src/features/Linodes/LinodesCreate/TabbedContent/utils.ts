export const renderBackupsDisplaySection = (
  accountBackups: boolean,
  price: 'unknown' | number
) => ({
  details: `$${price !== 'unknown' ? price.toFixed(2) : 'unknown'}/month`,
  title: accountBackups ? 'Backups (Auto Enrolled)' : 'Backups',
});
