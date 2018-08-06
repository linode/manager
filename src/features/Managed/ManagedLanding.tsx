import * as React from 'react';

import { compose } from 'ramda';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

import setDocs from 'src/components/DocsSidebar/setDocs';
import Placeholder from 'src/components/Placeholder';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {}

interface State {}

type CombinedProps = Props & WithStyles<ClassNames>;

export class ManagedLanding extends React.Component<CombinedProps, State> {
  state: State = {};

  static docs: Linode.Doc[] = [
    {
      title: 'Linode Managed',
      src: 'https://linode.com/docs/platform/linode-managed/',
      body: `How to configure service monitoring with Linode Managed.`,
    },
  ];

  render() {
    return (
      <Placeholder
        title="Managed Services"
        copy="Let us worry about your infrastructure, so you can get back to worrying about your business."
        buttonProps={{
          onClick: () => window.open('https://manager.linode.com/account#managed', '_blank'),
          children: 'Upgrade to Linode Managed',
        }}
      />
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  setDocs(ManagedLanding.docs),
  styled
)(ManagedLanding)
