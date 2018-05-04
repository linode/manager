import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import ExpansionPanel, { ExpansionPanelProps } from 'src/components/ExpansionPanel';
import ErrorState from 'src/components/ErrorState';


export interface Props extends ExpansionPanelProps { }

export default (expansionPanelProps: Props) =>
  <P extends {}>(Component: React.ComponentType<P>) => {
    type ClassNames = 'root';

    const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
      root: {},
    });

    interface State {
      error?: Error;
      info?: any;
    }

    type CombinedProps = P & WithStyles<ClassNames>;

    class PanelErrorBoundary extends React.Component<CombinedProps, State> {
      state: State = {};
      componentDidCatch(error: Error, info: any) {
        this.setState({ error, info });
      }

      render() {
        const { error } = this.state;

        if (error) {
          return (
            <ExpansionPanel defaultExpanded {...expansionPanelProps}>
              <ErrorState compact errorText="An error has occured. Please reload and try again." />
            </ExpansionPanel>
          );
        }

        return <Component {...this.props} />;
      }
    }

    const styled = withStyles(styles, { withTheme: true });

    return styled(PanelErrorBoundary);
  };
