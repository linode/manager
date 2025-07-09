import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';
import type { JSX } from 'react';

import { ComputeIcon } from '../../assets';
import { fadeIn } from '../../foundations';
import { Button, type ButtonProps } from '../Button';
import { H1Header } from '../H1Header';
import { Typography } from '../Typography';

export interface ExtendedButtonProps extends ButtonProps {
  target?: string;
}

export interface BasePlaceholderProps {
  /**
   * Additional copy text to display
   */
  additionalCopy?: React.ReactNode | string;
  /**
   * Determines the buttons to display
   */
  buttonProps?: ExtendedButtonProps[];
  /**
   * Additional children to pass in
   */
  children?: React.ReactNode | string;
  /**
   * Additional styles to pass to the root element
   */
  className?: string;
  /**
   * Used for testing
   */
  dataQAPlaceholder?: boolean | string;
  /**
   * If provided, determines the max width of any children or additional copy text
   */
  descriptionMaxWidth?: number;
  /**
   * Icon to display as placeholder
   * @default LinodeIcon
   */
  icon?: React.ComponentType<any>;
  /**
   * If true, applies additional styles to the icon container
   */
  isEntity?: boolean;
  /**
   * Links to display
   */
  linksSection?: JSX.Element;
  /**
   *If true, uses 'h2' as the root node of the title instead of 'h1'
   */
  renderAsSecondary?: boolean;
  /**
   * Subtitle text to display
   */
  subtitle?: string;
  /**
   * Title text to display as placeholder
   */
  title: string;
}

interface PlaceholderPropsWithTransferDisplay extends BasePlaceholderProps {
  /**
   * If true, displays transfer display
   */
  showTransferDisplay: boolean;
  /**
   * The TransferDisplay component that needs to be passed if you enable showTransferDisplay
   */
  TransferDisplayComponent: React.ComponentType<{ spacingTop?: number }>;
  /**
   * The spacingTop value that can be passed to the TransferDisplay component
   */
  TransferDisplaySpacingTop?: number;
}

interface PlaceholderPropsWithoutTransferDisplay extends BasePlaceholderProps {
  showTransferDisplay?: never;
  TransferDisplayComponent?: never;
  TransferDisplaySpacingTop?: never;
}

export type PlaceholderProps =
  | PlaceholderPropsWithoutTransferDisplay
  | PlaceholderPropsWithTransferDisplay;

export const Placeholder = (props: PlaceholderProps) => {
  const {
    additionalCopy,
    buttonProps,
    dataQAPlaceholder,
    descriptionMaxWidth,
    icon: Icon = ComputeIcon,
    isEntity,
    linksSection,
    renderAsSecondary,
    showTransferDisplay,
    subtitle,
    title,
    TransferDisplayComponent,
    TransferDisplaySpacingTop,
  } = props;

  const theme = useTheme();
  const hasSubtitle = subtitle !== undefined;

  /**
   * TODO: We should use these styles to create a Styled component THEN
   * pass that into the Placeholder component
   * */
  const IconStyles = {
    '& .bucket.insidePath path': {
      fill: theme.palette.primary.main,
    },
    '& .circle': {
      fill:
        theme.name === 'light'
          ? theme.tokens.color.Neutrals.White
          : theme.tokens.color.Neutrals.Black,
    },
    '& .insidePath path': {
      opacity: 0,
      stroke: theme.palette.primary.main,
    },
    '& .outerCircle': {
      fill:
        theme.name === 'light'
          ? theme.tokens.color.Neutrals.White
          : theme.tokens.color.Neutrals.Black,
      stroke: theme.bg.offWhite,
    },
    height: '160px',
    padding: theme.spacing(2),
    width: '160px',
  };

  return (
    <>
      <PlaceholderRoot
        className={props.className}
        data-qa-placeholder-container={dataQAPlaceholder || true}
      >
        <StyledIconWrapper isEntity={isEntity}>
          {Icon && <Icon data-testid="placeholder-icon" style={IconStyles} />}
        </StyledIconWrapper>

        <H1Header
          data-qa-placeholder-title
          renderAsSecondary={renderAsSecondary}
          sx={{
            gridArea: 'title',
            textAlign: 'center',
          }}
          title={title}
        />
        {hasSubtitle ? (
          <Typography
            sx={{
              color: theme.palette.text.primary,
              gridArea: 'subtitle',
              textAlign: 'center',
            }}
            variant="h2"
          >
            {subtitle}
          </Typography>
        ) : null}

        <StyledCopy descriptionMaxWidth={descriptionMaxWidth}>
          {typeof props.children === 'string' ? (
            <Typography variant="subtitle1">{props.children}</Typography>
          ) : (
            props.children
          )}
        </StyledCopy>
        <StyledButtonWrapper>
          {buttonProps &&
            buttonProps.map((thisButton, index) => (
              <Button
                buttonType="primary"
                {...thisButton}
                data-qa-placeholder-button
                data-testid="placeholder-button"
                key={index}
              />
            ))}
        </StyledButtonWrapper>
        {additionalCopy ? (
          <StyledCopy
            descriptionMaxWidth={descriptionMaxWidth}
            sx={{ gridArea: 'additionalCopy' }}
          >
            {typeof additionalCopy === 'string' ? (
              <Typography variant="subtitle1">{additionalCopy}</Typography>
            ) : (
              additionalCopy
            )}
          </StyledCopy>
        ) : null}
        {linksSection !== undefined ? (
          <StyledLinksSection>{linksSection}</StyledLinksSection>
        ) : null}
      </PlaceholderRoot>
      {showTransferDisplay ? (
        <TransferDisplayComponent spacingTop={TransferDisplaySpacingTop} />
      ) : null}
    </>
  );
};

