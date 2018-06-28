import * as React from 'react';

interface Requestable<T> {
  lastUpdated: number;
  loading: boolean;
  request: (...args: any[]) => Promise<any>;
  update?: (f: (t: T) => T) => void;
  data?: T;
  errors?: Linode.ApiFieldError[];
}

export interface RequestableProps {
  configs: Requestable<Linode.Config[]>;
  disks: Requestable<Linode.Disk[]>;
  linode: Requestable<Linode.Linode>;
  volumes: Requestable<Linode.Volume[]>;
  image: Requestable<Linode.Image>
}

export const { Provider, Consumer } = React.createContext<RequestableProps>({
  configs: { lastUpdated: 0, loading: true, request: () => Promise.resolve(), },
  disks: { lastUpdated: 0, loading: true, request: () => Promise.resolve(), },
  image: { lastUpdated: 0, loading: true, request: (image: string) => Promise.resolve(), },
  linode: { lastUpdated: 0, loading: true, request: () => Promise.resolve(), },
  volumes: { lastUpdated: 0, loading: true, request: () => Promise.resolve(), },
});

export function withContext<P>(mapStateToProps?: (v: RequestableProps) => any) {
  return function (Component: React.ComponentType<P>) {
    return class ComponentWithContext extends React.Component<RequestableProps & P> {
      static displayName = `WithContext(${getDisplayName(Component)})`;
      render() {
        return (
          <Consumer>
            {c => {
              const context = mapStateToProps ? mapStateToProps(c) : c;

              return <Component {...this.props} {...context} />
            }}
          </Consumer>
        );
      }
    }
  };
}

function getDisplayName(Component: React.ComponentType) {
  return Component.displayName ||
    Component.name ||
    'Component';
}
