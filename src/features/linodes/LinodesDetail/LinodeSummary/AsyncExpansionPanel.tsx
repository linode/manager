import * as React from 'react';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import ExpansionPanel from 'src/components/ExpansionPanel';

interface Props {
  heading: string;
  isLoading: boolean;
  error: boolean;
  onChange: (e: any, expanded: boolean) => void;
  renderMainContent: () => JSX.Element;
}

/*
 * onChange: function that will be called whenever the panel is opened
 * or closed.
 * 
 * renderMainContent: This component provides loading and error
 * states based on props. If there are no errors and loading is false,
 * this function will be called to render the actual content of the panel.
 * 
 */

const renderContent = (error: boolean, isLoading: boolean, renderMainContent: () => JSX.Element) => {

  if (error) {
    return (
      <ErrorState errorText="Unable to load data for this Linode." />
    )
  }

  if (isLoading) {
    return (
      <div style={{'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center'}} >
        <CircleProgress mini />
      </div>
    )
  }

  return renderMainContent();
}

const AsyncExpansionPanel: React.StatelessComponent<Props> = (props) => {

  const { error, heading, isLoading, onChange, renderMainContent } = props;
  return (
    <ExpansionPanel
      heading={heading}
      onChange={onChange}
    >
      {renderContent(error, isLoading, renderMainContent)}
    </ExpansionPanel>
  );
}

export default AsyncExpansionPanel;
