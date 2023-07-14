import { reverse } from 'ramda';
import * as React from 'react';
import usePrevious from 'src/hooks/usePrevious';

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

interface Props {
  segment: string;
}

const InnerDocumentTitleSegment = (
  props: Props & DocumentTitleSegmentsContext
) => {
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

export const DocumentTitleSegment = (props: Props) => {
  const { segment } = props;

  return (
    <DocumentTitleSegmentsConsumer>
      {(value: DocumentTitleSegmentsContext) => (
        <InnerDocumentTitleSegment segment={segment} {...value} />
      )}
    </DocumentTitleSegmentsConsumer>
  );
};

type Wrapper = (Component: React.ComponentType<{}>) => React.FC<unknown>;

export const withDocumentTitleProvider: Wrapper = (
  Component: React.ComponentType<{}>
) => (props) => {
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
