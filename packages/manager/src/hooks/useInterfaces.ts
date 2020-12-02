import { LinodeInterface } from '@linode/api-v4/lib/linodes/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/linodes/interfaces/interfaces.reducer';
import { getAllLinodeInterfaces } from 'src/store/linodes/interfaces/interfaces.requests';
import { Dispatch } from './types';

export interface NodeBalancersProps {
  interfaces: State;
  requestInterfaces: () => Promise<LinodeInterface[]>;
}

export const useInterfaces = () => {
  const dispatch: Dispatch = useDispatch();
  const interfaces = useSelector(
    (state: ApplicationState) => state.__resources.interfaces
  );

  const requestInterfaces = (linodeId: number) =>
    dispatch(getAllLinodeInterfaces({ linodeId }));

  return { interfaces, requestInterfaces };
};

export default useInterfaces;
