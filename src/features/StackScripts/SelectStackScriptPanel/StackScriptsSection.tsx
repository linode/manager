import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import SelectionRow from 'src/components/SelectionRow';
import { formatDate } from 'src/utilities/format-date-iso8601';
import stripImageName from 'src/utilities/stripImageName';
import truncateText from 'src/utilities/truncateText';

type ClassNames = 'root' | 'loadingWrapper';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  loadingWrapper: {
    border: 0,
    paddingTop: 100,
  },
});

export interface Props {
  onSelect?: (s: Linode.StackScript.Response) => void;
  selectedId?: number;
  data: Linode.StackScript.Response[];
  isSorting: boolean;
  publicImages: Linode.Image[];
  triggerDelete: (id: number, label: string) => void;
  triggerMakePublic: (id: number, label: string) => void;
  currentUser: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const StackScriptsSection: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    onSelect,
    selectedId,
    data,
    isSorting,
    classes,
  } = props;

  const selectStackScript = (s: Linode.StackScript.Response) => (
    <SelectionRow
      key={s.id}
      label={s.label}
      stackScriptUsername={s.username}
      description={truncateText(s.description, 100)}
      isPublic={s.is_public}
      images={stripImageName(s.images)}
      deploymentsActive={s.deployments_active}
      updated={formatDate(s.updated, false)}
      onSelect={() => onSelect!(s)}
      checked={selectedId === s.id}
      updateFor={[selectedId === s.id]}
      stackScriptID={s.id}
      canDelete={false}
      canEdit={false}
    />
  )

  return (
    <TableBody>
      {!isSorting
        ? data && data
          .map(selectStackScript)
        : <TableRow>
          <TableCell colSpan={5} className={classes.loadingWrapper}>
            <CircleProgress noTopMargin/>
          </TableCell>
        </TableRow>
      }
    </TableBody>
  );
};

const styled = withStyles(styles);

export default styled(StackScriptsSection) as React.StatelessComponent<Props>;
