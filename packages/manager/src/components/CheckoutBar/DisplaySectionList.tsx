import * as React from 'react';
import Divider from '../Divider';
import { DisplaySection } from './DisplaySection';

interface DisplaySectionListProps {
  displaySections?: { title: string; details?: string | number }[];
}

const DisplaySectionList = ({ displaySections }: DisplaySectionListProps) => {
  if (!displaySections) {
    return null;
  }
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {displaySections.map(({ title, details }, idx) => (
        <React.Fragment key={`fragment-${title}-${idx}`}>
          {idx !== 0 && <Divider light spacingTop={0} spacingBottom={0} />}
          <DisplaySection
            key={`${title}-${idx}`}
            title={title}
            details={details}
          />
        </React.Fragment>
      ))}
    </>
  );
};

export { DisplaySectionList };
