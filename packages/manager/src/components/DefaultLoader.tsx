import * as React from 'react';
import * as Loadable from 'react-loadable';

interface OptionalLoadable<Props> {
  loading?: React.ComponentType<Loadable.LoadingComponentProps> | (() => null);
  delay?: number | false | null;
  timeout?: number | false | null;
  modules?: string[];
  webpack?: () => number[];
  loader(): Promise<
    React.ComponentType<Props> | { default: React.ComponentType<Props> }
  >;
}

const Loader = (config: OptionalLoadable<{}>) =>
  Loadable({
    loading: props => {
      if (props.error) {
        return null;
      }

      // if (props.pastDelay) {
      //  For now, no loader.
      // }

      return null;
    },

    delay: 250,

    ...config
  });

export default Loader;
