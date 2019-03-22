import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import RenderGuard from 'src/components/RenderGuard';
import SelectionCard from 'src/components/SelectionCard';
import TabbedPanel from 'src/components/TabbedPanel';
import { distroIcons, getMyImages, groupImages } from 'src/utilities/images';

export type ClassNames = 'root' | 'flatImagePanel' | 'flatImagePanelSelections';

export const styles: StyleRulesCallback<ClassNames> = theme => ({
  flatImagePanel: {
    padding: theme.spacing.unit * 3
  },
  flatImagePanelSelections: {
    marginTop: theme.spacing.unit * 2,
    padding: `${theme.spacing.unit}px 0`
  },
  root: {}
});

export interface Props {
  images: Linode.Image[];
  selectedImageID: string | null;
  handleSelection: (id: string) => void;
  error?: string;
  disabled?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SelectImagePanel: React.StatelessComponent<CombinedProps> = props => {
  const { images, error, handleSelection, selectedImageID, disabled } = props;

  const { recommended, older } = groupImages(images);
  const myImages = getMyImages(images);

  const createImagePanels = imagePanelFactory(
    String(selectedImageID),
    handleSelection,
    disabled
  );

  const tabs = [
    {
      title: '64-bit Distributions (Recommended)',
      render: () => (
        <Grid container spacing={16}>
          {createImagePanels(recommended)}
        </Grid>
      )
    },
    {
      title: 'Older Distributions',
      render: () => (
        <Grid container spacing={16}>
          {createImagePanels(older)}
        </Grid>
      )
    },
    {
      title: 'My Images',
      render: () =>
        myImages.length > 0 ? (
          <Grid container>{createImagePanels(myImages)}</Grid>
        ) : (
          <Typography>
            You don't have any images!{' '}
            <Link to={'/images'}>Click here to add one.</Link>
          </Typography>
        )
    }
  ];

  return (
    <React.Fragment>
      <TabbedPanel error={error} header="Select Image" tabs={tabs} />
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(RenderGuard<Props>(SelectImagePanel));

// Maps over images and creates a SelectionCard for each. Wrapped in a closure
// so that it doesn't have to been called with the same arguments over and over
// again.
const imagePanelFactory = (
  selectedImageID: string,
  handleSelection: (id: string) => void,
  disabled?: boolean
) => (images: Linode.Image[] = []) =>
  images.map((image, idx) => (
    <SelectionCard
      key={idx}
      checked={image.id === String(selectedImageID)}
      onClick={() => handleSelection(image.id)}
      disabled={disabled}
      renderIcon={() => {
        const className = image.vendor
          ? `fl-${distroIcons[image.vendor as string]}`
          : 'fl-tux';
        return <span className={className} />;
      }}
      heading={image.vendor as string}
      subheadings={[image.label]}
      data-qa-selection-card
    />
  ));
