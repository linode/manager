import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ManagedLandingContent from './ManagedLandingContent';

export type CombinedProps = RouteComponentProps<{}>;

const docs: Linode.Doc[] = [
  {
    title: 'Linode Managed',
    src: 'https://linode.com/docs/platform/linode-managed/',
    body: `How to configure service monitoring with Linode Managed.`
  }
];

export const ManagedLanding: React.FunctionComponent<CombinedProps> = props => {
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Managed" />
      <ManagedLandingContent {...props} />
    </React.Fragment>
  );
};

const enhanced = compose<CombinedProps, {}>(setDocs(docs));

export default enhanced(ManagedLanding);
