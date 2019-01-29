type Callback = () => void;
type MapState<S = {}> = (prevState: Readonly<S>) => S | null;
type setState<S = {}> = (fn: MapState<S>, callback?: Callback) => void;

export default function composeState<S>(
  this: { setState: setState<S> },
  fns: MapState<S>[],
  callback: Callback = () => null
) {
  this.setState(
    state => fns.reverse().reduce((result, fn) => fn(result), state),
    () => callback()
  );
}
