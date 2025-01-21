import {
  createDomainRecord,
  updateDomainRecord,
} from '@linode/api-v4/lib/domains';
import { Notice } from '@linode/ui';
import { path, pathOr } from 'ramda';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { scrollErrorIntoViewV2 } from 'src/utilities/scrollErrorIntoViewV2';

import { isValidCNAME, isValidDomainRecord } from '../../domainUtils';
import {
  castFormValuesToNumeric,
  defaultFieldsState,
  filterDataByType,
  modeMap,
  resolveAlias,
  typeMap,
} from './DomainRecordDrawerUtils';
import { getDomainRecordDrawerTypes } from './getDomainRecordDrawerTypes';

import type {
  Domain,
  DomainRecord,
  DomainType,
  RecordType,
  UpdateDomainPayload,
} from '@linode/api-v4/lib/domains';
import type { APIError } from '@linode/api-v4/lib/types';

interface UpdateDomainDataProps extends UpdateDomainPayload {
  id: number;
}

export interface DomainRecordDrawerProps
  extends Partial<Omit<DomainRecord, 'type'>>,
    Partial<Omit<Domain, 'type'>> {
  domain: string;
  domainId: number;
  /**
   * Used to populate fields on edits.
   */
  id?: number;
  mode: 'create' | 'edit';
  onClose: () => void;
  open: boolean;
  records: DomainRecord[];
  type: DomainType | RecordType;

  updateDomain: (data: UpdateDomainDataProps) => Promise<Domain>;
  updateRecords: () => void;
}

interface EditableSharedFields {
  ttl_sec?: number;
}
export interface EditableRecordFields extends EditableSharedFields {
  name?: string;
  port?: string;
  priority?: string;
  protocol?: null | string;
  service?: null | string;
  tag?: null | string;
  target?: string;
  weight?: string;
}

export interface EditableDomainFields extends EditableSharedFields {
  axfr_ips?: string[];
  description?: string;
  domain?: string;
  expire_sec?: number;
  refresh_sec?: number;
  retry_sec?: number;
  soa_email?: string;
  ttl_sec?: number;
}

