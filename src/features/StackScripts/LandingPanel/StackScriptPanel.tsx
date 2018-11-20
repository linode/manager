import {
  StyleRulesCallback,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import * as React from 'react';

import TabbedPanel from 'src/components/TabbedPanel';

import PanelContent from './PanelContent';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

type CombinedProps = WithStyles<ClassNames>;

class StackScriptPanel extends React.Component<CombinedProps, {}> {

  tabs = [
    {
      title: 'My StackScripts',
      render: () => {
        return (
          <PanelContent
            type='own'
          />
        )
      },
    },
    {
      title: 'Linode StackScripts',
      render: () => {
        return (
          <PanelContent
            type='linode'
          />
        )
      },
    },
    {
      title: 'Community StackScripts',
      render: () => {
        return (
          <PanelContent
            type='community'
          />
        )
      },
    },
  ];

  render() {
    return (
      <TabbedPanel
        header=""
        tabs={this.tabs}
      />
    );
  }
}

const styled = withStyles(styles);

export default styled(StackScriptPanel);
