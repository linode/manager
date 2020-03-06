import { Linode } from 'linode-js-sdk/lib/linodes/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { requestLinodes as _requestLinodes } from 'src/store/linodes/linode.requests';
import { State } from 'src/store/linodes/linodes.reducer';

export interface LinodesProps {
  linodes: State;
  requestLinodes: () => Promise<Linode[]>;
}

export const useLinodes = () => {
  const dispatch = useDispatch();
  const linodes = useSelector(
    (state: ApplicationState) => state.__resources.linodes
  );
  const requestLinodes = dispatch(_requestLinodes({}));

  return { linodes, requestLinodes };
};

export default useLinodes;
