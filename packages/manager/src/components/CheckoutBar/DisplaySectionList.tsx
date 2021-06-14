import * as React from 'react';
import Divider from '../core/Divider';
import DisplaySection from './DisplaySection';

interface Props {
  displaySections?: { title: string; details?: string | number }[];
}

export const DisplaySectionList: React.FC<Props> = ({ displaySections }) => {
  if (!displaySections) {
    return null;
  }
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {displaySections.map(({ title, details }, idx) => (
        <>
          {idx !== 0 && <Divider light spacingTop={0} spacingBottom={0} />}
          <DisplaySection
            key={`${title}-${idx}`}
            title={title}
            details={details}
          />
        </>
      ))}
    </>
  );
};

export default DisplaySectionList;
