import * as React from 'react';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import { Button, ButtonProps } from 'src/components/Button/Button';
import { styled, useTheme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { H1Header } from 'src/components/H1Header/H1Header';
import { TransferDisplay } from '../TransferDisplay/TransferDisplay';
import { fadeIn } from 'src/styles/keyframes';

export interface ExtendedButtonProps extends ButtonProps {
  target?: string;
}

export interface PlaceholderProps {
  buttonProps?: ExtendedButtonProps[];
  children?: string | React.ReactNode;
  className?: string;
  dataQAPlaceholder?: string | boolean;
  descriptionMaxWidth?: number;
  icon?: React.ComponentType<any>;
  isEntity?: boolean;
  linksSection?: JSX.Element;
  renderAsSecondary?: boolean;
  showTransferDisplay?: boolean;
  subtitle?: string;
  title: string;
}

export const Placeholder = (props: PlaceholderProps) => {
  const {
    buttonProps,
    dataQAPlaceholder,
    descriptionMaxWidth,
    icon: Icon = LinodeIcon,
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
    width: '160px',
    height: '160px',
    padding: theme.spacing(2),
    '& .outerCircle': {
      fill: theme.name === 'light' ? '#fff' : '#000',
      stroke: theme.bg.offWhite,
    },
    '& .circle': {
      fill: theme.name === 'light' ? '#fff' : '#000',
    },
    '& .insidePath path': {
      opacity: 0,
      stroke: theme.palette.primary.main,
    },
    '& .bucket.insidePath path': {
      fill: theme.palette.primary.main,
    },
  };

  return (
    <>
      <PlaceholderRoot
        className={props.className}
        data-qa-placeholder-container={dataQAPlaceholder || true}
      >
        <StyledIconWrapper isEntity={isEntity}>
          {Icon && <Icon style={IconStyles} />}
        </StyledIconWrapper>

        <H1Header
          title={title}
          renderAsSecondary={renderAsSecondary}
          data-qa-placeholder-title
          sx={{
            textAlign: 'center',
            gridArea: 'title',
          }}
        />
        {hasSubtitle ? (
          <Typography
            variant="h2"
            sx={{
              gridArea: 'subtitle',
              textAlign: 'center',
              color: theme.palette.text.primary,
            }}
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
      borderRadius: '50%',
      backgroundColor: theme.bg.bgPaper,
      color: theme.color.green,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
  })
);

const StyledButtonWrapper = styled('div')(({ theme }) => ({
  gridArea: 'button',
  display: 'flex',
  gap: theme.spacing(2),
  [theme.breakpoints.down('xs')]: {
    flexDirection: 'column',
  },
}));

const StyledLinksSection = styled('div')<
  Pick<PlaceholderProps, 'showTransferDisplay'>
>(({ theme, ...props }) => ({
  gridArea: 'links',
  borderTop: `1px solid ${theme.name === 'light' ? '#e3e5e8' : '#2e3238'}`,
  paddingTop: '38px',

  ...(props.showTransferDisplay && {
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      paddingBottom: theme.spacing(4),
    },
    borderBottom: `1px solid ${theme.name === 'light' ? '#e3e5e8' : '#2e3238'}`,
  }),
}));

const StyledCopy = styled('div', {
  label: 'StyledCopy',
})<Pick<PlaceholderProps, 'descriptionMaxWidth'>>(({ theme, ...props }) => ({
  textAlign: 'center',
  gridArea: 'copy',
  minWidth: 'min-content',
  maxWidth: props.descriptionMaxWidth ? props.descriptionMaxWidth : '75%',
  [theme.breakpoints.down('md')]: {
    maxWidth: 'none',
  },
}));

const PlaceholderRoot = styled('div')<Partial<PlaceholderProps>>(
  ({ theme, ...props }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr) 35% 35% repeat(5, 1fr)',
    gridTemplateRows:
      props.showTransferDisplay && props.linksSection === undefined
        ? 'max-content 12px max-content 7px max-content 15px max-content 24px max-content 40px'
        : 'max-content 12px max-content 7px max-content 15px max-content 24px max-content 64px min-content',
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
        ". . . links links links links links links . . ."
      `,
    justifyItems: 'center',
    padding: props.showTransferDisplay
      ? `${theme.spacing(4)} 0`
      : `${theme.spacing(2)} 0`,
    [theme.breakpoints.up('md')]: {
      padding: props.showTransferDisplay
        ? `${theme.spacing(10)} 0 ${theme.spacing(4)}`
        : `${theme.spacing(10)} 0`,
    },

    // @TODO: Check! These were in the root of the makeStyles function...
    '& .insidePath path': {
      opacity: 0,
      animation: `${fadeIn} .2s ease-in-out forwards .3s`,
      stroke: theme.palette.primary.main,
    },
    '& .bucket.insidePath path': {
      fill: theme.palette.primary.main,
    },
  })
);
