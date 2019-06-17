import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import SelectionCard from 'src/components/SelectionCard';

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
  images: Linode.Image[];
  disabled?: boolean;
  selectedImageID?: string;
  handleSelection: (id: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const PrivateImages: React.StatelessComponent<CombinedProps> = props => {
  const { classes, disabled, handleSelection, images, selectedImageID } = props;
  return (
    <Grid container className={classes.flatImagePanelSelections}>
      {images &&
        images.map((image: Linode.Image, idx: number) => (
          <SelectionCard
            key={idx}
            checked={image.id === String(selectedImageID)}
            onClick={() => handleSelection(image.id)}
            renderIcon={() => <span className="fl-tux" />}
            heading={image.label as string}
            subheadings={[image.description as string]}
            disabled={disabled}
          />
        ))}
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(PrivateImages);
