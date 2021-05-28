import * as React from 'react';

import Typography from 'src/components/core/Typography';
import { ImagesPricingCopy } from 'src/featureFlags';
import useFlags from 'src/hooks/useFlags';

interface Props {
  type: keyof ImagesPricingCopy;
}

const ImagesPricingCopy: React.FC<Props> = (props) => {
  const flags = useFlags();

  if (!flags.imagesPricingCopy?.[props.type]) {
    return null;
  }

  return <Typography>{flags.imagesPricingCopy[props.type]}</Typography>;
};

export default ImagesPricingCopy;
