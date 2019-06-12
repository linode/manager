import * as React from 'react';
import { compose } from 'recompose'
import ManagedIcon from 'src/assets/icons/managed.svg';

import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Placeholder from 'src/components/Placeholder';

export class ManagedLanding extends React.Component<{}, {}> {
  static docs: Linode.Doc[] = [
    {
      title: 'Linode Managed',
      src: 'https://linode.com/docs/platform/linode-managed/',
      body: `How to configure service monitoring with Linode Managed.`
    }
  ];

  render() {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Managed" />
        <Placeholder
          icon={ManagedIcon}
          title="Linode Managed"
          copy={`Linode Managed is only available in the Classic Manager.`}
          buttonProps={{
            onClick: () =>
              window.open(
                'https://manager.linode.com/account#managed',
                '_blank'
              ),
            children: 'Navigate to Classic Manager'
          }}
        />
      </React.Fragment>
    );
  }
}

export default compose<{}, {}>(
  setDocs(ManagedLanding.docs),
)(ManagedLanding);
