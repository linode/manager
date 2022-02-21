import * as React from 'react';
import { compose } from 'recompose';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ManagedLandingContent from './ManagedLandingContent';

const docs: Linode.Doc[] = [
  {
    title: 'Linode Managed',
    src: 'https://linode.com/docs/platform/linode-managed/',
    body: `How to configure service monitoring with Linode Managed.`,
  },
];

export const ManagedLanding = () => {
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Managed" />
      <ManagedLandingContent />
    </React.Fragment>
  );
};

const enhanced = compose(setDocs(docs));

export default enhanced(ManagedLanding);
