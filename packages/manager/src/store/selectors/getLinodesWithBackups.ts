import { ApplicationState } from 'src/store';
import { LinodeWithMaintenanceAndDisplayStatus as Linode } from 'src/store/linodes/types';

export const getLinodesWithBackups = (
  state: ApplicationState['__resources']
) => {
  const linodes = Object.values(state.linodes.itemsById);
  return linodes.filter((thisLinode: Linode) => thisLinode.backups.enabled);
};

export const getLinodesWithoutBackups = (
  state: ApplicationState['__resources']
) => {
  const linodes = Object.values(state.linodes.itemsById);
  return linodes.filter((thisLinode: Linode) => !thisLinode.backups.enabled);
};
