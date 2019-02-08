import { useEffect, useState } from 'react';
import { getLinodeConfigs } from 'src/services/linodes';

export const userLinodeConfigsRequest = (
  linodeId: number,
  loading: boolean = false
) => {
  interface State {
    data: Linode.Config[];
    loading: boolean;
    lastRequested: number;
    error?: Linode.ApiFieldError[];
  }

  const [state, setState] = useState<State>({
    data: [],
    loading,
    lastRequested: 0
  });

  useEffect(() => {
    console.log(`useEffect:configs`);
    setState({ ...state, loading: true, lastRequested: Date.now() });

    getLinodeConfigs(linodeId)
      .then(({ data }) => setState({ ...state, loading: false, data }))
      .catch(error => setState({ ...state, loading: false, error }));
  }, [linodeId]);

  return state;
};