const StyledIconWrapper = styled('div')<Pick<PlaceholderProps, 'isEntity'>>(
  ({ theme, ...props }) => ({
    gridArea: 'icon',
    padding: theme.spacingFunction(16),
    ...(props.isEntity && {
      alignItems: 'center',
      backgroundColor: theme.bg.bgPaper,
      borderRadius: '50%',
      color: theme.color.green,
      display: 'flex',
      justifyContent: 'center',
    }),
  }),
);

const StyledButtonWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacingFunction(16),
  gridArea: 'button',
  [theme.breakpoints.down('xs')]: {
    flexDirection: 'column',
  },
}));

const StyledLinksSection = styled('div')<
  Pick<PlaceholderProps, 'showTransferDisplay'>
>(({ theme }) => ({
  borderTop: `1px solid ${
    theme.name === 'light'
      ? theme.tokens.color.Neutrals[20]
      : theme.tokens.color.Neutrals[100]
  }`,
  gridArea: 'links',
  paddingTop: '38px',

  borderBottom: `1px solid ${
    theme.name === 'light'
      ? theme.tokens.color.Neutrals[20]
      : theme.tokens.color.Neutrals[100]
  }`,
  paddingBottom: theme.spacingFunction(16),
  [theme.breakpoints.up('md')]: {
    paddingBottom: theme.spacingFunction(32),
  },
}));

const StyledCopy = styled('div', {
  label: 'StyledCopy',
})<Pick<PlaceholderProps, 'descriptionMaxWidth'>>(({ theme, ...props }) => ({
  gridArea: 'copy',
  maxWidth: props.descriptionMaxWidth ? props.descriptionMaxWidth : '75%',
  minWidth: 'min-content',
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    maxWidth: 'none',
  },
}));

const PlaceholderRoot = styled('div')<Partial<PlaceholderProps>>(
  ({ theme, ...props }) => ({
    '& .bucket.insidePath path': {
      fill: theme.palette.primary.main,
    },
    // @TODO: Check! These were in the root of the makeStyles function...
    '& .insidePath path': {
      animation: `${fadeIn} .2s ease-in-out forwards .3s`,
      opacity: 0,
      stroke: theme.palette.primary.main,
    },
    display: 'grid',
    gridTemplateAreas:
      props.showTransferDisplay && props.linksSection === undefined
        ? `
        ". . . . . icon icon . . . . ."
        ". . . . . . . . . . . ."
        ". . . . . title title . . . . ."
        ". . . . . . . . . . . ."
        ". . . . . subtitle subtitle . . . . ."
        ". . . . . . . . . . . ."
        ". . . . . copy copy . . . . ."
        ". . . . . . . . . . . ."
        ". . . . . button button . . . . ."
        ". . . . . . . . . . . ."
        ". . . . . additionalCopy additionalCopy . . . . ."
      `
        : `
        ". . . . . icon icon . . . . ."
        ". . . . . . . . . . . ."
        ". . . . . title title . . . . ."
        ". . . . . . . . . . . ."
        ". . . . . subtitle subtitle . . . . ."
        ". . . . . . . . . . . ."
        ". . . . . copy copy . . . . ."
        ". . . . . . . . . . . ."
        ". . . . . button button . . . . ."
        ". . . . . . . . . . . ."
        ". . . . . additionalCopy additionalCopy . . . . ."
        ". . . . . . . . . . . ."
        ". . . links links links links links links . . ."
      `,
    gridTemplateColumns: 'repeat(5, 1fr) 35% 35% repeat(5, 1fr)',
    gridTemplateRows:
      props.showTransferDisplay && props.linksSection === undefined
        ? 'max-content 12px max-content 7px max-content 15px max-content 24px max-content 15px max-content 40px'
        : 'max-content 12px max-content 7px max-content 15px max-content 24px max-content 24px max-content 15px max-content 64px min-content',
    justifyItems: 'center',

    padding: props.showTransferDisplay
      ? `${theme.spacingFunction(32)} 0`
      : `${theme.spacingFunction(16)} 0`,
    [theme.breakpoints.up('md')]: {
      padding: props.showTransferDisplay
        ? `${theme.spacingFunction(64)} 0 ${theme.spacingFunction(64)}`
        : `${theme.spacingFunction(64)} 0`,
    },
  }),
);
