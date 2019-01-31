export const renderBackupsDisplaySection = (
  accountBackups: boolean,
  price: number
) => ({
  title: accountBackups ? 'Backups Enabled (Auto Enrolled)' : 'Backups Enabled',
  details: `$${price.toFixed(2)} / monthly`
});
