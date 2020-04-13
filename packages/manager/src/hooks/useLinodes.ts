import { Linode } from 'linode-js-sdk/lib/linodes/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import {
  deleteLinode as _deleteLinode,
  requestLinodes as _requestLinodes
} from 'src/store/linodes/linode.requests';
import { State } from 'src/store/linodes/linodes.reducer';
import { Dispatch } from './types';

export interface LinodesProps {
  linodes: State;
  requestLinodes: () => Promise<Linode[]>;
  deleteLinode: (linodeId: number) => Promise<{}>;
}

export const useLinodes = (): LinodesProps => {
  const dispatch: Dispatch = useDispatch();

  const linodes = useSelector(
    (state: ApplicationState) => state.__resources.linodes
  );

  const requestLinodes = () =>
    dispatch(_requestLinodes({})).then(response => response.data);

  const deleteLinode = (linodeId: number) =>
    dispatch(_deleteLinode({ linodeId }));

  return { linodes, requestLinodes, deleteLinode };
};

export default useLinodes;
