/*

This component allows for dynamism in what is displayed as the tab/window title depending
on where the user is in the application. Example: "Linodes | Akamai Cloud Manager" when on
the Linodes landing page. More context: https://github.com/linode/manager/pull/9406

*/

import { usePrevious } from '@linode/utilities';
import { reverse } from 'ramda';
import * as React from 'react';

interface DocumentTitleSegmentsContext {
  appendSegment: (segment: string) => void;
  removeSegment: (segment: string) => void;
}

const documentTitleSegments = React.createContext<DocumentTitleSegmentsContext>(
  {
    appendSegment: () => null,
    removeSegment: () => null,
  }
);

const DocumentTitleSegmentsProvider = documentTitleSegments.Provider;

const DocumentTitleSegmentsConsumer = documentTitleSegments.Consumer;

interface DocumentTitleSegmentProps {
  segment: string;
}
interface InnerDocumentTitleSegmentProps
  extends DocumentTitleSegmentsContext,
    DocumentTitleSegmentProps {}

const InnerDocumentTitleSegment = (props: InnerDocumentTitleSegmentProps) => {
  const { appendSegment, removeSegment, segment } = props;

  const prevSegment = usePrevious(segment) ?? '';

  React.useEffect(() => {
    appendSegment(segment);

    if (prevSegment !== segment) {
      removeSegment(prevSegment);
      appendSegment(segment);
    }

    return () => removeSegment(segment);
  });

  return null;
};

export const DocumentTitleSegment = (props: DocumentTitleSegmentProps) => {
  const { segment } = props;

  return (
    <DocumentTitleSegmentsConsumer>
      {(value: DocumentTitleSegmentsContext) => (
        <InnerDocumentTitleSegment segment={segment} {...value} />
      )}
    </DocumentTitleSegmentsConsumer>
  );
};

export const withDocumentTitleProvider =
  <Props extends {}>(Component: React.ComponentType<Props>) =>
  (props: Props) => {
    let titleSegments: string[] = [];

    const updateDocumentTitle = () => {
      const newTitle = reverse(titleSegments).join(' | ');
      document.title = newTitle;
    };

    const appendSegment: DocumentTitleSegmentsContext['appendSegment'] = (
      segment: string
    ) => {
      titleSegments = [...titleSegments, segment];
      updateDocumentTitle();
    };

    const removeSegment: DocumentTitleSegmentsContext['removeSegment'] = (
      segment: string
    ) => {
      const targetIdx = titleSegments.findIndex((el) => el === segment);
      titleSegments.splice(targetIdx, 1);
      updateDocumentTitle();
    };

    return (
      <DocumentTitleSegmentsProvider value={{ appendSegment, removeSegment }}>
        <Component {...props} />
      </DocumentTitleSegmentsProvider>
    );
  };
