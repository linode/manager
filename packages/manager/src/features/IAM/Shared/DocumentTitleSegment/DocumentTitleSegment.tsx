/*
 * Updates the browser tab title for IAM routes.
 * Multiple mounted segments are combined from most-specific to least-specific.
 */

import * as React from 'react';

// Base suffix used in all IAM browser tab titles.
const BASE_TITLE_SEGMENT = 'Akamai Cloud Manager';

// Shared list of active IAM route title segments.
let titleSegments: string[] = [];

const updateDocumentTitle = () => {
  // Example: "SSO Enforcement | Identity and Access | Akamai Cloud Manager".
  document.title = [...titleSegments]
    .reverse()
    .concat(BASE_TITLE_SEGMENT)
    .join(' | ');
};

const appendSegment = (segment: string) => {
  titleSegments = [...titleSegments, segment];
  updateDocumentTitle();
};

const removeSegment = (segment: string) => {
  const targetIdx = titleSegments.findIndex(
    (titleSegment) => titleSegment === segment
  );

  if (targetIdx === -1) {
    return;
  }

  titleSegments.splice(targetIdx, 1);
  updateDocumentTitle();
};

interface DocumentTitleSegmentProps {
  segment: string;
}

// This component does not display UI; it updates the browser tab title while mounted.
export const DocumentTitleSegment = (props: DocumentTitleSegmentProps) => {
  const { segment } = props;

  React.useEffect(() => {
    appendSegment(segment);

    return () => {
      removeSegment(segment);
    };
  }, [segment]);

  return null;
};
