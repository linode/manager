import * as moment from 'moment';
import {
  compose,
  filter,
  flatten,
  groupBy,
  head,
  map,
  prop,
  propSatisfies,
  reverse,
  sortBy,
  startsWith,
  tail,
  values
} from 'ramda';
import * as React from 'react';
import RenderGuard from 'src/components/RenderGuard';
import TabbedPanel from 'src/components/TabbedPanel';

import Panel from './Panel';
import PrivateImages from './PrivateImages';
import PublicImages from './PublicImages';

interface Props {
  images: Linode.Image[];
  title?: string;
  error?: string;
  selectedImageID?: string;
  handleSelection: (id: string) => void;
  variant?: 'public' | 'private' | 'all';
  initTab?: number;
  disabled?: boolean;
}

const sortByVendor = sortBy(prop('vendor'));

const sortCreatedDESC = compose<any, any, any>(
  reverse,
  sortBy(
    compose(
      created => moment(created).format('x'),
      prop('created')
    )
  )
);

const groupByVendor = groupBy(prop('vendor'));

export const getPublicImages = compose<any, any, any, any, any, any, any>(
  sortByVendor,
  values,
  map(head),
  groupByVendor,
  sortCreatedDESC,
  filter(propSatisfies(startsWith('linode'), 'id'))
);

export const getOlderPublicImages = compose<any, any, any, any, any, any>(
  sortByVendor,
  compose(
    flatten,
    values,
    map(tail)
  ),
  groupByVendor,
  sortCreatedDESC,
  filter(propSatisfies(startsWith('linode'), 'id'))
);

export const getMyImages = compose<any, any, any>(
  sortCreatedDESC,
  filter(propSatisfies(startsWith('private'), 'id'))
);

type CombinedProps = Props;

const CreateFromImage: React.StatelessComponent<CombinedProps> = props => {
  const { images, error, handleSelection, disabled, title, variant, selectedImageID } = props;
  const publicImages = getPublicImages(images);
  const olderPublicImages = getOlderPublicImages(images);
  const myImages = getMyImages(images);

  const Public = (
    <Panel error={error} title={title}>
      <PublicImages images={publicImages} oldImages={olderPublicImages} disabled={disabled} handleSelection={handleSelection} selectedImageID={selectedImageID} />
    </Panel>
  )

  const Private = (
    <Panel error={error} title={title}>
      <PrivateImages images={myImages} disabled={disabled} handleSelection={handleSelection} selectedImageID={selectedImageID} />
    </Panel>
  )

  const tabs = [
    {
      title: 'Public Images',
      render: () => (
        Public
      )
    },
    {
      title: 'My Images',
      render: () => (
        Private
      )
    }
  ];

  switch (variant) {
    case 'private':
      return Private;
    case 'public':
      return Public;
    case 'all':
    default:
      return (
        <TabbedPanel
          error={error}
          header="Select Image"
          tabs={tabs}
          initTab={props.initTab}
        />
      )
  }
};

export default (RenderGuard<Props>(CreateFromImage));
