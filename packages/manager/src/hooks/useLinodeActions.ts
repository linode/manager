import { Linode } from '@linode/api-v4/lib/linodes/types';
import { useDispatch } from 'react-redux';
import {
  deleteLinode as _deleteLinode,
  getLinode as _getLinode,
  requestLinodes as _requestLinodes,
  updateLinode as _updateLinode,
} from 'src/store/linodes/linode.requests';
import { UpdateLinodeParams } from 'src/store/linodes/linodes.actions';
import { Dispatch } from './types';

export interface LinodesProps {
  requestLinodes: () => Promise<Linode[]>;
  getLinode: (linodeId: number) => Promise<Linode>;
  deleteLinode: (linodeId: number) => Promise<{}>;
  updateLinode: (params: UpdateLinodeParams) => Promise<Linode>;
}

export const useLinodeActions = (): LinodesProps => {
  const dispatch: Dispatch = useDispatch();

  const requestLinodes = () =>
    dispatch(_requestLinodes({})).then((response) => response.data);

  const getLinode = (linodeId: number) => dispatch(_getLinode({ linodeId }));

  const deleteLinode = (linodeId: number) =>
    dispatch(_deleteLinode({ linodeId }));

  const updateLinode = (params: UpdateLinodeParams) =>
    dispatch(_updateLinode(params));

  return {
    requestLinodes,
    getLinode,
    deleteLinode,
    updateLinode,
  };
};

export default useLinodeActions;
