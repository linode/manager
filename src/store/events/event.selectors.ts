import { State } from './event.reducer';

export const eventsForLinode = (state: State, linodeId: number) => {
  return state.events.filter(
    ({ entity }) => entity && entity.type === 'linode' && entity.id === linodeId
  );
};
