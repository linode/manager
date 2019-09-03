import { Image } from 'linode-js-sdk/lib/images';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import SelectionCard from 'src/components/SelectionCard';
import ShowMoreExpansion from 'src/components/ShowMoreExpansion';

type ClassNames = 'root' | 'flatImagePanelSelections';

const styles = (theme: Theme) =>
  createStyles({
    flatImagePanelSelections: {
      marginTop: theme.spacing(2),
      padding: `${theme.spacing(1)}px 0`
    },
    root: {}
  });
interface Props {
  images: Image[];
  oldImages: Image[];
  selectedImageID?: string;
  disabled?: boolean;
  handleSelection: (id: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const distroIcons = {
  Alpine: 'alpine',
  Arch: 'archlinux',
  CentOS: 'centos',
  CoreOS: 'coreos',
  Debian: 'debian',
  Fedora: 'fedora',
  Gentoo: 'gentoo',
  openSUSE: 'opensuse',
  Slackware: 'slackware',
  Ubuntu: 'ubuntu'
};

const PublicImages: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    disabled,
    images,
    handleSelection,
    oldImages,
    selectedImageID
  } = props;
  const renderImages = (imageList: Image[]) =>
    imageList.length &&
    imageList.map((image: Image, idx: number) => (
      <SelectionCard
        key={idx}
        checked={image.id === String(selectedImageID)}
        onClick={() => handleSelection(image.id)}
        renderIcon={() => {
          return (
            <span className={`fl-${distroIcons[image.vendor as string]}`} />
          );
        }}
        heading={image.vendor as string}
        subheadings={[image.label]}
        data-qa-selection-card
        disabled={disabled}
        variant="check"
      />
    ));

  return (
    <>
      <Grid className={classes.flatImagePanelSelections} container>
        {renderImages(images)}
      </Grid>
      {oldImages.length > 0 && (
        <ShowMoreExpansion name="Show Older Images" defaultExpanded={false}>
          <Grid container spacing={2} style={{ marginTop: 16 }}>
            {renderImages(oldImages)}
          </Grid>
        </ShowMoreExpansion>
      )}
    </>
  );
};

const styled = withStyles(styles);

export default styled(PublicImages);
