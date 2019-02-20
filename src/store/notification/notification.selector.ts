import { State } from './notification.reducer';

export const getNotificationsForLinode = (
  { data = [] }: State,
  linodeId: number
) =>
  data.filter(
    ({ entity }) => entity && entity.type === 'linode' && entity.id === linodeId
  );
