export function parallel(...thunks) {
  return async (dispatch, getState) =>
    await Promise.all(thunks.map(t => t(dispatch, getState)));
}
