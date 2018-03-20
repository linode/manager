import * as React from 'react';

import * as moment from 'moment';
import { flatten, tail, groupBy } from 'ramda';

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

const CreateFromImage: React.StatelessComponent<Props> = (props) => {
  const { images } = props;

  const publicImages = images.filter(
    (image: Linode.Image) => image.id.startsWith('linode'));
  const publicImagesByVendor = groupBy<Linode.Image>(
    image => (image.vendor as string))(publicImages);
  const firstImagesByVendor = Object.keys(publicImagesByVendor).map(vendor => (
    (publicImagesByVendor[vendor] as Linode.Image[]).sort(
      (imageA, imageB) => {
        return (moment(imageB.created).diff(moment(imageA.created)));
      })[0]));
  const sortedFirstImagesByVendor = (firstImagesByVendor as Linode.Image[]).sort(
    (imageA, imageB) => {
      return Number(
        (imageA.vendor as string).toLowerCase() > (imageB.vendor as string).toLowerCase());
    });

  const restImagesByVendor = flatten<Linode.Image>(
    Object.keys(publicImagesByVendor).map(vendor => tail(
      (publicImagesByVendor[vendor] as Linode.Image[]).sort(
        (imageA, imageB) => {
          return (moment(imageB.created).diff(moment(imageA.created)));
        }))));
  const sortedRestImagesByVendor = (restImagesByVendor as Linode.Image[]).sort(
    (imageA, imageB) => {
      return Number(
        (imageA.vendor as string).toLowerCase() > (imageB.vendor as string).toLowerCase());
    });

  const privateImages = images.filter((image: Linode.Image) => image.id.startsWith('private'));

  return (
    <TabbedPanel
      header="Select Image Type"
      tabs={[
        {
          title: 'Public Images',
          render: () => (
            <React.Fragment>
              <Grid container>
                {sortedFirstImagesByVendor.length
                && sortedFirstImagesByVendor.map((image: Linode.Image, idx) => (
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
                  {sortedRestImagesByVendor.length
                  && sortedRestImagesByVendor.map((image: Linode.Image, idx) => (
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
              {privateImages.length && privateImages.map((image: Linode.Image, idx) => (
                <SelectionCard
                  key={idx}
                  checked={image.id === String(props.selectedImageID)}
                  onClick={e => props.handleSelection(e, image.id)}
                  renderIcon={() => {
                    return <span className="fl-tux" />;
                  }}
                  heading={(image.label as string)}
                  subheadings={[(image.description as string)]}
                />
              ))}
            </Grid>
          ),
        },
      ]}
    >
    </TabbedPanel>
  );
};

export default CreateFromImage;
