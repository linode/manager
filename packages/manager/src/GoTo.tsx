import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import MUIDialog, {
  DialogProps as _DialogProps
} from 'src/components/core/Dialog';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    position: 'absolute',
    top: '10%',
    overflow: 'visible'
  },
  input: {
    width: '100%'
  }
}));

export const selectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: '#f4f4f4',
    margin: 0,
    width: '100%',
    height: 460,
    border: 0
  }),
  // container: (base: any) => ({ height: 460 }),
  input: (base: any) => ({
    ...base,
    margin: 0,
    width: '100%',
    border: 0
  }),
  selectContainer: (base: any) => ({
    ...base,
    width: '100%',
    margin: 0,
    border: 0
  }),
  dropdownIndicator: () => ({ display: 'none' }),
  placeholder: (base: any) => ({ ...base, color: 'blue' }),
  menu: (base: any) => ({
    ...base,
    maxWidth: '100% !important'
  }),
  menuList: (base: any) => ({
    ...base,
    maxHeight: '100% !important'
  })
};

interface Props {
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props;

const links = [
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
    // hide: !showFirewalls,
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
    // hide: !_isManagedAccount,
    display: 'Managed',
    href: '/managed'
  },
  {
    display: 'StackScripts',
    href: '/stackscripts?type=account'
  },
  {
    display: 'Images',
    href: '/images'
  },
  {
    // hide: account.lastUpdated === 0 || !_hasAccountAccess,
    display: 'Account',
    href: '/account/billing'
  }
];

const GoTo: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const routerHistory = useHistory();

  const onSelect = (item: Item<string>) => {
    routerHistory.push(item.value);
    props.onClose();
  };

  const options: Item[] = links.map(thisLink => ({
    label: thisLink.display,
    value: thisLink.href
  }));

  return (
    <MUIDialog
      classes={{ paper: classes.paper }}
      title="Go To..."
      open={props.open}
      onClose={props.onClose}
    >
      <div style={{ width: 400, maxHeight: 600 }}>
        <EnhancedSelect
          label="Main search"
          hideLabel
          // eslint-disable-next-line
          autoFocus
          blurInputOnSelect
          options={options}
          onChange={onSelect}
          placeholder="Go to..."
          styles={selectStyles}
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

export default GoTo;
