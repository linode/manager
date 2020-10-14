import { Linode } from '@linode/api-v4/lib/linodes';
/* eslint-disable @typescript-eslint/no-empty-function */
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import LandingHeader from 'src/components/LandingHeader';
import NotFound from 'src/components/NotFound';
import LinodesLanding from 'src/features/linodes/LinodesLanding';
import useReduxLoad from 'src/hooks/useReduxLoad';
import useVlans from 'src/hooks/useVlans';
import VlanEntityDetail from './VlanEntityDetail';
type CombinedProps = RouteComponentProps<{ id: string }>;

const VlanDetail: React.FC<CombinedProps> = props => {
  const { vlans } = useVlans();
  useReduxLoad(['vlans']);

  // Source the VLAN's ID from the /:id path param.
  const thisVlanID = props.match.params.id;

  // Find the VLAN in the store.
  const thisVlan = vlans.itemsById[thisVlanID];

  if (vlans.error.read) {
    return (
      <ErrorState errorText="There was a problem retrieving your VLAN. Please try again." />
    );
  }

  if (vlans.lastUpdated === 0 && !thisVlan) {
    return <CircleProgress />;
  }

  if (!thisVlan) {
    return <NotFound />;
  }

  const thisVlanLinodeIDs = thisVlan.linodes.map(
    thisVLANLinode => thisVLANLinode.id
  );

  const linodeIDToVLANIP = thisVlan.linodes.reduce<Record<number, string>>(
    (acc, thisVLANLinode) => ({
      ...acc,
      [thisVLANLinode.id]: thisVLANLinode.ipv4_address
    }),
    {}
  );

  const filterLinodesFn = (linode: Linode) => {
    return thisVlanLinodeIDs.includes(linode.id);
  };

  // @todo: Rework the typing here once https://github.com/linode/manager/pull/6999 is merged.
  const extendLinodesFn = (linode: Linode): any => ({
    ...linode,
    _vlanIP: linodeIDToVLANIP[linode.id]
  });

  return (
    <React.Fragment>
      <VlanEntityDetail openTagDrawer={() => {}} />
      <div style={{ marginTop: 20 }}>
        <LinodesLanding
          isVLAN
          filterLinodesFn={filterLinodesFn}
          extendLinodesFn={extendLinodesFn}
          LandingHeader={
            <LandingHeader
              title="Linodes"
              entity="Linode"
              // @todo: This should open the Attach modal.
              onAddNew={() => null}
              displayIcon={false}
              createButtonText="Add a Linode..."
            />
          }
        />
      </div>
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(React.memo)(VlanDetail);
