import { omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';

import type { GaugePercentProps } from './GaugePercent';

type StyledGaugePercentProps = Pick<GaugePercentProps, 'innerTextFontSize'> &
  Required<Pick<GaugePercentProps, 'height' | 'width'>>;

const propKeys = ['width', 'height', 'innerTextFontSize'];

export const StyledSubTitleDiv = styled('div', {
  shouldForwardProp: omittedProps(propKeys),
})<StyledGaugePercentProps>(({ height, innerTextFontSize, theme, width }) => ({
  color: theme.color.headline,
  fontSize: innerTextFontSize || theme.spacing(2.5),
  position: 'absolute',
  textAlign: 'center',
  top: `calc(${height}px + ${theme.spacing(1.25)})`,
  width,
}));

export const StyledInnerTextDiv = styled('div', {
  shouldForwardProp: omittedProps(propKeys),
})<StyledGaugePercentProps>(({ height, theme, width }) => ({
  color: theme.palette.text.primary,
  fontSize: '1rem',
  position: 'absolute',
  textAlign: 'center',
  top: `calc(${height + 30}px / 2)`,
  width,
}));

export const StyledGaugeWrapperDiv = styled('div', {
  shouldForwardProp: omittedProps(propKeys),
})<StyledGaugePercentProps>(({ height, theme, width }) => ({
  height: `calc(${height}px + ${theme.spacing(3.75)})`,
  position: 'relative',
  width,
}));
