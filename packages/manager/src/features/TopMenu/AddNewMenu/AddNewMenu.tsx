import { AccountCapability } from '@linode/api-v4/lib/account';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuLink,
  MenuPopover,
} from '@reach/menu-button';
import '@reach/menu-button/styles.css';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import BucketIcon from 'src/assets/icons/entityIcons/bucket.svg';
import DomainIcon from 'src/assets/icons/entityIcons/domain.svg';
import FirewallIcon from 'src/assets/icons/entityIcons/firewall.svg';
import KubernetesIcon from 'src/assets/icons/entityIcons/kubernetes.svg';
import LinodeIcon from 'src/assets/icons/entityIcons/linode.svg';
import NodebalancerIcon from 'src/assets/icons/entityIcons/nodebalancer.svg';
import OneClickIcon from 'src/assets/icons/entityIcons/oneclick.svg';
import VolumeIcon from 'src/assets/icons/entityIcons/volume.svg';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import withFeatureFlags, {
  FeatureFlagConsumerProps,
} from 'src/containers/withFeatureFlagConsumer.container';
import { dbaasContext } from 'src/context';
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
      marginRight: theme.spacing(1),
      [theme.breakpoints.down('sm')]: {
        flex: 1,
      },
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      '&[data-reach-menu-button]': {
        textTransform: 'inherit',
        borderRadius: 1,
        fontSize: '1rem',
        lineHeight: 1,
        fontFamily: theme.spacing() === 4 ? theme.font.normal : theme.font.bold,
        backgroundColor: theme.palette.primary.main,
        color: '#fff',
        padding: `2px 20px`,
        paddingRight: 12,
        maxHeight: 34,
        position: 'relative',
        minHeight: `34px`,
        cursor: 'pointer',
        border: 'none',
        [theme.breakpoints.down('sm')]: {
          maxHeight: 34,
          minWidth: 100,
        },
        '&:hover, &:focus': {
          backgroundColor: '#226dc3',
        },
        '&[aria-expanded="true"]': {
          backgroundColor: theme.palette.primary.light,
          '& $caret': {
            marginTop: 4,
            transform: 'rotate(180deg)',
          },
        },
      },
    },
    caret: {
      marginTop: 2,
      marginLeft: 4,
    },
    menuItemLink: {
      '&[data-reach-menu-item]': {
        padding: 0,
        cursor: 'pointer',
        textDecoration: 'none',
        '& h3': {
          color: theme.cmrTextColors.linkActiveLight,
        },
        '&:hover': {
          '& h3': {
            color: theme.palette.primary.main,
            textDecoration: 'underline',
          },
        },
      },
      '&[data-reach-menu-item][data-selected]': {
        background: theme.bg.main,
        '& svg': {
          ...theme.addCircleHoverEffect,
          backgroundColor: theme.bg.main,
          color: theme.palette.text.primary,
        },
      },
      '& svg': {
        width: 20,
        height: 20,
      },
    },
    menuItemList: {
      '&[data-reach-menu-items]': {
        zIndex: 3000,
        padding: 0,
        border: 'none',
        whiteSpace: 'normal',
        boxShadow: `0 0 5px ${theme.color.boxShadow}`,
        backgroundColor: theme.bg.white,
      },
    },
    menuPopover: {
      '&[data-reach-menu], &[data-reach-menu-popover]': {
        width: 350,
        left: theme.spacing(),
        [theme.breakpoints.up('md')]: {
          left: 0,
        },
      },
    },
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

    const showFirewalls = isFeatureEnabled(
      'Cloud Firewall',
      Boolean(flags.firewalls),
      accountCapabilities ?? []
    );

    return (
      <dbaasContext.Consumer>
        {(dbaas) => (
          <div className={classes.wrapper}>
            <Menu>
              <MenuButton
                className={classes.button}
                data-qa-add-new-menu-button
              >
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
                      body="High performance SSD Linux servers"
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
                      body="Attach additional storage to your Linode"
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
                      body="Ensure your services are highly available"
                      ItemIcon={NodebalancerIcon}
                    />
                  </MenuLink>
                  {showFirewalls ? (
                    <MenuLink
                      as={Link}
                      to="/firewalls/create"
                      className={classes.menuItemLink}
                    >
                      <AddNewMenuItem
                        title="Firewall"
                        body="Control network access to your Linodes"
                        ItemIcon={FirewallIcon}
                      />
                    </MenuLink>
                  ) : null}
                  <MenuLink
                    as={Link}
                    to="/domains/create"
                    className={classes.menuItemLink}
                  >
                    <AddNewMenuItem
                      title="Domain"
                      body="Manage your DNS records"
                      ItemIcon={DomainIcon}
                    />
                  </MenuLink>
                  <MenuLink
                    as={Link}
                    to="/kubernetes/create"
                    className={classes.menuItemLink}
                  >
                    <AddNewMenuItem
                      title="Kubernetes"
                      body="Highly available container workloads"
                      ItemIcon={KubernetesIcon}
                    />
                  </MenuLink>
                  <MenuLink
                    as={Link}
                    to="/object-storage/buckets/create"
                    className={classes.menuItemLink}
                  >
                    <AddNewMenuItem
                      title="Bucket"
                      body="S3-compatible object storage "
                      ItemIcon={BucketIcon} // to be replaced with database icon
                    />
                  </MenuLink>
                  <MenuLink
                    as={Link}
                    to="/linodes/create?type=One-Click"
                    className={classes.menuItemLink}
                  >
                    <AddNewMenuItem
                      title="Marketplace"
                      body="Deploy applications with ease"
                      ItemIcon={OneClickIcon}
                      attr={{ 'data-qa-one-click-add-new': true }}
                    />
                  </MenuLink>
                </MenuItems>
              </MenuPopover>
            </Menu>
          </div>
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

const mapStateToProps: MapState<StateProps, CombinedProps> = (state) => {
  return {
    accountCapabilities: state?.__resources?.account?.data?.capabilities ?? [],
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
