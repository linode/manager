import * as React from 'react';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import ExpansionPanel, {
  ExpansionPanelProps
} from 'src/components/ExpansionPanel';

interface Props extends ExpansionPanelProps {
  height?: number;
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

const renderContent = (
  error: string | undefined,
  isLoading: boolean,
  height: number,
  renderMainContent: () => JSX.Element
) => {
  if (error) {
    return <ErrorState errorText={error} />;
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: height
        }}
      >
        <CircleProgress mini />
      </div>
    );
  }

  return renderMainContent();
};

const ExtendedExpansionPanel: React.StatelessComponent<Props> = props => {
  const {
    error,
    heading,
    height,
    loading,
    onChange,
    renderMainContent
  } = props;
  return (
    <ExpansionPanel heading={heading} onChange={onChange}>
      {renderContent(error, Boolean(loading), height || 300, renderMainContent)}
    </ExpansionPanel>
  );
};

export default ExtendedExpansionPanel;
