import * as React from 'react';

import { compose } from 'ramda';

import {
  StyleRulesCallback,
  
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Placeholder from 'src/components/Placeholder';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

type CombinedProps = WithStyles<ClassNames>;

export class ManagedLanding extends React.Component<CombinedProps, {}> {
  static docs: Linode.Doc[] = [
    {
      title: 'Linode Managed',
      src: 'https://linode.com/docs/platform/linode-managed/',
      body: `How to configure service monitoring with Linode Managed.`,
    },
  ];

  render() {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Managed" />        
        <Placeholder
          title="Managed Services"
          copy={`Linode Managed is only available in the Classic Manager`}
          buttonProps={{
            onClick: () => window.open('https://manager.linode.com/account#managed', '_blank'),
            children: 'Navigate to Classic Manager',
          }}
        />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  setDocs(ManagedLanding.docs),
  styled
)(ManagedLanding)
