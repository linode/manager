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
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
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
import withFeatureFlags, {
  FeatureFlagConsumerProps
} from 'src/containers/withFeatureFlagConsumer.container';
import { vlanContext, dbaasContext } from 'src/context';
import { MapState } from 'src/store/types';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import AddNewMenuItem from './AddNewMenuItem';

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
      order: 1,
      marginRight: theme.spacing(1),
      [theme.breakpoints.down('sm')]: {
        flex: 1
      }
    },
    button: {
      '&[data-reach-menu-button]': {
        textTransform: 'inherit',
        borderRadius: '3px',
        fontSize: '1rem',
        lineHeight: 1,
        fontFamily: theme.spacing() === 4 ? theme.font.normal : theme.font.bold,
        backgroundColor: theme.palette.primary.main,
        color: '#fff',
        padding: `2px 20px`,
        maxHeight: 34,
        position: 'relative',
        minHeight: `34px`,
        cursor: 'pointer',
        border: 'none',
        [theme.breakpoints.down('sm')]: {
          marginLeft: theme.spacing(),
          maxHeight: 34,
          minWidth: 100
        },
        '&:hover': {
          backgroundColor: theme.palette.primary.light
        },
        '&:focus': {
          backgroundColor: theme.palette.primary.light
        },
        '&[aria-expanded="true"]': {
          backgroundColor: theme.palette.primary.light
        }
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
        left: theme.spacing(),
        [theme.breakpoints.up('md')]: {
          left: 0
        }
      }
    }
  });

type CombinedProps = WithStyles<CSSClasses> &
  RouteComponentProps<{}> &
  DispatchProps &
  StateProps &
  FeatureFlagConsumerProps;

const styled = withStyles(styles);

class AddNewMenu extends React.Component<CombinedProps> {
  render() {
    const { accountCapabilities, classes, flags } = this.props;
    const showVlans = isFeatureEnabled(
      'Vlans',
      Boolean(flags.vlans),
      accountCapabilities ?? []
    );

    return (
      <dbaasContext.Consumer>
        {dbaas => (
          <vlanContext.Consumer>
            {vlan => (
              <div className={classes.wrapper}>
                <Menu>
                  <MenuButton
                    className={classes.button}
                    data-qa-add-new-menu-button
                  >
                    Create...
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
                      <MenuLink
                        as={Link}
                        to="/domains/create"
                        className={classes.menuItemLink}
                      >
                        <AddNewMenuItem
                          title="Domain"
                          body="Manage your DNS records using Linode’s high-availability name servers"
                          ItemIcon={DomainIcon}
                        />
                      </MenuLink>
                      <MenuLink
                        as={Link}
                        to="/linodes/create?type=One-Click"
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
                          title="Kubernetes Cluster"
                          body="Create and manage Kubernetes Clusters for highly available container workloads"
                          ItemIcon={KubernetesIcon}
                        />
                      </MenuLink>
                      <MenuItem
                        onSelect={vlan.open}
                        className={classes.menuItemLink}
                      >
                        {showVlans && (
                          <AddNewMenuItem
                            title="Virtual LAN"
                            body="Create private Local Area Networks (LANs) for secure communication between Linodes."
                            ItemIcon={LinodeIcon}
                          />
                        )}
                      </MenuItem>
                      {flags.databases && (
                        <MenuItem
                          onSelect={dbaas.open}
                          className={classes.menuItemLink}
                        >
                          <AddNewMenuItem
                            title="Database"
                            body="Create cloud-based MySQL databases."
                            ItemIcon={LinodeIcon} // to be replaced with database icon
                          />
                        </MenuItem>
                      )}
                    </MenuItems>
                  </MenuPopover>
                </Menu>
              </div>
            )}
          </vlanContext.Consumer>
        )}
      </dbaasContext.Consumer>
    );
  }
}

export const styledComponent = styled(AddNewMenu);

interface DispatchProps {
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

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, {}>(
  connected,
  withRouter,
  withFeatureFlags,
  styled
)(AddNewMenu);

export default enhanced;