export const DomainRecordDrawer = (props: DomainRecordDrawerProps) => {
  const { mode, open, records, type } = props;

  // const errorFields = {
  //   axfr_ips: 'domain transfers',
  //   domain: 'domain',
  //   expire_sec: 'expire rate',
  //   name: 'name',
  //   port: 'port',
  //   priority: 'priority',
  //   protocol: 'protocol',
  //   refresh_sec: 'refresh rate',
  //   retry_sec: 'retry rate',
  //   service: 'service',
  //   soa_email: 'SOA email address',
  //   tag: 'tag',
  //   target: 'target',
  //   ttl_sec: 'ttl_sec',
  //   type: 'type',
  //   weight: 'weight',
  // };

  const formContainerRef = React.useRef<HTMLFormElement>(null);

  const defaultValues = defaultFieldsState(props);

  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
    reset,
    setError,
  } = useForm<Partial<EditableDomainFields | EditableRecordFields>>({
    defaultValues,
    mode: 'onBlur',
    values: defaultValues,
  });

  const types = getDomainRecordDrawerTypes(props, control);

  const { fields } = types[type];
  const isCreating = mode === 'create';
  const isDomain = type === 'master' || type === 'slave';

  // If there are no A/AAAA records and a user tries to add an NS record, they'll see a warning message asking them to add an A/AAAA record.
  const hasARecords = records.find((thisRecord) =>
    ['A', 'AAAA'].includes(thisRecord.type)
  );

  const noARecordsNoticeText =
    'Please create an A/AAAA record for this domain to avoid a Zone File invalidation.';

  // @todo: [Purvesh] - Need to handle other errors
  // const otherErrors = [
  //   getAPIErrorFor({}, state.errors)('_unknown'),
  //   getAPIErrorFor({}, state.errors)('none'),
  // ].filter(Boolean);

  const handleRecordSubmissionSuccess = () => {
    props.updateRecords();
    handleClose();
  };

  const handleSubmissionErrors = (errorResponse: APIError[]) => {
    const errors = getAPIErrorOrDefault(errorResponse);

    for (const error of errors) {
      const errorField = error.field as
        | keyof EditableDomainFields
        | keyof EditableRecordFields
        | undefined;

      if (errorField) {
        setError(errorField, {
          message: error.reason,
        });
      } else {
        setError('root', { message: error.reason });
      }

      scrollErrorIntoViewV2(formContainerRef);
    }
  };

  const onDomainEdit = async (formData: EditableDomainFields) => {
    const { domainId, type, updateDomain } = props;

    const data = {
      ...filterDataByType(formData, type),
    } as Partial<EditableDomainFields>;

    if (data.axfr_ips) {
      /**
       * Don't submit blank strings to the API.
       * Also trim the resulting array, since '192.0.2.0, 192.0.2.1'
       * will submit ' 192.0.2.1', which is an invalid value.
       */
      data.axfr_ips = data.axfr_ips
        .filter((ip) => ip !== '')
        .map((ip) => ip.trim());
    }

    await updateDomain({ id: domainId, ...data, status: 'active' })
      .then(() => {
        handleClose();
      })
      .catch(handleSubmissionErrors);
  };

  const onRecordCreate = async (formData: EditableRecordFields) => {
    const { domain, records, type } = props;

    /** Appease TS ensuring we won't use it during Record create. */
    if (type === 'master' || type === 'slave') {
      return;
    }

    const _data = {
      type,
      ...filterDataByType(formData, type),
    };

    // Expand @ to the Domain in appropriate fields
    let data = resolveAlias(_data, domain, type);
    // Convert string values to numeric, replacing '' with undefined
    data = castFormValuesToNumeric(data);

    /**
     * Validation
     *
     * This should be done on the API side, but several breaking
     * configurations will currently succeed on their end.
     */
    const _domain = data?.name ?? '';
    const invalidCNAME =
      data.type === 'CNAME' && !isValidCNAME(_domain, records);

    if (!isValidDomainRecord(_domain, records) || invalidCNAME) {
      const error = {
        field: 'name',
        reason: 'Record conflict - CNAMES must be unique',
      };
      handleSubmissionErrors([error]);
      return;
    }

    await createDomainRecord(props.domainId, data)
      .then(handleRecordSubmissionSuccess)
      .catch(handleSubmissionErrors);
  };

  const onRecordEdit = async (formData: EditableRecordFields) => {
    const { domain, domainId, id, type } = props;
    const fields = formData;

    /** Appease TS ensuring we won't use it during Record create. */
    if (type === 'master' || type === 'slave' || !id) {
      return;
    }

    const _data = {
      ...filterDataByType(fields, type),
    };

    // Expand @ to the Domain in appropriate fields
    let data = resolveAlias(_data, domain, type);
    // Convert string values to numeric, replacing '' with undefined
    data = castFormValuesToNumeric(data);
    await updateDomainRecord(domainId, id, data)
      .then(handleRecordSubmissionSuccess)
      .catch(handleSubmissionErrors);
  };

  const handleClose = () => {
    reset();
    props.onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    if (isDomain) {
      await onDomainEdit(data);
    } else if (isCreating) {
      await onRecordCreate(data);
    } else {
      await onRecordEdit(data);
    }
  });

  return (
    <Drawer
      onClose={handleClose}
      open={open}
      title={`${path([mode], modeMap)} ${path([type], typeMap)} Record`}
    >
      <form onSubmit={onSubmit} ref={formContainerRef}>
        {/* {otherErrors.length > 0 &&
          otherErrors.map((err, index) => {
            return <Notice key={index} text={err} variant="error" />;
          })} */}
        {!hasARecords && type === 'NS' && (
          <Notice
            spacingTop={8}
            text={noARecordsNoticeText}
            variant="warning"
          />
        )}
        {fields.map((field, idx) =>
          field && typeof field === 'function' ? field(idx) : null
        )}
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'save',
            disabled: isSubmitting,
            label: 'Save',
            loading: isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: handleClose,
          }}
        />
      </form>
    </Drawer>
  );
};
