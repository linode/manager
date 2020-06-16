import { Linode } from '@linode/api-v4/lib/linodes/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import {
  deleteLinode as _deleteLinode,
  getLinode as _getLinode,
  requestLinodes as _requestLinodes
} from 'src/store/linodes/linode.requests';
import { State } from 'src/store/linodes/linodes.reducer';
import { Dispatch } from './types';

export interface LinodesProps {
  linodes: State;
  requestLinodes: () => Promise<Linode[]>;
  requestLinode: (linodeId: number) => Promise<Linode>;
  deleteLinode: (linodeId: number) => Promise<{}>;
}

export const useLinodes = (): LinodesProps => {
  const dispatch: Dispatch = useDispatch();

  const linodes = useSelector(
    (state: ApplicationState) => state.__resources.linodes
  );

  const requestLinodes = () =>
    dispatch(_requestLinodes({})).then(response => response.data);

  const getLinode = (linodeId: number) => dispatch(_getLinode({ linodeId }));

  const deleteLinode = (linodeId: number) =>
    dispatch(_deleteLinode({ linodeId }));

  return { linodes, requestLinodes, getLinode, deleteLinode };
};

export default useLinodes;
