import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose, bindActionCreators } from 'redux';
import { connect, Dispatch } from 'react-redux';

import { withStyles, WithStyles, StyleRulesCallback, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';

import { openForCreating } from 'src/store/reducers/volumeDrawer';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodebalancerIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';

import AddNewMenuItem, { MenuItem } from './AddNewMenuItem';

type CSSClasses = 'wrapper' | 'menu' | 'button' | 'caret';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  wrapper: {
    [theme.breakpoints.down('sm')]: {
      flex: 1,
    },
  },
  menu: {
    [theme.breakpoints.up('md')]: {
      marginTop: 20,
    },
  },
  button: {
    paddingRight: 22,
    [theme.breakpoints.down('sm')]: {
      padding: '6px 11px 7px 14px',
    },
  },
  caret: {
    position: 'relative',
    top: 2,
    left: 2,
    marginLeft: theme.spacing.unit / 2,
  },
});

interface Props {
  openForCreating: typeof openForCreating;
}

interface State {
  anchorEl?: HTMLElement;
}

type CombinedProps = Props & WithStyles<CSSClasses> & RouteComponentProps<{}>;

const styled = withStyles(styles, { withTheme: true });

class AddNewMenu extends React.Component<CombinedProps, State> {
  state = {
    anchorEl: undefined,
  };

  items: MenuItem[] = [
    {
      title: 'Linode',
      onClick: (e) => {
        this.props.history.push('/linodes/create');
        this.handleClose();
        e.preventDefault();
      },
      body: `High performance SSD Linux servers for all of your infrastructure needs`,
      ItemIcon: LinodeIcon,
    },
    {
      title: 'Volume',
      onClick: (e) => {
        this.props.openForCreating();
        this.handleClose();
        e.preventDefault();
      },
      body: `Block Storage service allows you to attach additional storage to your Linode`,
      ItemIcon: VolumeIcon,
    },
    {
      title: 'NodeBalancer',
      onClick: (e) => {
        this.props.history.push('/nodebalancers/create');
        this.handleClose();
        e.preventDefault();
      },
      body: `Ensure your valuable applications and services are highly-available`,
      ItemIcon: NodebalancerIcon,
    },
  ];

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  }

  render() {
    const { anchorEl } = this.state;
    const { classes } = this.props;
    const itemsLen = this.items.length;

    return (
      <div className={classes.wrapper}>
        <Button
          variant="raised"
          color="primary"
          aria-owns={anchorEl ? 'add-new-menu' : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
          className={classes.button}
          data-qa-add-new-menu-button
        >
          Create {
            anchorEl
              ? <KeyboardArrowUp className={classes.caret}></KeyboardArrowUp>
              : <KeyboardArrowDown className={classes.caret}></KeyboardArrowDown>
          }
        </Button>
        <Menu
          id="add-new-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          getContentAnchorEl={undefined}
          PaperProps={{ square: true }}
          anchorOrigin={{ vertical: 45, horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          className={classes.menu}
        >
          {this.items.map((i, idx) =>
            <AddNewMenuItem
              key={idx}
              index={idx}
              count={itemsLen}
              {...i}
            />)}
        </Menu>
      </div>

    );
  }
}

export const styledComponent = styled(AddNewMenu);

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  { openForCreating },
  dispatch,
);

const connected = connect(undefined, mapDispatchToProps);

export default compose(
  connected,
  withRouter,
  styled,
)(AddNewMenu);
