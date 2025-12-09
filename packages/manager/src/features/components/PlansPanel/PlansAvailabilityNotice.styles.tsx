import { List, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React from 'react';

import { TextTooltip } from 'src/components/TextTooltip';

import type { TypographyProps } from '@linode/ui';
import type { Theme } from '@mui/material/styles';
import type { TextTooltipProps } from 'src/components/TextTooltip/TextTooltip';

export const PlanNoticeTypography = (props: TypographyProps) => {
  return (
    <Typography
      sx={(theme) => ({ font: theme.font.bold })}
      variant="body2"
      {...props}
    />
  );
};

export const PlanTextTooltip = (props: TextTooltipProps) => {
  return (
    <TextTooltip
      minWidth={225}
      placement="bottom-start"
      sxTypography={{
        fontFamily: (theme: Theme) => theme.font.bold,
      }}
      variant="body2"
      {...props}
    />
  );
};

export const StyledFormattedRegionList = styled(List, {
  label: 'StyledFormattedRegionList',
})(({ theme }) => ({
  '& li': {
    padding: `4px 0`,
  },
  padding: `${theme.spacing(0.5)} ${theme.spacing()}`,
}));
