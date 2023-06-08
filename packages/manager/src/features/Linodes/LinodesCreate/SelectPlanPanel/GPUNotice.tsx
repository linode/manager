import * as React from 'react';
import { Notice } from 'src/components/Notice/Notice';
import { useRegionsQuery } from 'src/queries/regions';
import { useSelectPlanPanelStyles } from './styles/plansPanelStyles';
import { getRegionsWithCapability } from './utils';

interface Props {
  hasDisabledClass: boolean;
  dataTestId?: string;
}

export const GPUNotice = ({ hasDisabledClass, dataTestId }: Props) => {
  const { classes } = useSelectPlanPanelStyles();
  const { data: regions } = useRegionsQuery();

  const programInfo = hasDisabledClass ? (
    <>
      GPU instances are not available in the selected region. Currently these
      plans are only available in{' '}
      {getRegionsWithCapability('GPU Linodes', regions ?? [])}.
    </>
  ) : (
    <div className={classes.gpuGuideLink}>
      Linode GPU plans have limited availability and may not be available at the
      time of your request. Some additional verification may be required to
      access these services.
      <a
        href="https://www.linode.com/docs/platform/linode-gpu/getting-started-with-gpu/"
        target="_blank"
        aria-describedby="external-site"
        rel="noopener noreferrer"
      >
        {` `}Here is a guide
      </a>{' '}
      with information on getting started.
    </div>
  );
  return (
    <Notice warning dataTestId={dataTestId}>
      {programInfo}
    </Notice>
  );
};
