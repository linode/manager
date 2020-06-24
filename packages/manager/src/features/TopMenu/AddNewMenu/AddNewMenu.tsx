import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import { AccountCapability } from '@linode/api-v4/lib/account';

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuLink,
  MenuPopover
} from '@reach/menu-button';
import '@reach/menu-button/styles.css';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import KubernetesIcon from 'src/assets/addnewmenu/kubernetes.svg';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodebalancerIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import OneClickIcon from 'src/assets/addnewmenu/oneclick.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { openForCreating as openDomainDrawerForCreating } from 'src/store/domainDrawer';
import { MapState } from 'src/store/types';
import AddNewMenuItem from './AddNewMenuItem';

import { sendOneClickNavigationEvent } from 'src/utilities/ga';

type CSSClasses =
  | 'wrapper'
  | 'button'
  | 'caret'
  | 'menuItemLink'
  | 'menuItemList'
  | 'menuPopover';

const styles = (theme: Theme) =>
  createStyles({
    wrapper: {
      position: 'relative',
      order: 3,
      marginRight: theme.spacing(1),
      [theme.breakpoints.down('sm')]: {
        flex: 1
      }
    },
    button: {
      '&[data-reach-menu-button]': {
        textTransform: 'inherit',
        borderRadius: 0,
        fontSize: '1rem',
        lineHeight: 1,
        fontFamily: theme.spacing() === 4 ? theme.font.normal : theme.font.bold,
        backgroundColor: theme.palette.primary.main,
        color: '#fff',
        padding: `${theme.spacing() * 2}px ${theme.spacing() * 3 +
          theme.spacing() / 2}px ${theme.spacing() * 2}px`,
        maxHeight: 48,
        position: 'relative',
        minHeight: `${theme.spacing(2) + 34}px`,
        paddingRight: `calc(${theme.spacing(3)}px + 24px)`,
        cursor: 'pointer',
        border: 'none',
        [theme.breakpoints.down('sm')]: {
          padding: '6px 34px 7px 11px',
          maxHeight: 50,
          minWidth: 105
        },
        '&:hover': {
          backgroundColor: theme.palette.primary.light
        },
        '&:focus': {
          backgroundColor: theme.palette.primary.light
        },
        '&[aria-expanded="true"]': {
          backgroundColor: theme.palette.primary.light,
          '& $caret': {
            transform: 'rotate(180deg)'
          }
        }
      }
    },
    caret: {
      position: 'absolute',
      right: theme.spacing(2) + 2,
      top: theme.spacing(1) + 5,
      [theme.breakpoints.down('sm')]: {
        right: 5
      }
    },
    menuItemLink: {
      '&[data-reach-menu-item]': {
        padding: 0,
        cursor: 'pointer'
      },
      '&[data-reach-menu-item][data-selected]': {
        background: theme.bg.main,
        '& svg': {
          ...theme.addCircleHoverEffect,
          backgroundColor: theme.bg.main,
          color: theme.palette.text.primary
        }
      }
    },
    menuItemList: {
      '&[data-reach-menu-items]': {
        zIndex: 3000,
        padding: 0,
        border: 'none',
        whiteSpace: 'normal',
        boxShadow: `0 0 5px ${theme.color.boxShadow}`,
        backgroundColor: theme.bg.white
      }
    },
    menuPopover: {
      '&[data-reach-menu], &[data-reach-menu-popover]': {
        width: 350,
        [theme.breakpoints.up('md')]: {
          right: 0
        }
      }
    }
  });

interface Props {
  // openVolumeDrawerForCreating: typeof openVolumeDrawerForCreating;
  openDomainDrawerForCreating: typeof openDomainDrawerForCreating;
}

type CombinedProps = Props &
  WithStyles<CSSClasses> &
  RouteComponentProps<{}> &
  DispatchProps &
  StateProps;

const styled = withStyles(styles);

class AddNewMenu extends React.Component<CombinedProps> {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.wrapper}>
        <Menu>
          <MenuButton className={classes.button} data-qa-add-new-menu-button>
            Create
            <KeyboardArrowDown className={classes.caret} />
          </MenuButton>
          <MenuPopover className={classes.menuPopover} portal={false}>
            <MenuItems className={classes.menuItemList}>
              <MenuLink
                as={Link}
                to="/linodes/create"
                className={classes.menuItemLink}
              >
                <AddNewMenuItem
                  title="Linode"
                  body="High performance SSD Linux servers for all of your infrastructure needs"
                  ItemIcon={LinodeIcon}
                />
              </MenuLink>
              <MenuLink
                as={Link}
                to="/volumes/create"
                className={classes.menuItemLink}
              >
                <AddNewMenuItem
                  title="Volume"
                  body="Block Storage service allows you to attach additional storage to your Linode"
                  ItemIcon={VolumeIcon}
                />
              </MenuLink>
              <MenuLink
                as={Link}
                to="/nodebalancers/create"
                className={classes.menuItemLink}
              >
                <AddNewMenuItem
                  title="NodeBalancer"
                  body="Ensure your valuable applications and services are highly-available"
                  ItemIcon={NodebalancerIcon}
                />
              </MenuLink>
              <MenuItem
                onSelect={() => {
                  this.props.openDomainDrawerForCreating(
                    'Created from Add New Menu'
                  );
                }}
                className={classes.menuItemLink}
              >
                <AddNewMenuItem
                  title="Domain"
                  body="Manage your DNS records using Linode’s high-availability name servers"
                  ItemIcon={DomainIcon}
                />
              </MenuItem>
              <MenuLink
                as={Link}
                to="/linodes/create?type=One-Click"
                onClick={() => {
                  sendOneClickNavigationEvent('Add New Menu');
                }}
                className={classes.menuItemLink}
              >
                <AddNewMenuItem
                  title="Marketplace"
                  body="Deploy blogs, game servers, and other web apps with ease."
                  ItemIcon={OneClickIcon}
                  attr={{ 'data-qa-one-click-add-new': true }}
                />
              </MenuLink>
              <MenuLink
                as={Link}
                to="/kubernetes/create"
                className={classes.menuItemLink}
              >
                <AddNewMenuItem
                  title="Kubernetes"
                  body="Create and manage Kubernetes Clusters for highly available container workloads"
                  ItemIcon={KubernetesIcon}
                />
              </MenuLink>
            </MenuItems>
          </MenuPopover>
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

const mapStateToProps: MapState<StateProps, CombinedProps> = state => {
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
