import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/linodes/linodes.reducer';

export interface LinodesProps {
  linodes: State;
}

export const useLinodes = (): LinodesProps => {
  const linodes = useSelector(
    (state: ApplicationState) => state.__resources.linodes
  );

  return {
    linodes
  };
};

export default useLinodes;
