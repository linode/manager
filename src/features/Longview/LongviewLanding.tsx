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
import { MonitoringYourServer } from 'src/documentation';

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
    MonitoringYourServer,
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
            children: 'Navigate to Classic Manager',
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
