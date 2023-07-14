import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import MUIDialog from 'src/components/core/Dialog';

import useAccountManagement from './hooks/useAccountManagement';
import useFlags from './hooks/useFlags';

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    width: '100%',
  },
  paper: {
    '& .MuiInput-root': {
      border: 0,
      boxShadow: `0 0 10px ${theme.color.boxShadowDark}`,
    },
    '& .react-select__control': {
      backgroundColor: 'transparent',
    },
    '& .react-select__indicators': {
      display: 'none',
    },
    '& .react-select__menu': {
      border: 0,
      borderRadius: 4,
      boxShadow: `0 0 10px ${theme.color.boxShadowDark}`,
      marginTop: 12,
      maxWidth: '100% !important',
    },
    '& .react-select__menu-list': {
      maxHeight: '100% !important',
      overflowX: 'auto',
      padding: 0,
    },
    '& .react-select__option--is-focused': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
    '& .react-select__value-container': {
      '& p': {
        fontSize: '1rem',
        overflow: 'visible',
      },
      overflow: 'auto',
    },
    overflow: 'visible',
    position: 'absolute',
    top: '10%',
  },
}));

interface Props {
  onClose: () => void;
  open: boolean;
}

type CombinedProps = Props;

const GoTo: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const routerHistory = useHistory();
  const { _hasAccountAccess, _isManagedAccount } = useAccountManagement();
  const flags = useFlags();

  const onSelect = (item: Item<string>) => {
    routerHistory.push(item.value);
    props.onClose();
  };

  const links = React.useMemo(
    () => [
      {
        display: 'Managed',
        hide: !_isManagedAccount,
        href: '/managed',
      },
      {
        activeLinks: ['/linodes', '/linodes/create'],
        display: 'Linodes',
        href: '/linodes',
      },
      {
        display: 'Volumes',
        href: '/volumes',
      },
      {
        display: 'Load Balancers',
        hide: !flags.aglb,
        href: '/loadbalancers',
      },
      {
        display: 'NodeBalancers',
        href: '/nodebalancers',
      },
      {
        display: 'Firewalls',
        href: '/firewalls',
      },

      {
        display: 'StackScripts',
        href: '/stackscripts',
      },
      {
        display: 'Images',
        href: '/images',
      },
      {
        display: 'Domains',
        href: '/domains',
      },
      {
        display: 'Kubernetes',
        href: '/kubernetes/clusters',
      },
      {
        activeLinks: ['/object-storage/buckets', '/object-storage/access-keys'],
        display: 'Object Storage',
        href: '/object-storage/buckets',
      },
      {
        display: 'Longview',
        href: '/longview',
      },

      {
        display: 'Marketplace',
        href: '/linodes/create?type=One-Click',
      },
      {
        display: 'Account',
        hide: !_hasAccountAccess,
        href: '/account/billing',
      },
      {
        display: 'Help & Support',
        href: '/support',
      },
      {
        display: 'Profile',
        href: '/profile/display',
      },
    ],
    [_hasAccountAccess, _isManagedAccount]
  );

  const options: Item[] = React.useMemo(
    () =>
      links
        .filter((thisLink) => !thisLink.hide)
        .map((thisLink) => ({
          label: thisLink.display,
          value: thisLink.href,
        })),
    [links]
  );

  const dialogClasses = React.useMemo(() => ({ paper: classes.paper }), [
    classes,
  ]);

  return (
    <MUIDialog
      classes={dialogClasses}
      onClose={props.onClose}
      open={props.open}
      title="Go To..."
    >
      {/* I was about to put a "@todo" item for mobile display, but realized
      keyboard shortcuts are not realistic on mobile devices. So I think an
      absolute width here is fine. */}
      <div style={{ maxHeight: 600, width: 400 }}>
        <EnhancedSelect
          // eslint-disable-next-line
          autoFocus
          blurInputOnSelect
          hideLabel
          isClearable={false}
          isMulti={false}
          label="Go To"
          menuIsOpen={true}
          onChange={onSelect}
          openMenuOnClick={false}
          openMenuOnFocus={false}
          options={options}
          placeholder="Go to..."
        />
      </div>
    </MUIDialog>
  );
};

export default React.memo(GoTo);
