import { Linode } from '@linode/api-v4/lib/linodes/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import {
  deleteLinode as _deleteLinode,
  getLinode as _getLinode,
  requestLinodes as _requestLinodes,
  updateLinode as _updateLinode
} from 'src/store/linodes/linode.requests';
import { UpdateLinodeParams } from 'src/store/linodes/linodes.actions';
import { shallowExtendLinodes } from 'src/store/linodes/linodes.helpers';
import { ShallowExtendedLinode } from 'src/store/linodes/types';
import {
  EntityError,
  MappedEntityState2,
  ThunkDispatch
} from 'src/store/types';
import { Dispatch } from './types';
import useEvents from './useEvents';
import useNotifications from './useNotifications';

export interface LinodesProps {
  linodes: MappedEntityState2<ShallowExtendedLinode, EntityError>;
  requestLinodes: () => Promise<Linode[]>;
  getLinode: (linodeId: number) => Promise<Linode>;
  deleteLinode: (linodeId: number) => Promise<{}>;
  updateLinode: (params: UpdateLinodeParams) => Promise<Linode>;
}

export const useLinodes = (): LinodesProps => {
  const dispatch: Dispatch = useDispatch<ThunkDispatch>();

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

  const requestLinodes = () =>
    dispatch(_requestLinodes({})).then(response => response.data);

  const getLinode = (linodeId: number) => dispatch(_getLinode({ linodeId }));

  const deleteLinode = (linodeId: number) =>
    dispatch(_deleteLinode({ linodeId }));

  const updateLinode = (params: UpdateLinodeParams) =>
    dispatch(_updateLinode(params));

  return {
    linodes: {
      ...linodes,
      itemsById: shallowExtendedLinodes.reduce(
        (itemsById, item) => ({ ...itemsById, [item.id]: item }),
        {}
      )
    },
    requestLinodes,
    getLinode,
    deleteLinode,
    updateLinode
  };
};

export default useLinodes;
