import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { shallowExtendLinodes } from 'src/store/linodes/linodes.helpers';
import { ShallowExtendedLinode } from 'src/store/linodes/types';
import { EntityError, MappedEntityState2 } from 'src/store/types';
import useEvents from './useEvents';
import useNotifications from './useNotifications';

export interface LinodesProps {
  linodes: MappedEntityState2<ShallowExtendedLinode, EntityError>;
}

export const useLinodes = (): LinodesProps => {
  const linodes = useSelector(
    (state: ApplicationState) => state.__resources.linodes
  );
  const notifications = useNotifications();
  const events = useEvents();

  const shallowExtendedLinodes = shallowExtendLinodes(
    Object.values(linodes.itemsById),
    notifications,
    events.events
  );

  return {
    linodes: {
      ...linodes,
      itemsById: shallowExtendedLinodes.reduce(
        (itemsById, item) => ({ ...itemsById, [item.id]: item }),
        {}
      )
    }
  };
};

export default useLinodes;
