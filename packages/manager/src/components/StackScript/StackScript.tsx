import { StackScript as StackScriptType } from '@linode/api-v4/lib/stackscripts';
import { stringify } from 'qs';
import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import CopyTooltip from 'src/components/CopyTooltip';
import Chip from 'src/components/core/Chip';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import H1Header from 'src/components/H1Header';
import ScriptCode from 'src/components/ScriptCode';
import { useImages } from 'src/hooks/useImages';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import HelpIcon from '../HelpIcon';
import Box from '../core/Box';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.bg.bgPaper,
    '.detailsWrapper &': {
      padding: theme.spacing(4),
    },
  },
  headerLabel: {
    marginLeft: '0.25em',
    maxWidth: 'calc(100% - 80px)',
  },
  editBtn: {
    minWidth: 'fit-content',
  },
  deployments: {
    marginTop: theme.spacing(1),
  },
  author: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  description: {
    whiteSpace: 'pre-wrap',
  },
  heading: {
    marginBottom: theme.spacing(1),
  },
  descriptionText: {
    marginBottom: theme.spacing(2),
  },
  deploymentSection: {
    marginTop: theme.spacing(1),
    fontSize: '1rem',
  },
  idSection: {
    marginTop: theme.spacing(1),
    fontSize: '1rem',
  },
  copyIcon: {
    color: theme.palette.primary.main,
    position: 'relative',
    display: 'inline-block',
    '& svg': {
      width: '1em',
      height: '1em',
    },
  },
  dateTimeDisplay: {
    display: 'inline-block',
    fontSize: '1rem',
  },
  compatibleImages: {
    display: 'block',
    marginTop: theme.spacing(1),
  },
  helpIcon: {
    padding: 0,
    marginLeft: theme.spacing(),
  },
}));

export interface Props {
  data: StackScriptType;
  userCanModify: boolean;
}

interface StackScriptImages {
  available: JSX.Element[];
  deprecated: JSX.Element[];
}

export const StackScript: React.FC<Props> = (props) => {
  const {
    data: {
      username,
      deployments_total,
      deployments_active,
      description,
      id: stackscriptId,
      script,
      label,
      updated,
      images,
    },
    userCanModify,
  } = props;

  const classes = useStyles();
  const history = useHistory();
  const { profile } = useAccountManagement();

  const { images: imagesData } = useImages('public');
  useReduxLoad(['images']);

  const imageChips = images.reduce(
    (acc: StackScriptImages, image: string) => {
      const imageObj = imagesData.itemsById[image];

      // If an image is null, just continue the reduce.
      if (!image) {
        return acc;
      }

      if (image === 'any/all') {
        acc.available.push(
          <Chip key={image} label="Any/All" component="span" />
        );
        return acc;
      }

      if (imageObj) {
        acc.available.push(
          <Chip key={imageObj.id} label={imageObj.label} component="span" />
        );
      } else {
        acc.deprecated.push(
          <Chip key={image} label={image} component="span" />
        );
      }

      return acc;
    },
    { available: [], deprecated: [] }
  );

  const queryString = stringify({ query: `username:${username}` });
  const link =
    profile?.username === username
      ? '/stackscripts/account'
      : `/stackscripts/community?${queryString}`;

  return (
    <div className={classes.root}>
      <Grid container alignItems="flex-start" justifyContent="space-between">
        <H1Header
          className={classes.headerLabel}
          title={label}
          data-qa-stack-title={label}
        />
        {userCanModify ? (
          <Button
            buttonType="secondary"
            className={classes.editBtn}
            onClick={() => {
              history.push(`/stackscripts/${stackscriptId}/edit`);
            }}
          >
            Edit
          </Button>
        ) : null}
      </Grid>
      <Typography
        variant="h2"
        className={classes.author}
        data-qa-stack-author={username}
      >
        by&nbsp;
        <Link to={link} data-qa-community-stack-link>
          {username}
        </Link>
      </Typography>

      <div data-qa-stack-deployments className={classes.deployments}>
        <Typography className={classes.deploymentSection}>
          <strong>{deployments_total}</strong> deployments
        </Typography>
        <Typography className={classes.deploymentSection}>
          <strong>{deployments_active}</strong> still active
        </Typography>
        <Typography className={classes.deploymentSection}>
          <strong>Last revision: </strong>
          <DateTimeDisplay
            value={updated}
            className={classes.dateTimeDisplay}
          />
        </Typography>
        <Typography className={classes.idSection}>
          <strong>StackScript ID: </strong>
          {stackscriptId}
          <CopyTooltip
            text={stackscriptId.toString()}
            className={classes.copyIcon}
          />
        </Typography>
        <Divider spacingTop={16} spacingBottom={16} />
      </div>
      {description && (
        <div className={classes.description}>
          <Typography variant="h3" className={classes.heading}>
            Description
          </Typography>
          <Typography
            className={classes.descriptionText}
            data-qa-stack-description
          >
            {description}
          </Typography>
          <Divider spacingTop={16} spacingBottom={16} />
        </div>
      )}
      <div>
        <div
          data-qa-compatible-distro
          className={classes.deploymentSection}
          style={{ marginTop: 0 }}
        >
          <Typography variant="h3" className={classes.heading}>
            Compatible Images
          </Typography>
          {imageChips.available.length > 0 ? (
            imageChips.available
          ) : (
            <Typography variant="body1">No compatible images found</Typography>
          )}
          {imageChips.deprecated.length > 0 ? (
            <>
              <Divider spacingTop={16} spacingBottom={16} />
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                className={classes.heading}
              >
                <Typography variant="h3">Deprecated Images</Typography>
                <HelpIcon
                  text="You must update your StackScript to use a compatible Image to deploy it"
                  tooltipPosition="bottom"
                  className={classes.helpIcon}
                />
              </Box>
              {imageChips.deprecated}
            </>
          ) : null}
        </div>
        <Divider spacingTop={16} spacingBottom={16} />
      </div>
      <Typography variant="h3" className={classes.heading}>
        Script
      </Typography>
      <ScriptCode script={script} />
    </div>
  );
};

export default React.memo(StackScript);
