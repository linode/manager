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

/* tslint:disable */
export function createHOCForConsumer<T>(Consumer: any, displayName: string) {
  return function withContext<P>(mapStateToProps?: (v: T) => any) {
    return function(Component: React.ComponentType<P>) {
      /* tslint:enable */
      return class ComponentWithContext extends React.Component<P> {
        static displayName = `${displayName}(${getDisplayName(Component)})`;
        render() {
          return (
            <Consumer>
              {(c: any) => {
                const context = mapStateToProps ? mapStateToProps(c) : c;

                return <Component {...this.props} {...context} />;
              }}
            </Consumer>
          );
        }
      };
    };
  };
}
