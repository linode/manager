import * as React from 'react';

import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import SelectionCard from 'src/components/SelectionCard';
import ShowMoreExpansion from 'src/components/ShowMoreExpansion';

type ClassNames = 'root' | 'flatImagePanel' | 'flatImagePanelSelections';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  flatImagePanel: {
    padding: theme.spacing.unit * 3
  },
  flatImagePanelSelections: {
    marginTop: theme.spacing.unit * 2,
    padding: `${theme.spacing.unit}px 0`
  },
  root: {}
});

interface Props {
  images: Linode.Image[];
  oldImages: Linode.Image[];
  selectedImageID?: string;
  disabled?: boolean;
  title?: string;
  error?: string;
  handleSelection: (id: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const distroIcons = {
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

const PublicImages: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, disabled, error, images, handleSelection, oldImages, selectedImageID, title } = props;
  const renderPublicImages = () =>
    images.length &&
    images.map((image: Linode.Image, idx: number) => (
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
      />
    ));

  const renderOlderPublicImages = () =>
    oldImages.length &&
    oldImages.map((image: Linode.Image, idx: number) => (
      <SelectionCard
        key={idx}
        checked={image.id === String(props.selectedImageID)}
        onClick={() => handleSelection(image.id)}
        renderIcon={() => {
          return (
            <span className={`fl-${distroIcons[image.vendor as string]}`} />
          );
        }}
        heading={image.vendor as string}
        subheadings={[image.label]}
        disabled={disabled}
      />
    ));

  return (
    <Paper
      className={classes.flatImagePanel}
      data-qa-tp="Select Image"
    >
      {error && <Notice text={error} error />}
      <Typography role="header" variant="h2" data-qa-tp="Select Image">
        {title || 'Select an Image'}
      </Typography>
      <Grid className={classes.flatImagePanelSelections} container>
        {renderPublicImages()}
      </Grid>
      {oldImages.length > 0 && (
        <ShowMoreExpansion name="Show Older Images">
          <Grid container spacing={16} style={{ marginTop: 16 }}>
            {renderOlderPublicImages()}
          </Grid>
        </ShowMoreExpansion>
      )}
    </Paper>
  )
}

const styled = withStyles(styles);

export default styled(PublicImages);