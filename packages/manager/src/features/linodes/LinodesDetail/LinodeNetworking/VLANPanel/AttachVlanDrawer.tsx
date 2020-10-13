import * as React from 'react';

import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import ActionsPanel from 'src/components/ActionsPanel';
import Notice from 'src/components/Notice';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import EnhancedSelect from 'src/components/EnhancedSelect/Select';
import Button from 'src/components/Button';
import { getLinodeConfigs } from 'src/store/linodes/config/config.requests';
import { useDispatch } from 'react-redux';
import { attachVlan } from '@linode/api-v4/lib/vlans';
import { VlanData } from './LinodeVLANs';

const useStyles = makeStyles(() => ({
  actionsPanel: {
    marginTop: 8
  }
}));

interface Props {
  open: boolean;
  closeDrawer: () => void;
  error: string | null;
  linodeLabel: string;
  linodeId: number;
  vlans: any;
  onClose: () => void;
  readOnly: boolean;
  resetInterfaces: () => void;
}

export type CombinedProps = Props;

export const AttachVlanDrawer: React.FC<CombinedProps> = props => {
  const {
    error,
    closeDrawer,
    open,
    linodeLabel,
    linodeId,
    vlans,
    onClose,
    readOnly,
    resetInterfaces
  } = props;

  const classes = useStyles();
  const dispatch = useDispatch();

  const [selected, setSelected] = React.useState<number | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(error);

  React.useEffect(() => {
    if (open) {
      setSelected(null);
      setErrorMessage('');
    }
  }, [open]);

  const vlansValues: VlanData[] = Object.values(vlans);
  const vlanOptions: { value: number; label: string }[] = [];

  vlansValues.forEach(vlanValue => {
    vlanOptions.push({
      value: vlanValue.id,
      label:
        vlanValue.description.length > 0
          ? vlanValue.description
          : `vlan-${vlanValue.id}`
    });
  });

  const disabled = !selected || readOnly;

  const handleAttach = () => {
    setSubmitting(true);

    attachVlan(selected, [linodeId])
      .then(_ => {
        setSubmitting(false);
        dispatch(getLinodeConfigs({ linodeId }));
        resetInterfaces();
        onClose();
      })
      .catch(errResponse => {
        setSubmitting(false);
        setErrorMessage(getErrorStringOrDefault(errResponse));
      });
  };

  return (
    <Drawer title={'Attach a VLAN'} open={open} onClose={closeDrawer}>
      <Typography variant="h2">{linodeLabel}</Typography>
      {errorMessage && <Notice error text={errorMessage} spacingTop={8} />}
      <EnhancedSelect
        name={'VLAN'}
        label="VLAN"
        placeholder="Select a VLAN"
        value={vlanOptions.find(thisOption => thisOption.value === selected)}
        options={vlanOptions}
        onChange={(_selected: { value: number; label: string }) =>
          setSelected(_selected.value)
        }
        isClearable={false}
      />
      <ActionsPanel className={classes.actionsPanel}>
        <Button
          buttonType="primary"
          onClick={handleAttach}
          disabled={disabled}
          style={{ marginBottom: 8 }}
          loading={submitting}
        >
          Attach
        </Button>
        <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
          Close
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

export default AttachVlanDrawer;
