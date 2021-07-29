import * as React from 'react';
import Accordion, { AccordionProps } from 'src/components/Accordion';
import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';

interface Props extends Omit<AccordionProps, 'children'> {
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
          minHeight: height,
        }}
      >
        <CircleProgress mini />
      </div>
    );
  }

  return renderMainContent();
};

const ExtendedAccordion: React.FC<Props> = (props) => {
  const {
    error,
    heading,
    height,
    loading,
    onChange,
    renderMainContent,
    headingNumberCount,
  } = props;

  return (
    <Accordion
      heading={heading}
      onChange={onChange}
      headingNumberCount={headingNumberCount}
    >
      {renderContent(error, Boolean(loading), height || 300, renderMainContent)}
    </Accordion>
  );
};

export default ExtendedAccordion;
