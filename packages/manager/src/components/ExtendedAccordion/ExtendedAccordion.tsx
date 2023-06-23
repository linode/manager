import * as React from 'react';
import Accordion, { AccordionProps } from 'src/components/Accordion';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';

interface ExtendedAccordionProps extends Omit<AccordionProps, 'children'> {
  height?: number;
  renderMainContent: () => JSX.Element;
  headingNumberCount?: number;
  defaultExpanded?: boolean;
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
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          minHeight: height,
        }}
      >
        <CircleProgress mini />
      </div>
    );
  }

  return renderMainContent();
};

export const ExtendedAccordion = (props: ExtendedAccordionProps) => {
  const {
    defaultExpanded,
    error,
    heading,
    headingNumberCount,
    height,
    loading,
    onChange,
    renderMainContent,
  } = props;

  return (
    <Accordion
      heading={heading}
      onChange={onChange}
      headingNumberCount={headingNumberCount}
      defaultExpanded={defaultExpanded}
    >
      {renderContent(error, Boolean(loading), height || 300, renderMainContent)}
    </Accordion>
  );
};
