import { listToItemsByID, useProfile } from '@linode/queries';
import {
  Box,
  Button,
  Chip,
  Divider,
  H1Header,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Link } from 'src/components/Link';
import { useAllImagesQuery } from 'src/queries/images';

import { CodeBlock } from '../CodeBlock/CodeBlock';

import type { StackScript as StackScriptType } from '@linode/api-v4/lib/stackscripts';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  author: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  compatibleImages: {
    display: 'block',
    marginTop: theme.spacing(1),
  },
  copyIcon: {
    '& svg': {
      height: '1em',
      width: '1em',
    },
    color: theme.palette.primary.main,
    display: 'inline-block',
    position: 'relative',
  },
  dateTimeDisplay: {
    display: 'inline-block',
    fontSize: '1rem',
  },
  deploymentSection: {
    fontSize: '1rem',
    marginTop: theme.spacing(1),
  },
  deployments: {
    marginTop: theme.spacing(1),
  },
  description: {
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-wrap',
    wordBreak: 'normal',
  },
  descriptionText: {
    marginBottom: theme.spacing(2),
  },
  editBtn: {
    minWidth: 'fit-content',
  },
  headerLabel: {
    maxWidth: 'calc(100% - 80px)',
  },
  heading: {
    marginBottom: theme.spacing(1),
  },
  idSection: {
    fontSize: '1rem',
    marginTop: theme.spacing(1),
  },
}));

export interface StackScriptProps {
  data: StackScriptType;
  userCanModify: boolean;
}

interface StackScriptImages {
  available: JSX.Element[];
  deprecated: JSX.Element[];
}

export const StackScript = React.memo((props: StackScriptProps) => {
  const {
    data: {
      deployments_active,
      deployments_total,
      description,
      id: stackscriptId,
      images,
      label,
      script,
      updated,
      username,
    },
    userCanModify,
  } = props;

  const { classes } = useStyles();
  const { data: profile } = useProfile();

  const theme = useTheme();
  const history = useHistory();

  const { data: imagesData } = useAllImagesQuery(
    {},
    { is_public: true } // We want to display private images (i.e., not Debian, Ubuntu, etc. distros)
  );

  const imagesItemsById = listToItemsByID(imagesData ?? []);

  const imageChips = images.reduce(
    (acc: StackScriptImages, image: string) => {
      const imageObj = imagesItemsById[image];

      // If an image is null, just continue the reduce.
      if (!image) {
        return acc;
      }

      if (image === 'any/all') {
        acc.available.push(
          <Chip component="span" key={image} label="Any/All" />
        );
        return acc;
      }

      if (imageObj) {
        acc.available.push(
          <Chip component="span" key={imageObj.id} label={imageObj.label} />
        );
      } else {
        acc.deprecated.push(
          <Chip component="span" key={image} label={image} />
        );
      }

      return acc;
    },
    { available: [], deprecated: [] }
  );

  const queryString = new URLSearchParams({
    query: `username:${username}`,
  }).toString();

  const link =
    profile?.username === username
      ? '/stackscripts/account'
      : `/stackscripts/community?${queryString}`;

  return (
    <div>
      <Box
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <H1Header
          className={classes.headerLabel}
          data-qa-stack-title={label}
          title={label}
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
      </Box>
      <Typography
        className={classes.author}
        data-qa-stack-author={username}
        variant="h2"
      >
        by&nbsp;
        <Link data-qa-community-stack-link to={link}>
          {username}
        </Link>
      </Typography>

      <div className={classes.deployments} data-qa-stack-deployments>
        <Typography className={classes.deploymentSection}>
          <strong>{deployments_total}</strong> deployments
        </Typography>
        <Typography className={classes.deploymentSection}>
          <strong>{deployments_active}</strong> still active
        </Typography>
        <Typography className={classes.deploymentSection}>
          <strong>Last revision: </strong>
          <DateTimeDisplay
            className={classes.dateTimeDisplay}
            value={updated}
          />
        </Typography>
        <Typography className={classes.idSection}>
          <strong>StackScript ID: </strong>
          {stackscriptId}
          <CopyTooltip
            className={classes.copyIcon}
            text={stackscriptId.toString()}
          />
        </Typography>
        <Divider spacingBottom={16} spacingTop={16} />
      </div>
      {description && (
        <div className={classes.description}>
          <Typography className={classes.heading} variant="h3">
            Description
          </Typography>
          <Typography
            className={classes.descriptionText}
            data-qa-stack-description
          >
            {description}
          </Typography>
          <Divider spacingBottom={16} spacingTop={16} />
        </div>
      )}
      <div>
        <div
          className={classes.deploymentSection}
          data-qa-compatible-distro
          style={{ marginTop: 0 }}
        >
          <Typography className={classes.heading} variant="h3">
            Compatible Images
          </Typography>
          {imageChips.available.length > 0 ? (
            imageChips.available
          ) : (
            <Typography variant="body1">No compatible images found</Typography>
          )}
          {imageChips.deprecated.length > 0 ? (
            <>
              <Divider spacingBottom={16} spacingTop={16} />
              <Box
                alignItems="center"
                className={classes.heading}
                display="flex"
                flexDirection="row"
              >
                <Typography variant="h3">Deprecated Images</Typography>
                <TooltipIcon
                  status="help"
                  sxTooltipIcon={{
                    marginLeft: theme.spacing(),
                    padding: 0,
                  }}
                  text="You must update your StackScript to use a compatible Image to deploy it"
                  tooltipPosition="bottom"
                />
              </Box>
              {imageChips.deprecated}
            </>
          ) : null}
        </div>
        <Divider spacingBottom={16} spacingTop={16} />
      </div>
      <Typography className={classes.heading} variant="h3">
        Script
      </Typography>
      <CodeBlock code={script} language="shell" />
    </div>
  );
});
