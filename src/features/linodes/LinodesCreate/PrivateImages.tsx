import * as React from 'react';

import Grid from 'src/components/Grid';
import SelectionCard from 'src/components/SelectionCard';


interface Props {
  images: Linode.Image[];
  disabled?: boolean;
  selectedImageID?: string;
  handleSelection: (id: string) => void;
}

const PrivateImages: React.StatelessComponent<Props> = (props) => {
  const { disabled, handleSelection, images, selectedImageID } = props;
  return (
    
    <Grid container>
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
  )
}

export default PrivateImages;