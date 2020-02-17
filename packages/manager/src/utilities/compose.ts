// Stolen shamelessly from https://github.com/acdlite/recompose/blob/master/src/packages/recompose/compose.js
// (the library is no longer under active development and this is all we use from it).
import { ComponentClass, ComponentType } from 'react';

type ComponentEnhancer<TInner, TOuter> = (
  component: ComponentType<TInner>
) => ComponentClass<TOuter>;

export const compose = <TInner, TOuter>(
  ...funcs: Function[]
): ComponentEnhancer<TInner, TOuter> =>
  funcs.reduce(
    (a, b) => (...args: any) => a(b(...args)),
    (arg: any) => arg
  ) as ComponentEnhancer<TInner, TOuter>;

export default compose;
