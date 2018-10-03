import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { bindActionCreators, compose } from 'redux';

import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import AddCircle from '@material-ui/icons/AddCircle';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';

import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodebalancerIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';

import DomainCreateDrawer from 'src/features/Domains/DomainCreateDrawer';
import { openForCreating } from 'src/store/reducers/volumeDrawer';
import AddNewMenuItem, { MenuItem } from './AddNewMenuItem';

type CSSClasses = 'wrapper'
  | 'menu'
  | 'button'
  | 'caret'
  | 'mobileCreate'
  | 'mobileButton';

const styles: StyleRulesCallback = (theme) => ({
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
  mobileButton: {
    marginLeft: -theme.spacing.unit,
  },
  mobileCreate: {
    width: 32,
    height: 32,
  },
});

interface Props {
  openForCreating: typeof openForCreating;
}

interface State {
  anchorEl?: HTMLElement;
  domainDrawerOpen: boolean;
}

type CombinedProps = Props & WithStyles<CSSClasses> & RouteComponentProps<{}>;

const styled = withStyles(styles, { withTheme: true });

class AddNewMenu extends React.Component<CombinedProps, State> {
  state = {
    anchorEl: undefined,
    domainDrawerOpen: false,
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
    {
      title: 'Domain',
      onClick: (e) => {
        this.openDomainDrawer();
        this.handleClose();
        e.preventDefault();
      },
      body: `Manage your DNS records using Linode’s high-availability name servers`,
      ItemIcon: DomainIcon,
    },
  ];

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  }

  openDomainDrawer = () => {
    this.setState({ domainDrawerOpen: true });
  }

  closeDomainDrawer = () => {
    this.setState({ domainDrawerOpen: false });
  }

  onDomainSuccess = (domain:Linode.Domain) => {
    const id = domain.id ? domain.id : '';
    this.props.history.push(`/domains/${id}`);
  }

  render() {
    const { anchorEl, domainDrawerOpen } = this.state;
    const { classes } = this.props;
    const itemsLen = this.items.length;

    return (
      <div className={classes.wrapper}>
        <Hidden xsDown>
          <Button
            variant="raised"
            color="primary"
            aria-owns={anchorEl ? 'add-new-menu' : undefined}
            aria-expanded={anchorEl ? true : undefined}
            aria-haspopup="true"
            onClick={this.handleClick}
            className={classes.button}
            data-qa-add-new-menu-button
          >
            Create {
              anchorEl
                ? <KeyboardArrowUp className={classes.caret} />
                : <KeyboardArrowDown className={classes.caret} />
            }
          </Button>
        </Hidden>
        <Hidden smUp>
          <IconButton
            aria-owns={anchorEl ? 'add-new-menu' : undefined}
            aria-expanded={anchorEl ? true : undefined}
            aria-haspopup="true"
            onClick={this.handleClick}
            className={classes.mobileButton}
            data-qa-add-new-menu-button
          >
            <AddCircle className={classes.mobileCreate} />
          </IconButton>
        </Hidden>
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
        <DomainCreateDrawer
          open={domainDrawerOpen}
          onClose={this.closeDomainDrawer}
          onSuccess={this.onDomainSuccess}
          mode="create"
        />
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
