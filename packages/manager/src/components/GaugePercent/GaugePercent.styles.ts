import { styled } from '@mui/material/styles';
import { omittedProps } from 'src/utilities/omittedProps';
import { GaugePercentProps } from './GaugePercent';

type StyledGaugePercentProps = Pick<GaugePercentProps, 'innerTextFontSize'> &
  Required<Pick<GaugePercentProps, 'width' | 'height'>>;

const propKeys = ['width', 'height', 'innerTextFontSize'];

export const StyledSubTitleDiv = styled('div', {
  shouldForwardProp: (prop) => omittedProps(propKeys, prop),
})<StyledGaugePercentProps>(({ theme, width, height, innerTextFontSize }) => ({
  color: theme.color.headline,
  fontSize: innerTextFontSize || theme.spacing(2.5),
  position: 'absolute',
  textAlign: 'center',
  top: `calc(${height}px + ${theme.spacing(1.25)})`,
  width: width,
}));

export const StyledInnerTextDiv = styled('div', {
  shouldForwardProp: (prop) => omittedProps(propKeys, prop),
})<StyledGaugePercentProps>(({ theme, height, width }) => ({
  position: 'absolute',
  top: `calc(${height + 30}px / 2)`,
  width: width,
  textAlign: 'center',
  fontSize: '1rem',
  color: theme.palette.text.primary,
}));

export const StyledGaugeWrapperDiv = styled('div', {
  shouldForwardProp: (prop) => omittedProps(propKeys, prop),
})<StyledGaugePercentProps>(({ theme, height, width }) => ({
  position: 'relative',
  width: width,
  height: `calc(${height}px + ${theme.spacing(3.75)})`,
}));
