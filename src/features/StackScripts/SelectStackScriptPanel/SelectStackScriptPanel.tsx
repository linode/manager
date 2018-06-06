import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import {
  getMyStackscripts,
  getCommunityStackscripts,
  getLinodeStackscripts,
} from 'src/services/stackscripts';
import TabbedPanel from 'src/components/TabbedPanel';
import PromiseLoader from 'src/components/PromiseLoader';

import StackScriptsSection, { Props as StackScriptsSectionProps } from './StackScriptsSection';

export interface ExtendedLinode extends Linode.Linode {
  heading: string;
  subHeadings: string[];
}

type ClassNames = 'root' | 'tab';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    maxHeight: '400px',
  },
  tab: {
    maxHeight: '400px',
    overflowX: 'hidden',
  },
});

interface Props {
  selectedId?: number;
  onSelect: (id: number) => void;
}

type StyledProps = Props & WithStyles<ClassNames>;

type CombinedProps = StyledProps;

class SelectStackScriptPanel extends React.Component<CombinedProps> {

  render() {
    const { classes, onSelect, selectedId } = this.props;

    return (
      <TabbedPanel
        rootClass={classes.root}
        header="Select StackScript"
        tabClass={classes.tab}
        tabs={[
          {
            title: 'My StackScripts',
            render: () => <MyStackScripts
              onSelect={onSelect}
              selectedId={selectedId}
            />,
          },
          {
            title: 'Linode StackScripts',
            render: () => <LinodeStackScripts
              onSelect={onSelect}
              selectedId={selectedId}
            />,
          },
          {
            title: 'Community StackScripts',
            render: () => <CommunityStackScripts
              onSelect={onSelect}
              selectedId={selectedId}
            />,
          },
        ]}
      />
    );
  }
}

const MyStackScripts = PromiseLoader<StackScriptsSectionProps>({
  stackScripts: () => getMyStackscripts(),
})(StackScriptsSection);

const LinodeStackScripts = PromiseLoader<StackScriptsSectionProps>({
  stackScripts: () => getLinodeStackscripts(),
})(StackScriptsSection);

const CommunityStackScripts = PromiseLoader<StackScriptsSectionProps>({
  stackScripts: () => getCommunityStackscripts('##username here##'),
})(StackScriptsSection);

const styled = withStyles(styles, { withTheme: true });

export default styled(SelectStackScriptPanel);
