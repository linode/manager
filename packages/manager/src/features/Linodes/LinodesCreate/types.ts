import type { Image } from '@linode/api-v4/lib/images';
import type {
  CreateLinodeRequest,
  Linode,
  LinodeTypeClass,
} from '@linode/api-v4/lib/linodes';
import type { Region } from '@linode/api-v4/lib/regions';
import type {
  StackScript,
  UserDefinedField,
} from '@linode/api-v4/lib/stackscripts';
import type { APIError } from '@linode/api-v4/lib/types';
import type { Tag } from 'src/components/TagsInput/TagsInput';
import type { ExtendedType } from 'src/utilities/extendType';

/**
 * Pure Data without the loading and error
 * keys. Component with these props have already been
 * safe-guarded with null, loading, and error checking
 */
export interface WithTypesRegionsAndImages {
  imagesData: Record<string, Image>;
  regionsData: Region[];
  typesData?: ExtendedType[];
}

export interface WithLinodesTypesRegionsAndImages
  extends WithTypesRegionsAndImages {
  linodesData: Linode[];
}

export interface ReduxStateProps {
  accountBackupsEnabled: boolean;
  userCannotCreateLinode: boolean;
}

export type HandleSubmit = (
  payload: CreateLinodeRequest,
  linodeID?: number
) => void;

export type LinodeCreateValidation = (payload: CreateLinodeRequest) => void;

export interface BasicFromContentProps {
  disabledClasses?: LinodeTypeClass[];
  errors?: APIError[];
  regionHelperText?: string;
  selectedImageID?: string;
  selectedRegionID?: string;
  selectedTypeID?: string;
  updateImageID: (id: string) => void;
  updateRegionID: (id: string) => void;
  updateTypeID: (id: string) => void;
}

/**
 * minimum number of state and handlers needed for
 * the _create from image_ flow to function
 */
export interface BaseFormStateAndHandlers {
  authorized_users: string[];
  backupsEnabled: boolean;
  disabledClasses?: LinodeTypeClass[];
  errors?: APIError[];
  formIsSubmitting: boolean;
  handleSubmitForm: HandleSubmit;
  label: string;
  password: string;
  privateIPEnabled: boolean;
  regionHelperText?: string;
  resetCreationState: () => void;
  selectedImageID?: string;
  selectedRegionID?: string;
  selectedTypeID?: string;
  setAuthorizedUsers: (usernames: string[]) => void;
  tags?: Tag[];
  toggleBackupsEnabled: () => void;
  togglePrivateIPEnabled: () => void;
  updateImageID: (id: string) => void;
  updateLabel: (label: string) => void;
  updatePassword: (password: string) => void;
  updateRegionID: (id: string) => void;
  updateTags: (tags: Tag[]) => void;
  updateTypeID: (id: string) => void;
}

/**
 * additional form fields needed when creating a Linode from a Linode
 * AKA cloning a Linode
 */
export interface CloneFormStateHandlers extends BasicFromContentProps {
  selectedDiskSize?: number;
  selectedLinodeID?: number;
  updateDiskSize: (id: number) => void;
  updateLinodeID: (id: number, diskSize?: number) => void;
  updateTypeID: (id: null | string) => void;
}

/**
 * additional form fields needed when creating a Linode from a StackScript
 */
export interface StackScriptFormStateHandlers extends BasicFromContentProps {
  availableStackScriptImages?: Image[];
  availableUserDefinedFields?: UserDefinedField[];
  handleSelectUDFs: (stackScripts: any) => void;
  selectedStackScriptID?: number;
  selectedStackScriptLabel?: string;
  selectedStackScriptUsername?: string;
  selectedUDFs?: any;
  updateStackScript: (
    id: number,
    label: string,
    username: string,
    userDefinedFields: UserDefinedField[],
    availableImages: Image[],
    defaultData?: any
  ) => void;
}

/**
 * additional form fields needed when create a Linode from a backup
 * Note that it extends the _Clone_ props because creating from a backup
 * requires the Linodes data
 */
export interface BackupFormStateHandlers extends CloneFormStateHandlers {
  selectedBackupID?: number;
  setBackupID: (id: number) => void;
}

export interface AppsData {
  appInstances?: StackScript[];
  appInstancesError?: string;
  appInstancesLoading: boolean;
}

export type AllFormStateAndHandlers = BaseFormStateAndHandlers &
  CloneFormStateHandlers &
  StackScriptFormStateHandlers &
  BackupFormStateHandlers;

export type LinodeCreateType =
  | 'Backups'
  | 'Clone Linode'
  | 'Images'
  | 'OS'
  | 'One-Click'
  | 'StackScripts';
