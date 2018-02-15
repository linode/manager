export const SET_SOURCE = '@@source/SET_SOURCE';

export function setSource(source) {
  return {
    type: SET_SOURCE,
    source: process.env.NODE_ENV === 'test' ? 'test' : source,
  };
}
