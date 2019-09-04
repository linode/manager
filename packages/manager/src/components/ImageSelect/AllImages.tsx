import * as React from 'react';

import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Grid from 'src/components/Grid';
import { ImageProps as Props } from './ImageSelect';
import PrivateImages from './PrivateImages';
import PublicImages from './PublicImages';

export const AllImages: React.FC<Props> = props => {
  const { images, ...rest } = props;
  const [activeTab, setActiveTab] = React.useState<number>(0);

  const handleTabChange = (_: any, value: number) => {
    setActiveTab(value);
    // Reset selected image (if any) so there isn't a hidden selection
    props.handleSelectImage(undefined);
  };

  return (
    <Grid
      container
      direction="column"
      wrap="nowrap"
      style={{ padding: '10px' }}
    >
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
      >
        {['Public Images', 'Private Images'].map((thisTab, idx) => (
          <Tab key={idx} label={thisTab} />
        ))}
      </Tabs>
      {activeTab === 0 ? (
        <PublicImages
          images={images.filter(thisImage => thisImage.is_public)}
          {...rest}
        />
      ) : (
        <PrivateImages
          images={images.filter(thisImage => !thisImage.is_public)}
          {...rest}
        />
      )}
    </Grid>
  );
};

export default AllImages;
