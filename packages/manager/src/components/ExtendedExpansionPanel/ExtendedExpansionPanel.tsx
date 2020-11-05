import * as React from 'react';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import ExpansionPanel, {
  ExpansionPanelProps
} from 'src/components/ExpansionPanel';
import { useFlags } from 'src/hooks/useFlags';
import ExpansionPanelCMR from '../ExpansionPanel/ExpansionPanelCMR';

interface Props extends Omit<ExpansionPanelProps, 'children'> {
  height?: number;
  renderMainContent: () => JSX.Element;
  headingNumberCount?: number;
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

const ExtendedExpansionPanel: React.FC<Props> = props => {
  const {
    error,
    heading,
    height,
    loading,
    onChange,
    renderMainContent,
    headingNumberCount
  } = props;
  const flags = useFlags();

  return (
    <React.Fragment>
      {flags.cmr ? (
        <ExpansionPanelCMR
          heading={heading}
          onChange={onChange}
          headingNumberCount={headingNumberCount}
        >
          {renderContent(
            error,
            Boolean(loading),
            height || 300,
            renderMainContent
          )}
        </ExpansionPanelCMR>
      ) : (
        <ExpansionPanel heading={heading} onChange={onChange}>
          {renderContent(
            error,
            Boolean(loading),
            height || 300,
            renderMainContent
          )}
        </ExpansionPanel>
      )}
    </React.Fragment>
  );
};

export default ExtendedExpansionPanel;
