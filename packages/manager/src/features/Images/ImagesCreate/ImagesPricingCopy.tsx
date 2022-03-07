import * as React from 'react';

import Typography from 'src/components/core/Typography';
import { ImagesPricingCopy } from 'src/featureFlags';
import useFlags from 'src/hooks/useFlags';

// =============================================================================
// <ImagesPricingCopy />
//
// This displays pricing information for Images. The actual text is sourced from
// LaunchDarkly, which presents the data in a JSON object with the format:
// {
//   "captureImage": "Beginning September 1, 2021 Custom Images...",
//   "uploadImage": "Beginning September 1, 2021 Custom Images... "
// }
// We need to keep this around until 2021-09-01. In the meantime we need to
// make a decision on where to place the permanent Images pricing copy and show
// that ONLY if the imagesPricingCopy feature flag is NOT present.
// =============================================================================
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
