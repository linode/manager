import * as React from 'react';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import ExpansionPanel from 'src/components/ExpansionPanel';

interface Props {
  chartHeight: number;
  rangeSelection: string;
  classes: any;
  heading: string;
  isLoading: boolean;
  error: boolean;
  onChange: (e: any, expanded: boolean) => void;
  renderMainContent: () => JSX.Element;
}

class AsyncExpansionPanel extends React.PureComponent<Props, {}> {
  renderContent = () => {
    const { error, isLoading } = this.props;

    if (error) {
      return (
        <ErrorState errorText="Unable to load data for this Linode" />
      )
    }

    if (isLoading) {
      return (
        <div className={this.props.classes.loadingSpinner} >
          <CircleProgress mini />
        </div>
      )
    }

    return this.props.renderMainContent();
  }

  render() {
    const { heading, onChange } = this.props;
    return (
      <ExpansionPanel
        heading={heading}
        onChange={onChange}
      >
        {this.renderContent()}
      </ExpansionPanel>
    );
  }
}

export default AsyncExpansionPanel;
