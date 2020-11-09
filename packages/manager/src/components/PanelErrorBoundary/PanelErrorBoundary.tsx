import * as React from 'react';
import ErrorState from 'src/components/ErrorState';
import Accordion, { AccordionProps } from 'src/components/Accordion';

/* tslint:disable-next-line */
export interface Props extends Omit<AccordionProps, 'children'> {}

export default (AccordionProps: Props) => <P extends {}>(
  Component: React.ComponentType<P>
) => {
  interface State {
    error?: Error;
    info?: any;
  }

  type CombinedProps = P;

  class PanelErrorBoundary extends React.Component<CombinedProps, State> {
    state: State = {};
    componentDidCatch(error: Error, info: any) {
      this.setState({ error, info });
    }

    render() {
      const { error } = this.state;

      if (error) {
        return (
          <Accordion defaultExpanded {...AccordionProps}>
            <ErrorState
              compact
              errorText="An error has occured. Please reload and try again."
            />
          </Accordion>
        );
      }

      return <Component {...this.props} />;
    }
  }

  return PanelErrorBoundary;
};
