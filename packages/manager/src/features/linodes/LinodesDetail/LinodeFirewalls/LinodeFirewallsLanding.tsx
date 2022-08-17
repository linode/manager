import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import EntityTable from 'src/components/EntityTable';
import LandingHeader from 'src/components/LandingHeader';
import { useLinodeFirewalls } from 'src/queries/linodeFirewalls';
import LinodeFirewallRow from './LinodeFirewallsRow';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';
import FirewallIcon from 'src/assets/icons/entityIcons/firewall.svg';

interface Props {
  linodeId: number;
}

type CombinedProps = Props;

export const headers = [
  {
    label: 'Firewall',
    dataColumn: 'label',
    sortable: true,
    widthPercent: 50,
  },
  // {
  //   label: 'Status',
  //   dataColumn: 'status',
  //   sortable: true,
  //   widthPercent: 15,
  // },
  {
    label: 'Rules',
    dataColumn: 'rules',
    sortable: false,
    widthPercent: 50,
    hideOnMobile: true,
  },
  // {
  //   label: 'Linodes',
  //   dataColumn: 'devices',
  //   sortable: false,
  //   widthPercent: 25,
  //   hideOnMobile: true,
  // },
  // {
  //   label: 'Action Menu',
  //   visuallyHidden: true,
  //   dataColumn: '',
  //   sortable: false,
  //   widthPercent: 5,
  // },
];

const LinodeFirewallsLanding: React.FC<CombinedProps> = (props) => {
  const { linodeId } = props;

  const { data, isLoading, error, dataUpdatedAt } = useLinodeFirewalls(
    linodeId
  );

  const firewallArray = Object.values(data?.data ?? {});

  if (isLoading) {
    return <CircleProgress />;
  }

  // We'll fall back to showing a request error in the EntityTable
  if (firewallArray.length === 0 && !error) {
    return (
      <>
        <Placeholder title={'Firewalls'} icon={FirewallIcon} isEntity>
          <Typography variant="subtitle1">
            <div>Control network access to your servers.</div>
            <Link to="/firewalls">Get started with Firewalls.</Link>
          </Typography>
        </Placeholder>
      </>
    );
  }

  const firewallRow = {
    handlers: {},
    Component: LinodeFirewallRow,
    data: firewallArray,
    loading: isLoading,
    lastUpdated: dataUpdatedAt,
    error: error ?? undefined,
  };

  return (
    <React.Fragment>
      <LandingHeader
        title="Firewalls"
        entity="Firewall"
        breadcrumbProps={{ pathname: '/firewalls' }}
        // docsLink="https://linode.com/docs/platform/cloud-firewall/getting-started-with-cloud-firewall/"
      />
      <EntityTable
        entity="firewall"
        row={firewallRow}
        headers={headers}
        initialOrder={{ order: 'asc', orderBy: 'domain' }}
      />
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(React.memo)(
  LinodeFirewallsLanding
);
