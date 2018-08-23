import * as React from 'react';

import { getDisplayName } from 'src/utilities';

export interface Requestable<T> {
  lastUpdated: number;
  loading: boolean;
  request: (...args: any[]) => Promise<any>;
  update: (f: (t: T) => T) => void;
  data?: T;
  errors?: Linode.ApiFieldError[];
}

export function createHOCForConsumer<T>(Consumer: any, displayName: string) {
  return function withContext<P>(mapStateToProps?: (v: Requestable<T>) => any) {
    return function (Component: React.ComponentType<P>) {
      return class ComponentWithContext extends React.Component<Requestable<P>> {
        static displayName = `${displayName}(${getDisplayName(Component)})`;
        render() {
          return (
            <Consumer>
              {(c: any) => {
                const context = mapStateToProps ? mapStateToProps(c) : c;

                return <Component {...this.props} {...context} />
              }}
            </Consumer>
          );
        }
      }
    };
  }
}
