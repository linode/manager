import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';


import { getStackscripts, getMyStackscripts, getLinodeStackscripts }
  from 'src/services/stackscripts';

import Button from 'src/components/Button';
import Grid from 'src/components/Grid';
import TabbedPanel from 'src/components/TabbedPanel';
import StackScriptsSection from './StackScriptsSection';
import CircleProgress from 'src/components/CircleProgress';
import RenderGuard from 'src/components/RenderGuard';

export interface ExtendedLinode extends Linode.Linode {
  heading: string;
  subHeadings: string[];
}

type ClassNames = 'root'
  | 'creating'
  | 'selecting'
  | 'container'
  | 'labelCell'
  | 'stackscriptLabel';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    marginBottom: theme.spacing.unit * 3,
  },
  creating: {
    minHeight: '200px',
    maxHeight: '400px',
    overflowX: 'hidden',
  },
  selecting: {
    maxHeight: '1000px',
    overflowX: 'hidden',
  },
  container: {
    padding: theme.spacing.unit * 2,
  },
  labelCell: {
    background: theme.bg.offWhite,
    fontSize: '.9rem',
    fontWeight: 700,
    paddingTop: '16px !important',
    paddingBottom: '16px !important',
  },
  stackscriptLabel: {
    [theme.breakpoints.up('lg')]: {
      paddingLeft: '78px !important',
    },
  },
});

interface Props {
  selectedId: number | null;
  error?: string;
  shrinkPanel?: boolean;
  onSelect: (id: number, images: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]) => void;
}

type StyledProps = Props & WithStyles<ClassNames>;

type CombinedProps = StyledProps;

class SelectStackScriptPanel extends React.Component<CombinedProps> {

  render() {
    const { classes } = this.props;

    return (
      <TabbedPanel
        error={this.props.error}
        rootClass={classes.root}
        shrinkTabContent={(this.props.shrinkPanel) ? classes.creating : classes.selecting}
        header="Select StackScript"
        tabs={[
          {
            title: 'My StackScripts',
            render: () => <StyledContainer
              onSelect={this.props.onSelect}
              request={getMyStackscripts} key={0}
            />,
          },
          {
            title: 'Linode StackScripts',
            render: () => <StyledContainer
              onSelect={this.props.onSelect}
              request={getLinodeStackscripts} key={1}
            />,
          },
          {
            title: 'Community StackScripts',
            render: () => <StyledContainer
              onSelect={this.props.onSelect}
              request={getStackscripts} key={2}
            />,
          },
        ]}
      />
    );
  }
}

interface Params {
  page?: number;
  page_size?: number;
}

interface ContainerProps {
  request: (params: Params) =>
    Promise<Linode.ResourcePage<Linode.StackScript.Response>>;
  onSelect: (id: number, images: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]) => void;
}

interface ContainerState {
  currentPage: number;
  selected?: number;
  loading?: boolean;
  gettingMoreStackScripts: boolean;
  showMoreButtonVisible: boolean;
  data: any; // @TODO type correctly
}

type ContainerCombinedProps = ContainerProps & WithStyles<ClassNames>;

class Container extends React.Component<ContainerCombinedProps, ContainerState> {
  state: ContainerState = {
    currentPage: 1,
    loading: true,
    gettingMoreStackScripts: false,
    data: [],
    showMoreButtonVisible: true,
  };

  getDataAtPage = (page: number) => {
    const { request } = this.props;
    this.setState({ gettingMoreStackScripts: true });

    request({ page, page_size: 50 })
      .then((response) => {
        if (!response.data.length) {
          this.setState({ showMoreButtonVisible: false });
        }
        this.setState({
          data: [...this.state.data, ...response.data],
          gettingMoreStackScripts: false,
          loading: false,
        });
      })
      .catch((e) => {
        this.setState({ gettingMoreStackScripts: false });
      });
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

  handleSelectStackScript = (stackscript: Linode.StackScript.Response) => {
    this.props.onSelect(
      stackscript.id,
      stackscript.images,
      stackscript.user_defined_fields,
    );
    this.setState({ selected: stackscript.id });
  }

  render() {
    const { classes } = this.props;

    if (this.state.loading) {
      return <CircleProgress />;
    }

    return (
      <React.Fragment>
        <Grid container className={classes.container}>
          <Grid
            item xs={12}
            lg={6}
            className={`${classes.labelCell} ${classes.stackscriptLabel}`}
          >
            <label>StackScripts</label>
          </Grid>
          <Grid
            item xs={12}
            lg={1}
            className={`${classes.labelCell}`}
          >
            <label>Active Deploy</label>
          </Grid>
          <Grid
            item xs={12}
            lg={2}
            className={`${classes.labelCell}`}
          >
            <label>Last Revision</label>
          </Grid>
          <Grid
            item xs={12}
            lg={3}
            className={`${classes.labelCell}`}
          >
            <label>Compatible Images</label>
          </Grid>
        </Grid>
        <StackScriptsSection
          onSelect={this.handleSelectStackScript}
          selectedId={this.state.selected}
          data={this.state.data}
          getNext={() => this.getNext()}
        />
        {this.state.showMoreButtonVisible &&
          <Button
            title="Show More StackScripts"
            onClick={this.getNext}
            type="secondary"
            disabled={this.state.gettingMoreStackScripts}
            style={{ marginTop: 32 }}
          >
            {!this.state.gettingMoreStackScripts
              ? 'Show More StackScripts'
              : 'Loading...'
            }
          </Button>
        }
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const StyledContainer = styled(Container);

export default styled(RenderGuard<CombinedProps>(SelectStackScriptPanel));
