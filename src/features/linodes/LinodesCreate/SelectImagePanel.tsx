import * as React from 'react';
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
  values,
} from 'ramda';

import Grid from 'src/components/Grid';

import TabbedPanel from 'src/components/TabbedPanel';
import ShowMoreExpansion from 'src/components/ShowMoreExpansion';
import SelectionCard from 'src/components/SelectionCard';

const distroIcons = {
  Arch: 'archlinux',
  CentOS: 'centos',
  CoreOS: 'coreos',
  Debian: 'debian',
  Fedora: 'fedora',
  Gentoo: 'gentoo',
  openSUSE: 'opensuse',
  Slackware: 'slackware',
  Ubuntu: 'ubuntu',
};

interface Props {
  images: Linode.Image[];
  error?: string;
  selectedImageID: string | null;
  handleSelection: (key: string) =>
    (event: React.SyntheticEvent<HTMLElement>, value: string) => void;
}

const sortByVendor = sortBy(prop('vendor'));

const sortCreatedDESC = compose(
  reverse,
  sortBy(
    compose(
      created => moment(created).format('x'),
      prop('created'),
    ),
  ),
);

const groupByVendor = groupBy(prop('vendor'));

export const getPublicImages = compose<any, any, any, any, any, any, any>(
  sortByVendor,
  values,
  map(head),
  groupByVendor,
  sortCreatedDESC,
  filter(propSatisfies(startsWith('linode'), 'id')),
);

export const getOlderPublicImages = compose<any, any, any, any, any, any>(
  sortByVendor,
  compose(flatten, values, map(tail)),
  groupByVendor,
  sortCreatedDESC,
  filter(propSatisfies(startsWith('linode'), 'id')),
);

export const getMyImages = compose<any, any, any>(
  sortCreatedDESC,
  filter(propSatisfies(startsWith('private'), 'id')),
);

const CreateFromImage: React.StatelessComponent<Props> = (props) => {
  const { images, error } = props;
  const publicImages = getPublicImages(images);
  const olderPublicImages = getOlderPublicImages(images);
  const myImages = getMyImages(images);
  const handleSelection = props.handleSelection('selectedImageID');

  return (
    <TabbedPanel
      error={error}
      header="Select Image Type"
      tabs={[
        {
          title: 'Public Images',
          render: () => (
            <React.Fragment>
              <Grid container spacing={8}>
                {publicImages.length
                && publicImages.map((image: Linode.Image, idx: number) => (
                  <SelectionCard
                    key={idx}
                    checked={image.id === String(props.selectedImageID)}
                    onClick={e => handleSelection(e, image.id)}
                    renderIcon={() => {
                      return <span className={`fl-${distroIcons[(image.vendor as string)]}`} />;
                    }}
                    heading={(image.vendor as string)}
                    subheadings={[image.label]}
                  />
                ))}
              </Grid>
              <ShowMoreExpansion name="Show Older Images">
                <Grid container spacing={8} style={{ marginTop: 16 }}>
                  {olderPublicImages.length
                  && olderPublicImages.map((image: Linode.Image, idx: number) => (
                    <SelectionCard
                      key={idx}
                      checked={image.id === String(props.selectedImageID)}
                      onClick={e => handleSelection(e, image.id)}
                      renderIcon={() => {
                        return <span className={`fl-${distroIcons[(image.vendor as string)]}`} />;
                      }}
                      heading={(image.vendor as string)}
                      subheadings={[image.label]}
                    />
                  ))}
                </Grid>
              </ShowMoreExpansion>
            </React.Fragment>
          ),
        },
        {
          title: 'My Images',
          render: () => (
            <Grid container>
              { myImages && myImages.map((image: Linode.Image, idx: number) => (
                <SelectionCard
                  key={idx}
                  checked={image.id === String(props.selectedImageID)}
                  onClick={e => handleSelection(e, image.id)}
                  renderIcon={() => <span className="fl-tux" /> }
                  heading={(image.label as string)}
                  subheadings={[(image.description as string)]}
                />
              )) }
            </Grid>
          ),
        },
      ]}
    >
    </TabbedPanel>
  );
};

export default CreateFromImage;
