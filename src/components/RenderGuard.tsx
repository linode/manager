import * as React from 'react';
import { equals } from 'ramda';

type Props = any;

export default class RenderGuard extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    // should the component update due to shallow comparison?
    if (Array.isArray(this.props.checkProps)) {
      const shouldUpdateBecauseShallow = this.props.checkProps.reduce(
        (acc: boolean, propName: string) => {
          return acc || !(this.props[propName] === nextProps[propName]);
        }, false);
      // return early if we already know that we need update
      if (shouldUpdateBecauseShallow) { return true; }
      // but fall through otherwise to the deep comparison!
    }

    // should the component update due to deep comparison?
    if (Array.isArray(this.props.deepCheckProps)) {
      return this.props.deepCheckProps.reduce(
        (acc: boolean, propName: string) => {
          return acc || !equals(this.props[propName], nextProps[propName]);
        }, false);
    }

    return false;
  }

  render() {
    return (
      <React.Fragment>
        {this.props.children}
      </React.Fragment>
    );
  }
}
