export const renderBackupsDisplaySection = (
  accountBackups: boolean,
  price: number
) => ({
  title: accountBackups ? 'Backups (Auto Enrolled)' : 'Backups',
  details: `$${price.toFixed(2)}/month`,
});
