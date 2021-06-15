import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose as recompose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
import { withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import StackScriptsActionMenu from 'src/features/StackScripts/StackScriptPanel/StackScriptActionMenu';
import { StackScriptCategory } from 'src/features/StackScripts/stackScriptUtils';
import { ClassNames, styles } from '../StackScriptRowHelpers';

export interface Props {
  label: string;
  description: string;
  images: string[];
  deploymentsTotal: number;
  updated: string;
  stackScriptID: number;
  stackScriptUsername: string;
  triggerDelete: (id: number, label: string) => void;
  triggerMakePublic: (id: number, label: string) => void;
  canModify: boolean;
  canAddLinodes: boolean;
  isPublic: boolean;
  // @todo: when we implement StackScripts pagination, we should remove "| string" in the type below.
  // Leaving this in as an escape hatch now, since there's a bunch of code in
  // /LandingPanel that uses different values for categories that we shouldn't
  // change until we're actually using it.
  category: StackScriptCategory | string;
}

export type CombinedProps = Props & WithStyles<ClassNames> & RenderGuardProps;

export const StackScriptRow: React.FC<CombinedProps> = (props) => {
  const {
    classes,
    label,
    description,
    images,
    deploymentsTotal,
    updated,
    stackScriptID,
    stackScriptUsername,
    triggerDelete,
    triggerMakePublic,
    canModify,
    isPublic,
    category,
    canAddLinodes,
  } = props;

  const communityStackScript = category === 'community';

  const renderLabel = () => {
    return (
      <>
        <Link className={classes.link} to={`/stackscripts/${stackScriptID}`}>
          <Typography variant="h3" className={classes.libTitle}>
            {stackScriptUsername && (
              <span
                className={`${classes.libRadioLabel} ${classes.stackScriptUsername}`}
              >
                {stackScriptUsername} /&nbsp;
              </span>
            )}
            <span className={classes.libRadioLabel}>{label}</span>
          </Typography>
        </Link>
        {description && (
          <Typography variant="body1" className={classes.libDescription}>
            {description}
          </Typography>
        )}
      </>
    );
  };

  return (
    <TableRow
      data-qa-table-row={label}
      ariaLabel={label}
      className={classes.row}
    >
      <TableCell className={classes.libTitle} data-qa-stackscript-title>
        {renderLabel()}
      </TableCell>
      <TableCell>
        <Typography data-qa-stackscript-deploys>{deploymentsTotal}</Typography>
      </TableCell>
      <Hidden xsDown>
        <TableCell>
          <Typography data-qa-stackscript-revision>{updated}</Typography>
        </TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell data-qa-stackscript-images className={classes.images}>
          {images.join(',  ')}
        </TableCell>
      </Hidden>
      {communityStackScript ? null : ( // We hide the "Status" column in the "Community StackScripts" tab of the StackScripts landing page since all of those are public.
        <Hidden mdDown>
          <TableCell data-qa-stackscript-status>
            {isPublic ? 'Public' : 'Private'}
          </TableCell>
        </Hidden>
      )}
      <TableCell>
        <StackScriptsActionMenu
          stackScriptID={stackScriptID}
          stackScriptUsername={stackScriptUsername}
          stackScriptLabel={label}
          triggerDelete={triggerDelete}
          triggerMakePublic={triggerMakePublic}
          canModify={canModify}
          canAddLinodes={canAddLinodes}
          isPublic={isPublic}
          category={category}
        />
      </TableCell>
    </TableRow>
  );
};

export default recompose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  withStyles(styles)
)(StackScriptRow);
