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

export class LongviewLanding extends React.Component<CombinedProps, {}> {
  static docs: Linode.Doc[] = [
    {
      title: 'What is Longview and How to Use it',
      src: 'https://www.linode.com/docs/platform/longview/longview/',
      body: `This guide shows how to install and use Linode Longview.`,
    },
    {
      title: 'Monitoring and Maintaining Your Server',
      src: 'https://www.linode.com/docs/uptime/monitoring-and-maintaining-your-server/',
      body: `This guide introdues concepts and tools for monitoring and maintaining your server.`,
    },
  ];

  render() {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Longview" />
        <Placeholder
          title="Longview"
          copy="Keep your Linux systems running smoothly with insights from your system metrics."
          buttonProps={{
            onClick: () => window.open('https://manager.linode.com/longview', '_blank'),
            children: 'Go to Longview',
          }}
        />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  setDocs(LongviewLanding.docs),
  styled
)(LongviewLanding)
