export const renderBackupsDisplaySection = (
  accountBackups: boolean,
  price: number
) => ({
  details: `$${price.toFixed(2)}/month`,
  title: accountBackups ? 'Backups (Auto Enrolled)' : 'Backups',
});
