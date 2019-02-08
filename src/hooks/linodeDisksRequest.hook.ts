import { useEffect, useState } from 'react';
import { getLinodeDisks } from 'src/services/linodes';

export const useLinodeDisksRequest = (
  linodeId: number,
  loading: boolean = false
) => {
  interface State {
    data: Linode.Disk[];
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
    console.log(`useEffect:disks`);
    setState({ ...state, loading: true, lastRequested: Date.now() });

    getLinodeDisks(linodeId)
      .then(({ data }) => setState({ ...state, loading: false, data }))
      .catch(error => setState({ ...state, loading: false, error }));
  }, [linodeId]);

  return state;
};
