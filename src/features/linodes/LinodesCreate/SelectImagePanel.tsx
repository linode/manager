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

import Grid from 'material-ui/Grid';

import TabbedPanel from 'src/components/TabbedPanel';
import ExpandPanel from 'src/components/ExpandPanel';
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
  selectedImageID: string | null;
  handleSelection: (event: React.MouseEvent<HTMLElement>, imageID: string) => void;
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
  const { images } = props;
  const publicImages = getPublicImages(images);
  const olderPublicImages = getOlderPublicImages(images);
  const myImages = getMyImages(images);

  return (
    <TabbedPanel
      header="Select Image Type"
      tabs={[
        {
          title: 'Public Images',
          render: () => (
            <React.Fragment>
              <Grid container>
                {publicImages.length
                && publicImages.map((image: Linode.Image, idx: number) => (
                  <SelectionCard
                    key={idx}
                    checked={image.id === String(props.selectedImageID)}
                    onClick={e => props.handleSelection(e, image.id)}
                    renderIcon={() => {
                      return <span className={`fl-${distroIcons[(image.vendor as string)]}`} />;
                    }}
                    heading={(image.vendor as string)}
                    subheadings={[image.label]}
                  />
                ))}
              </Grid>
              <ExpandPanel name="Show Older Images">
                <Grid container>
                  {olderPublicImages.length
                  && olderPublicImages.map((image: Linode.Image, idx: number) => (
                    <SelectionCard
                      key={idx}
                      checked={image.id === String(props.selectedImageID)}
                      onClick={e => props.handleSelection(e, image.id)}
                      renderIcon={() => {
                        return <span className={`fl-${distroIcons[(image.vendor as string)]}`} />;
                      }}
                      heading={(image.vendor as string)}
                      subheadings={[image.label]}
                    />
                  ))}
                </Grid>
              </ExpandPanel>
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
                  onClick={e => props.handleSelection(e, image.id)}
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
