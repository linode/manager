import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { bindActionCreators, compose } from 'redux';
import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import KubernetesIcon from 'src/assets/addnewmenu/kubernetes.svg';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodebalancerIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import Button from 'src/components/Button';
import Menu from 'src/components/core/Menu';
import MenuItem from 'src/components/core/MenuItem';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { openForCreating as openDomainDrawerForCreating } from 'src/store/domainDrawer';
import { openForCreating as openVolumeDrawerForCreating } from 'src/store/volumeDrawer';
import AddNewMenuItem, { MenuItems } from './AddNewMenuItem';

type CSSClasses =
  | 'wrapper'
  | 'menu'
  | 'paper'
  | 'button'
  | 'caret'
  | 'mobileCreate'
  | 'mobileButton'
  | 'hidden';

const styles: StyleRulesCallback = theme => ({
  wrapper: {
    [theme.breakpoints.down('sm')]: {
      flex: 1
    }
  },
  menu: {
    [theme.breakpoints.up('md')]: {
      marginTop: 20
    }
  },
  paper: {
    maxWidth: 450,
    position: 'absolute',
    boxShadow: `0 0 5px ${theme.color.boxShadow}`
  },
  button: {
    position: 'relative',
    minHeight: 40,
    paddingRight: `calc(${theme.spacing.unit * 3}px + 24px)`,
    [theme.breakpoints.down('sm')]: {
      padding: '6px 34px 7px 11px'
    }
  },
  caret: {
    position: 'absolute',
    right: -30,
    top: -3,
    marginLeft: theme.spacing.unit / 2
  },
  mobileButton: {
    marginLeft: -theme.spacing.unit
  },
  mobileCreate: {
    width: 32,
    height: 32
  },
  hidden: {
    height: 0,
    padding: 0
  }
});

interface Props {
  openVolumeDrawerForCreating: typeof openVolumeDrawerForCreating;
}

interface State {
  anchorEl?: HTMLElement;
}

type CombinedProps = Props &
  WithStyles<CSSClasses> &
  RouteComponentProps<{}> &
  DispatchProps;

const styled = withStyles(styles);

class AddNewMenu extends React.Component<CombinedProps, State> {
  state = {
    anchorEl: undefined
  };

  items: MenuItems[] = [
    {
      title: 'Linode',
      onClick: e => {
        this.props.history.push('/linodes/create');
        this.handleClose();
        e.preventDefault();
      },
      body: `High performance SSD Linux servers for all of your infrastructure needs`,
      ItemIcon: LinodeIcon
    },
    {
      title: 'Volume',
      onClick: e => {
        this.props.openVolumeDrawerForCreating();
        this.handleClose();
        e.preventDefault();
      },
      body: `Block Storage service allows you to attach additional storage to your Linode`,
      ItemIcon: VolumeIcon
    },
    {
      title: 'NodeBalancer',
      onClick: e => {
        this.props.history.push('/nodebalancers/create');
        this.handleClose();
        e.preventDefault();
      },
      body: `Ensure your valuable applications and services are highly-available`,
      ItemIcon: NodebalancerIcon
    },
    {
      title: 'Domain',
      onClick: e => {
        this.props.openDomainDrawerForCreating();
        this.handleClose();
        e.preventDefault();
      },
      body: `Manage your DNS records using Linode’s high-availability name servers`,
      ItemIcon: DomainIcon
    },
    {
      title: 'Kubernetes',
      onClick: e => {
        this.props.history.push('/kubernetes/create');
        this.handleClose();
        e.preventDefault();
      },
      body: `Create and manage Kubernetes Clusters for highly available container workloads`,
      ItemIcon: KubernetesIcon
    }
  ];

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  };

  render() {
    const { anchorEl } = this.state;
    const { classes } = this.props;
    const itemsLen = this.items.length;

    return (
      <div className={classes.wrapper}>
        <Button
          type="primary"
          onClick={this.handleClick}
          className={classes.button}
          data-qa-add-new-menu-button
          aria-label="Linode Create"
        >
          Create{' '}
          {anchorEl ? (
            <KeyboardArrowUp className={classes.caret} />
          ) : (
            <KeyboardArrowDown className={classes.caret} />
          )}
        </Button>
        <Menu
          id="add-new-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          getContentAnchorEl={undefined}
          PaperProps={{ square: true, className: classes.paper }}
          anchorOrigin={{ vertical: 45, horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          className={classes.menu}
        >
          <MenuItem key="placeholder" aria-hidden className={classes.hidden} />
          {this.items.map((i, idx) => (
            <AddNewMenuItem key={idx} index={idx} count={itemsLen} {...i} />
          ))}
        </Menu>
      </div>
    );
  }
}

export const styledComponent = styled(AddNewMenu);

interface DispatchProps {
  openDomainDrawerForCreating: () => void;
  openVolumeDrawerForCreating: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    { openDomainDrawerForCreating, openVolumeDrawerForCreating },
    dispatch
  );

const connected = connect(
  undefined,
  mapDispatchToProps
);

export default compose(
  connected,
  withRouter,
  styled
)(AddNewMenu);
