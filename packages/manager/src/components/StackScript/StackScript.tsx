import { User } from '@linode/api-v4/lib/account';
import { StackScript } from '@linode/api-v4/lib/stackscripts';
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
import { canUserModifyAccountStackScript } from 'src/features/StackScripts/stackScriptUtils';
import useAccountManagement from 'src/hooks/useAccountManagement';
import { useImages } from 'src/hooks/useImages';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import { useAccountUsers } from 'src/queries/accountUsers';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.cmrBGColors.bgPaper,
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
  scriptHeading: {
    marginBottom: theme.spacing(1),
    fontSize: '1rem',
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
    transition: theme.transitions.create(['color']),
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
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

export interface Props {
  data: StackScript;
}

type CombinedProps = Props;

export const SStackScript: React.FC<CombinedProps> = (props) => {
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
  } = props;

  const classes = useStyles();
  const history = useHistory();
  const { data: accountUsersData } = useAccountUsers();

  const { images: imagesData } = useImages('public');
  useReduxLoad(['images']);

  const { profile } = useAccountManagement();
  const isRestrictedUser = profile?.data?.restricted ?? false;
  const stackScriptGrants = profile?.data?.grants?.stackscript ?? [];

  const displayEditButton: boolean = isRestrictedUser
    ? canUserModifyAccountStackScript(
        isRestrictedUser,
        stackScriptGrants,
        stackscriptId
      )
    : usernameIsTiedToAccount(accountUsersData?.data, username);

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

  const queryString = stringify({ query: `username:${username}` });
  const link =
    profile.data?.username === username
      ? '/stackscripts/account'
      : `/stackscripts/community?${queryString}`;

  return (
    <div className={classes.root}>
      <Grid container alignItems="flex-start" justify="space-between">
        <H1Header
          className={classes.headerLabel}
          title={label}
          data-qa-stack-title={label}
        />
        {displayEditButton ? (
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

const usernameIsTiedToAccount = (
  accountUsers: User[] = [],
  stackscriptUsername: string
) => {
  return accountUsers.some((user) => user.username === stackscriptUsername);
};

export default React.memo(SStackScript);
