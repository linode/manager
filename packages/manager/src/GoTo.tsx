import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import MUIDialog from 'src/components/core/Dialog';
import { useHistory } from 'react-router-dom';
import useFlags from './hooks/useFlags';
import { isFeatureEnabled } from './utilities/accountCapabilities';
import useAccountManagement from './hooks/useAccountManagement';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    position: 'absolute',
    top: '10%',
    overflow: 'visible',
    '& .react-select__menu-list': {
      padding: 0,
      overflowX: 'auto',
      maxHeight: '100% !important'
    },
    '& .react-select__control': {
      backgroundColor: 'transparent'
    },
    '& .react-select__value-container': {
      overflow: 'auto',
      '& p': {
        fontSize: '1rem',
        overflow: 'visible'
      }
    },
    '& .react-select__indicators': {
      display: 'none'
    },
    '& .react-select__menu': {
      marginTop: 12,
      boxShadow: `0 0 10px ${theme.color.boxShadowDark}`,
      maxWidth: '100% !important',
      border: 0,
      borderRadius: 4
    },
    '& .react-select__option': {
      ...theme.applyLinkStyles,
      padding: `8px, 8px, 8px, 12px`
    },
    '& .react-select__option--is-focused': {
      backgroundColor: theme.palette.primary.main,
      color: 'white'
    },
    '& .MuiInput-root': {
      boxShadow: `0 0 10px ${theme.color.boxShadowDark}`,
      border: 0
    }
  },
  input: {
    width: '100%'
  }
}));

interface Props {
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props;

const GoTo: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const routerHistory = useHistory();
  const flags = useFlags();
  const {
    _isManagedAccount,
    _hasAccountAccess,
    account
  } = useAccountManagement();

  const showFirewalls = isFeatureEnabled(
    'Cloud Firewall',
    Boolean(flags.firewalls),
    account?.data?.capabilities ?? []
  );

  const onSelect = (item: Item<string>) => {
    routerHistory.push(item.value);
    props.onClose();
  };

  const links = React.useMemo(
    () => [
      {
        display: 'Linodes',
        href: '/linodes',
        activeLinks: ['/linodes', '/linodes/create']
      },
      {
        display: 'Volumes',
        href: '/volumes'
      },
      {
        display: 'Object Storage',
        href: '/object-storage/buckets',
        activeLinks: ['/object-storage/buckets', '/object-storage/access-keys']
      },
      {
        display: 'NodeBalancers',
        href: '/nodebalancers'
      },
      {
        display: 'Domains',
        href: '/domains'
      },
      {
        hide: !showFirewalls,
        display: 'Firewalls',
        href: '/firewalls'
      },
      {
        display: 'Marketplace',
        href: '/linodes/create?type=One-Click'
      },
      {
        display: 'Longview',
        href: '/longview'
      },
      {
        display: 'Kubernetes',
        href: '/kubernetes/clusters'
      },
      {
        hide: !_isManagedAccount,
        display: 'Managed',
        href: '/managed'
      },
      {
        display: 'StackScripts',
        href: '/stackscripts'
      },
      {
        display: 'Images',
        href: '/images'
      },
      {
        display: 'Profile',
        href: '/profile/display'
      },
      {
        hide: account.lastUpdated === 0 || !_hasAccountAccess,
        display: 'Account',
        href: '/account/billing'
      }
    ],
    [showFirewalls, _hasAccountAccess, _isManagedAccount, account.lastUpdated]
  );

  const options: Item[] = React.useMemo(
    () =>
      links.map(thisLink => ({
        label: thisLink.display,
        value: thisLink.href
      })),
    [links]
  );

  const dialogClasses = React.useMemo(() => ({ paper: classes.paper }), [
    classes
  ]);

  return (
    <MUIDialog
      classes={dialogClasses}
      title="Go To..."
      open={props.open}
      onClose={props.onClose}
    >
      {/* I was about to put a "@todo" item for mobile display, but realized
      keyboard shortcuts are not realistic on mobile devices. So I think an
      absolute width here is fine. */}
      <div style={{ width: 400, maxHeight: 600 }}>
        <EnhancedSelect
          label="Go To"
          hideLabel
          // eslint-disable-next-line
          autoFocus
          blurInputOnSelect
          options={options}
          onChange={onSelect}
          placeholder="Go to..."
          openMenuOnFocus={false}
          openMenuOnClick={false}
          isClearable={false}
          isMulti={false}
          value={false}
          menuIsOpen={true}
        />
      </div>
    </MUIDialog>
  );
};

export default React.memo(GoTo);
