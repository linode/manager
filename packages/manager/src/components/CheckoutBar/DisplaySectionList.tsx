import { Divider } from '@linode/ui';
import * as React from 'react';

import { DisplaySection } from './DisplaySection';

interface DisplaySectionListProps {
  displaySections?: { details?: number | string; title: string }[];
}

const DisplaySectionList = ({ displaySections }: DisplaySectionListProps) => {
  if (!displaySections) {
    return null;
  }
  return (
    <>
      {displaySections.map(({ details, title }, idx) => (
        <React.Fragment key={`fragment-${title}-${idx}`}>
          {idx !== 0 && <Divider light spacingBottom={0} spacingTop={0} />}
          <DisplaySection
            details={details}
            key={`${title}-${idx}`}
            title={title}
          />
        </React.Fragment>
      ))}
    </>
  );
};

export { DisplaySectionList };
