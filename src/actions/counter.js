export const INCREMENT = '@@counter/INCREMENT';
export const DECREMENT = '@@counter/DECREMENT';

export function increment() {
  return { type: INCREMENT };
}

export function decrement() {
  return { type: DECREMENT };
}
