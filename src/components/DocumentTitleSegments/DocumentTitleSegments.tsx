import * as React from 'react';

import { getDisplayName } from 'src/utilities';

export interface TitleSegmentsContext {
  titleSegments: string[];
  appendSegment: (segment: string) => void;
  removeSegment: (segment: string) => void;
}

const documentTitleSegments = React.createContext<TitleSegmentsContext>({
  titleSegments: [],
  appendSegment: () => null,
  removeSegment: () => null,
})

export const DocumentTitleSegmentsProvider = documentTitleSegments.Provider;

const DocumentTitleSegmentsConsumer = documentTitleSegments.Consumer;

export function withDocumentTitleSegment<P> (segment: string) {
  return function (Component: React.ComponentType<P>) {
    class ComponentWithDocumentTitleSegment extends React.Component<TitleSegmentsContext> {
      static displayName = `WithDocumentTitleSegment(${getDisplayName(Component)}`

      componentDidMount() {
        this.props.appendSegment(segment);
      }

      componentWillUnmount() {
        this.props.removeSegment(segment);
      }

      render() {
        return (
          /* The component does not need to passed any information about its title segment */
          <Component />
        )
      }

    }

    /* 
     * This must be a _doubly nested_ HOC, so that we can control the context
     * using lifecycle methods
     */
    return class InnerComponentWithDocumentTitleSegment extends React.Component {
      static displayName = `InnerComponentWithDocumentTitleSegment(${getDisplayName(
        ComponentWithDocumentTitleSegment)})`

      render() {
        return (
          <DocumentTitleSegmentsConsumer>
            {(value: TitleSegmentsContext) => {
              return <ComponentWithDocumentTitleSegment {...value} />
            }}
          </DocumentTitleSegmentsConsumer>
        );
      }
    }
  }
}
