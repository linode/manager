import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import { getStackscripts } from 'src/services/stackscripts';
import TabbedPanel from 'src/components/TabbedPanel';

import StackScriptsSection from './StackScriptsSection';
import CircleProgress from 'src/components/CircleProgress';

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

class SelectLinodePanel extends React.Component<CombinedProps> {

  render() {
    const { classes } = this.props;

    return (
      <TabbedPanel
        rootClass={classes.root}
        header="Select StackScript"
        tabClass={classes.tab}
        tabs={[
          {
            title: 'My StackScripts',
            render: () => <Container request={getStackscripts} key={0} />,
          },
          {
            title: 'Linode StackScripts',
            render: () => <Container request={getStackscripts} key={1} />,
          },
          {
            title: 'Community StackScripts',
            render: () => <Container request={getStackscripts} key={2} />,
          },
        ]}
      />
    );
  }
}

interface ContainerProps {
  request: (page: number) => Promise<Linode.ResourcePage<Linode.StackScript.Response>>;
}

interface ContainerState {
  currentPage: number;
  selected?: number;
  loading?: boolean;
  data?: any;
}

class Container extends React.Component<ContainerProps, ContainerState> {
  state: ContainerState = {
    currentPage: 0,
    loading: true,
  };

  getDataAtPage = (page: number) => {
    const { request } = this.props;

    request(0)
      .then(response => this.setState({ data: response.data, loading: false }))
      .catch();
  }

  componentDidMount() {
    this.getDataAtPage(0);
  }

  getNext = () => {
    this.setState(
      { currentPage: this.state.currentPage + 1 },
      () => this.getDataAtPage(this.state.currentPage),
    );
  }

  render() {
    if (this.state.loading) {
      return <CircleProgress />;
    }

    return (
      <StackScriptsSection
        onSelect={id => this.setState({ selected: id })}
        selectedId={this.state.selected}
        data={this.state.data}
        getNext={() => this.getNext()}
      />
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(SelectLinodePanel);
