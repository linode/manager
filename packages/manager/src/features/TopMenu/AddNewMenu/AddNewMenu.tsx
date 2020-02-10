import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';
import { AccountCapability } from 'linode-js-sdk/lib/account';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import KubernetesIcon from 'src/assets/addnewmenu/kubernetes.svg';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodebalancerIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import OneClickIcon from 'src/assets/addnewmenu/oneclick.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import Button from 'src/components/Button';
import Menu from 'src/components/core/Menu';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { openForCreating as openDomainDrawerForCreating } from 'src/store/domainDrawer';
import { MapState } from 'src/store/types';
import { isKubernetesEnabled } from 'src/utilities/accountCapabilities';
import AddNewMenuItem, { MenuItems } from './AddNewMenuItem';

import { sendOneClickNavigationEvent } from 'src/utilities/ga';

type CSSClasses =
  | 'wrapper'
  | 'menu'
  | 'paper'
  | 'button'
  | 'caret'
  | 'mobileCreate'
  | 'mobileButton';

const styles = (theme: Theme) =>
  createStyles({
    wrapper: {
      order: 3,
      marginRight: theme.spacing(1),
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
      minHeight: `${theme.spacing(2) + 34}px`,
      paddingRight: `calc(${theme.spacing(3)}px + 24px)`,
      [theme.breakpoints.down('sm')]: {
        padding: '6px 34px 7px 11px'
      }
    },
    caret: {
      position: 'absolute',
      right: -30,
      top: -3,
      marginLeft: theme.spacing(1) / 2
    },
    mobileButton: {
      marginLeft: -theme.spacing(1)
    },
    mobileCreate: {
      width: 32,
      height: 32
    }
  });

interface Props {
  // openVolumeDrawerForCreating: typeof openVolumeDrawerForCreating;
  openDomainDrawerForCreating: typeof openDomainDrawerForCreating;
}

interface State {
  anchorEl?: HTMLElement;
}

type CombinedProps = Props &
  WithStyles<CSSClasses> &
  RouteComponentProps<{}> &
  DispatchProps &
  StateProps;

const styled = withStyles(styles);

class AddNewMenu extends React.Component<CombinedProps, State> {
  state = {
    anchorEl: undefined
  };

  getItems = () => {
    const items: MenuItems[] = [
      {
        title: 'Linode',
        onClick: e => {
          this.handleClose();
          e.preventDefault();
        },
        linkTo: '/linodes/create',
        body: `High performance SSD Linux servers for all of your infrastructure needs`,
        ItemIcon: LinodeIcon
      },
      {
        title: 'Volume',
        onClick: e => {
          // this.props.openVolumeDrawerForCreating('Created from Add New Menu');
          this.handleClose();
          e.preventDefault();
        },
        linkTo: '/volumes/create',
        body: `Block Storage service allows you to attach additional storage to your Linode`,
        ItemIcon: VolumeIcon
      },
      {
        title: 'NodeBalancer',
        onClick: e => {
          this.handleClose();
          e.preventDefault();
        },
        linkTo: '/nodebalancers/create',
        body: `Ensure your valuable applications and services are highly-available`,
        ItemIcon: NodebalancerIcon
      },
      {
        title: 'Domain',
        onClick: e => {
          this.props.openDomainDrawerForCreating('Created from Add New Menu');
          this.handleClose();
          e.preventDefault();
        },
        body: `Manage your DNS records using Linode’s high-availability name servers`,
        ItemIcon: DomainIcon
      },
      {
        title: 'One-Click App',
        onClick: e => {
          sendOneClickNavigationEvent('Add New Menu');
          this.handleClose();
          e.preventDefault();
        },
        linkTo: '/linodes/create?type=One-Click',
        body: 'Deploy blogs, game servers, and other web apps with ease.',
        ItemIcon: OneClickIcon,
        attr: { 'data-qa-one-click-add-new': true }
      }
    ];

    if (isKubernetesEnabled(this.props.accountCapabilities)) {
      items.push({
        title: 'Kubernetes',
        onClick: e => {
          this.handleClose();
          e.preventDefault();
        },
        linkTo: '/kubernetes/create',
        body: `Create and manage Kubernetes Clusters for highly available container workloads`,
        ItemIcon: KubernetesIcon
      });
    }

    return items;
  };

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  };

  render() {
    const { anchorEl } = this.state;
    const { classes } = this.props;

    const items = this.getItems();
    const itemsLen = items.length;

    return (
      <div className={classes.wrapper}>
        <Button
          buttonType="primary"
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
          anchorOrigin={{ vertical: 45, horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          className={classes.menu}
        >
          {items.map((i, idx) => (
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

interface StateProps {
  accountCapabilities: AccountCapability[];
}

const mapStateToProps: MapState<StateProps, CombinedProps> = (
  state,
  ownProps
) => {
  return {
    accountCapabilities: state?.__resources?.account?.data?.capabilities ?? []
  };
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ openDomainDrawerForCreating }, dispatch);

const connected = connect(mapStateToProps, mapDispatchToProps);

export default compose<CombinedProps, {}>(
  connected,
  withRouter,
  styled
)(AddNewMenu);
