import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { pathOr } from 'ramda';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Table from 'material-ui/Table';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import TableBody from 'material-ui/Table/TableBody';
import ViewList from 'material-ui-icons/ViewList';
import ViewModule from 'material-ui-icons/ViewModule';

import WithDocumentation from 'src/components/WithDocumentation';
import LinodeRow from './LinodeRow';
import ListLinodesEmptyState from './ListLinodesEmptyState';

type CSSClasses = 
    'toggleBox'
  | 'toggleButton'
  | 'toggleButtonActive'
  | 'toggleButtonLeft'
  | 'toggleButtonRight'
  | 'icon';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  toggleBox: {
    marginBottom: theme.spacing.unit * 2,
  },
  toggleButton: {
    border: '1px solid #333',
  },
  toggleButtonActive: {
    backgroundColor: '#333',
    color: '#f3f3f3',
    '&:hover': {
      backgroundColor: '#333',
    },
  },
  toggleButtonLeft: {
    borderWidth: '1px 0 1px 1px',
    borderRadius: '5px 0 0 5px',
  },
  toggleButtonRight: {
    borderWidth: '1px 1px 1px 0',
    borderRadius: '0 5px 5px 0',
  },
  icon: {
    marginRight: theme.spacing.unit,
  },
});

interface Props {
  linodes: Linode.Linode[];
}

class ListLinodes extends React.Component<Props & WithStyles<CSSClasses> > {
  state = {
    viewStyle: 'list',
  };

  static defaultProps = {
    linodes: [],
  };

  /**
  * @todo Test docs for review.
  */
  docs = [
    {
      title: 'Lorem Ipsum Dolor',
      src: 'http://www.linode.com',
      body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
   Suspendisse dignissim porttitor turpis a elementum. Ut vulputate
   ex elit, quis sed.`,
    },
    {
      title: 'Lorem Ipsum Dolor',
      src: 'http://www.linode.com',
      body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
   Suspendisse dignissim porttitor turpis a elementum. Ut vulputate
   ex elit, quis sed.`,
    },
    {
      title: 'Lorem Ipsum Dolor',
      src: 'http://www.linode.com',
      body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
   Suspendisse dignissim porttitor turpis a elementum. Ut vulputate
   ex elit, quis sed.`,
    },
  ];

  changeViewStyle(style: string) {
    this.setState({ viewStyle: style });
  }

  linodeList() {
    const { linodes } = this.props;

    return (
      <Grid item xs={12}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>IP Addresses</TableCell>
              <TableCell>Region</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {linodes.map((l, idx) => <LinodeRow key={idx} linode={l} />)}
          </TableBody>
        </Table>
      </Grid>
    );
  }

  listLinodes() {
    const { classes } = this.props;
    const { viewStyle } = this.state;

    return (
      <Grid container>
        <div className={classes.toggleBox}>
          <Button
            onClick={() => this.changeViewStyle('list')}
            className={`
              ${viewStyle === 'list' && classes.toggleButtonActive}
              ${classes.toggleButton}
              ${classes.toggleButtonLeft}`
            }
          >
            <ViewList className={classes.icon}/>
            List
          </Button>
          <Button
            onClick={() => this.changeViewStyle('grid')}
            className={`
              ${viewStyle === 'grid' && classes.toggleButtonActive}
              ${classes.toggleButton}
              ${classes.toggleButtonRight}`
            }
          >
            <ViewModule className={classes.icon}/>
            Grid
          </Button>
        </div>
        <Paper elevation={1}>
          {viewStyle === 'list'
            ? this.linodeList()
            : null
          }
        </Paper>
      </Grid>
    );
  }

  render() {
    const { linodes } = this.props;
    return (
      <WithDocumentation
        title="Linodes"
        docs={this.docs}
        render={() =>
          linodes.length > 0
            ? this.listLinodes()
            : <ListLinodesEmptyState />}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  linodes: pathOr([], ['api', 'linodes', 'data'], state),
});

export default compose(
  connect<Props>(mapStateToProps),
  withStyles(styles, { withTheme: true }),
)(ListLinodes);
