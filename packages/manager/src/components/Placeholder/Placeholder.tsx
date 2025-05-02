import { Button, H1Header, Typography, fadeIn } from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import ComputeIcon from 'src/assets/icons/entityIcons/compute.svg';

import { TransferDisplay } from '../TransferDisplay/TransferDisplay';

import type { ButtonProps } from '@linode/ui';

export interface ExtendedButtonProps extends ButtonProps {
  target?: string;
}

export interface PlaceholderProps {
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
   * If true, displays transfer display
   */
  showTransferDisplay?: boolean;
  /**
   * Subtitle text to display
   */
  subtitle?: string;
  /**
   * Title text to display as placeholder
   */
  title: string;
}

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
          sx={{
            gridArea: 'title',
            textAlign: 'center',
          }}
          data-qa-placeholder-title
          renderAsSecondary={renderAsSecondary}
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
          <StyledLinksSection showTransferDisplay={showTransferDisplay}>
            {linksSection}
          </StyledLinksSection>
        ) : null}
      </PlaceholderRoot>
      {showTransferDisplay ? <TransferDisplay spacingTop={0} /> : null}
    </>
  );
};

const StyledIconWrapper = styled('div')<Pick<PlaceholderProps, 'isEntity'>>(
  ({ theme, ...props }) => ({
    gridArea: 'icon',
    padding: theme.spacing(2),
    ...(props.isEntity && {
      alignItems: 'center',
      backgroundColor: theme.bg.bgPaper,
      borderRadius: '50%',
      color: theme.color.green,
      display: 'flex',
      justifyContent: 'center',
    }),
  })
);

const StyledButtonWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  gridArea: 'button',
  [theme.breakpoints.down('xs')]: {
    flexDirection: 'column',
  },
}));

const StyledLinksSection = styled('div')<
  Pick<PlaceholderProps, 'showTransferDisplay'>
>(({ theme, ...props }) => ({
  borderTop: `1px solid ${
    theme.name === 'light'
      ? theme.tokens.color.Neutrals[20]
      : theme.tokens.color.Neutrals[100]
  }`,
  gridArea: 'links',
  paddingTop: '38px',

  ...(props.showTransferDisplay && {
    borderBottom: `1px solid ${
      theme.name === 'light'
        ? theme.tokens.color.Neutrals[20]
        : theme.tokens.color.Neutrals[100]
    }`,
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      paddingBottom: theme.spacing(4),
    },
  }),
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
      ? `${theme.spacing(4)} 0`
      : `${theme.spacing(2)} 0`,
    [theme.breakpoints.up('md')]: {
      padding: props.showTransferDisplay
        ? `${theme.spacing(8)} 0 ${theme.spacing(4)}`
        : `${theme.spacing(8)} 0`,
    },
  })
);
