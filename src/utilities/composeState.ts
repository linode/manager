type Callback = () => void;
type MapState<S = {}> = ((prevState: Readonly<S>) => (S | null));
type setState<S = {}> = (fn: MapState<S>, callback?: Callback) => void;

export default function <S>(
  this: { setState: setState },
  fns: MapState[],
  callback: Callback = () => null,
) {
  this.setState(
    (state) => fns.reverse().reduce((result, fn) => fn(result), state),
    () => callback(),
  );
}
