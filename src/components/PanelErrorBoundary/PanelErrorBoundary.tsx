import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import ErrorState from 'src/components/ErrorState';
import ExpansionPanel, { ExpansionPanelProps } from 'src/components/ExpansionPanel';

/* tslint:disable-next-line */
export interface Props extends ExpansionPanelProps { }

export default (expansionPanelProps: Props) =>
  <P extends {}>(Component: React.ComponentType<P>) => {
    type ClassNames = 'root';

    const styles: StyleRulesCallback<ClassNames> = (theme) => ({
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

    const styled = withStyles(styles);

    return styled<any>(PanelErrorBoundary);
  };
