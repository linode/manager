import { Grant } from '@linode/api-v4/lib/account';
import { StackScript } from '@linode/api-v4/lib/stackscripts';
import { stringify } from 'qs';
import { pathOr } from 'ramda';
import * as React from 'react';
import { useSelector } from 'react-redux';
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
import { isRestrictedUser as _isRestrictedUser } from 'src/features/Profile/permissionsHelpers';
import { canUserModifyAccountStackScript } from 'src/features/StackScripts/stackScriptUtils';
import { useImages } from 'src/hooks/useImages';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import { ApplicationState } from 'src/store';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.color.white,
    '.detailsWrapper &': {
      padding: theme.spacing(4)
    }
  },
  headerLabel: {
    marginLeft: '0.25em'
  },
  editBtn: {
    minWidth: 'fit-content'
  },
  deployments: {
    marginTop: theme.spacing(1)
  },
  author: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  description: {
    whiteSpace: 'pre-wrap'
  },
  scriptHeading: {
    marginBottom: theme.spacing(1),
    fontSize: '1rem'
  },
  descriptionText: {
    marginBottom: theme.spacing(2)
  },
  deploymentSection: {
    marginTop: theme.spacing(1),
    fontSize: '1rem'
  },
  idSection: {
    marginTop: theme.spacing(1),
    fontSize: '1rem'
  },
  copyIcon: {
    color: theme.palette.primary.main,
    position: 'relative',
    display: 'inline-block',
    transition: theme.transitions.create(['color']),
    '& svg': {
      width: '1em',
      height: '1em'
    }
  },
  dateTimeDisplay: {
    display: 'inline-block',
    fontSize: '1rem'
  },
  compatibleImages: {
    display: 'block',
    marginTop: theme.spacing(1)
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

export interface Props {
  data: StackScript;
}

type CombinedProps = Props;

export const SStackScript: React.FC<CombinedProps> = props => {
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
      is_public
    }
  } = props;

  const classes = useStyles();
  const history = useHistory();

  const { images: imagesData } = useImages('public');
  useReduxLoad(['images']);

  const { isRestrictedUser, stackScriptGrants } = useSelector(
    (state: ApplicationState) => {
      const isRestrictedUser = _isRestrictedUser(state);
      const stackScriptGrants: Grant[] = pathOr(
        [],
        ['__resources', 'profile', 'data', 'grants', 'stackscript'],
        state
      );
      return { isRestrictedUser, stackScriptGrants };
    }
  );

  const grantsForThisStackScript = stackScriptGrants.find(
    (eachGrant: Grant) => eachGrant.id === Number(stackscriptId)
  );

  const compatibleImages = React.useMemo(() => {
    const imageChips = images.reduce((acc: any[], image: string) => {
      const imageObj = imagesData.itemsById[image];

      if (imageObj) {
        acc.push(
          <Chip
            key={imageObj.id}
            label={imageObj.label}
            component="span"
            clickable={false}
          />
        );
      }

      return acc;
    }, []);
    return imageChips.length > 0 ? imageChips : <>No compatible images found</>;
  }, [images, imagesData]);

  const queryString = stringify({
    type: 'community',
    query: `username:${username}`
  });

  return (
    <div className={classes.root}>
      <Grid container justify="space-between">
        <H1Header
          className={classes.headerLabel}
          title={label}
          data-qa-stack-title={label}
        />
        {!is_public ||
        grantsForThisStackScript?.permissions === 'read_write' ? (
          <Button
            buttonType="secondary"
            className={classes.editBtn}
            disabled={
              !canUserModifyAccountStackScript(
                isRestrictedUser,
                stackScriptGrants,
                stackscriptId
              )
            }
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
        <Link to={`/stackscripts?${queryString}`} data-qa-community-stack-link>
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
        <Divider className={classes.divider} />
      </div>
      {description && (
        <div className={classes.description}>
          <Typography
            className={classes.descriptionText}
            data-qa-stack-description
          >
            {description}
          </Typography>
          <Divider className={classes.divider} />
        </div>
      )}
      <div>
        <Typography
          data-qa-compatible-distro
          className={classes.deploymentSection}
          style={{ marginTop: 0 }}
        >
          <strong>Compatible with:</strong>
          <span className={classes.compatibleImages}>{compatibleImages}</span>
        </Typography>
        <Divider className={classes.divider} />
      </div>
      <Typography className={classes.scriptHeading}>
        <strong>Script:</strong>
      </Typography>
      <ScriptCode script={script} />
    </div>
  );
};

export default React.memo(SStackScript);
