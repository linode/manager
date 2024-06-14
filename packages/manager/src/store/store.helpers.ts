import type { ThunkActionCreator } from 'src/store/types';
import type { AsyncActionCreators } from 'typescript-fsa';

export const createRequestThunk = <Req, Res, Err>(
  actions: AsyncActionCreators<Req, Res, Err>,
  request: (params: Req) => Promise<Res>
): ThunkActionCreator<Promise<Res>, Req> => {
  return (params: Req) => async (dispatch) => {
    const { done, failed, started } = actions;

    dispatch(started(params));

    try {
      const result = await request(params);
      const doneAction = done({ params, result });
      dispatch(doneAction);
      return result;
    } catch (error) {
      const failAction = failed({ error, params });
      dispatch(failAction);
      return Promise.reject(error);
    }
  };
};
