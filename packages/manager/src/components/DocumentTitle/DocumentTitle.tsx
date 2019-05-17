import { reverse } from 'ramda';
import * as React from 'react';

interface DocumentTitleSegmentsContext {
  appendSegment: (segment: string) => void;
  removeSegment: (segment: string) => void;
}

const documentTitleSegments = React.createContext<DocumentTitleSegmentsContext>(
  {
    appendSegment: () => null,
    removeSegment: () => null
  }
);

const DocumentTitleSegmentsProvider = documentTitleSegments.Provider;

const DocumentTitleSegmentsConsumer = documentTitleSegments.Consumer;

interface Props {
  segment: string;
}

class InnerDocumentTitleSegment extends React.Component<
  Props & DocumentTitleSegmentsContext
> {
  componentDidMount() {
    this.props.appendSegment(this.props.segment);
  }

  componentDidUpdate(prevProps: Props & DocumentTitleSegmentsContext) {
    if (prevProps.segment !== this.props.segment) {
      this.props.removeSegment(prevProps.segment);
      this.props.appendSegment(this.props.segment);
    }
  }

  componentWillUnmount() {
    this.props.removeSegment(this.props.segment);
  }

  render() {
    return null;
  }
}

export class DocumentTitleSegment extends React.Component<Props> {
  render() {
    return (
      <DocumentTitleSegmentsConsumer>
        {(value: DocumentTitleSegmentsContext) => (
          <InnerDocumentTitleSegment segment={this.props.segment} {...value} />
        )}
      </DocumentTitleSegmentsConsumer>
    );
  }
}

/* tslint:disable-next-line */
export function withDocumentTitleProvider<P>(
  Component: React.ComponentType<P>
) {
  return class DocumentTitleProviderManager extends React.Component<
    P,
    DocumentTitleSegmentsContext
  > {
    /* Make this a class property to avoid race conditions with setState */
    titleSegments: string[] = [];

    state: DocumentTitleSegmentsContext = {
      appendSegment: (segment: string) => {
        this.titleSegments = [...this.titleSegments, segment];
        this.updateDocumentTitle();
      },

      removeSegment: (segment: string) => {
        const targetIdx = this.titleSegments.findIndex(el => el === segment);
        this.titleSegments.splice(targetIdx, 1);
        this.updateDocumentTitle();
      }
    };

    updateDocumentTitle = () => {
      const newTitle = reverse(this.titleSegments).join(' | ');
      document.title = newTitle;
    };

    render() {
      return (
        <DocumentTitleSegmentsProvider value={this.state}>
          <Component {...this.props} />
        </DocumentTitleSegmentsProvider>
      );
    }
  };
}
