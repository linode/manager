import { ApplicationState } from 'src/store';

export const getLinodesWithBackups = (
  state: ApplicationState['__resources']
) => {
  const linodes = Object.values(state.linodes.itemsById);
  return linodes.filter(thisLinode => thisLinode.backups.enabled);
};

export const getLinodesWithoutBackups = (
  state: ApplicationState['__resources']
) => {
  const linodes = Object.values(state.linodes.itemsById);
  return linodes.filter(thisLinode => !thisLinode.backups.enabled);
};
