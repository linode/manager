import * as React from 'react';
import DisplaySection from './DisplaySection';

interface Props {
  displaySections?: { title: string; details?: string | number }[];
}

export const DisplaySectionList: React.FC<Props> = ({ displaySections }) => {
  if (!displaySections) {
    return null;
  }
  return (
    <>
      {displaySections.map(({ title, details }, idx) => (
        <DisplaySection
          key={`${title}-${idx}`}
          title={title}
          details={details}
          hideBorder={idx === 0}
        />
      ))}
    </>
  );
};

export default DisplaySectionList;
