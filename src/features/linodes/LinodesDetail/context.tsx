import * as React from 'react';

export interface Requestable<T> {
  lastUpdated: number;
  loading: boolean;
  request: (...args: any[]) => Promise<any>;
  update: (f: (t: T) => T) => void;
  data?: T;
  errors?: Linode.ApiFieldError[];
}

function createHOCForConsumer <T>(Consumer: any, displayName: string) {
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

const initialState = {
  lastUpdated: 0,
  loading: true,
  request: () => Promise.resolve(),
  update: () => null,
};

const configsContext = React.createContext<Requestable<Linode.Config[]>>({ ...initialState });
export const withConfigs = createHOCForConsumer<Linode.Config[]>(configsContext.Consumer, 'WithConfigs');
export const ConfigsProvider = configsContext.Provider;
export const ConfigsConsumer = configsContext.Consumer;

const disksContext = React.createContext<Requestable<Linode.Disk[]>>({...initialState});
export const withDisks = createHOCForConsumer<Linode.Disk[]>(disksContext.Consumer, 'WithDisks');
export const DisksProvider = disksContext.Provider;
export const DisksConsumer = disksContext.Consumer;

const linodeContext = React.createContext<Requestable<Linode.Linode>>({...initialState});
export const withLinode = createHOCForConsumer<Linode.Linode>(linodeContext.Consumer, 'WithLinode');
export const LinodeProvider = linodeContext.Provider;
export const LinodeConsumer = linodeContext.Consumer;

const volumesContext = React.createContext<Requestable<Linode.Volume[]>>({...initialState});
export const withVolumes = createHOCForConsumer<Linode.Volume[]>(volumesContext.Consumer, 'WithVolumes');
export const VolumesProvider = volumesContext.Provider;
export const VolumesConsumer = volumesContext.Consumer;

const imageContext = React.createContext<Requestable<Linode.Image>>({...initialState});
export const withImage = createHOCForConsumer<Linode.Image>(imageContext.Consumer, 'WithImage');
export const ImageProvider = imageContext.Provider;
export const ImageConsumer = imageContext.Consumer;

function getDisplayName(Component: React.ComponentType) {
  return Component.displayName ||
    Component.name ||
    'Component';
}
