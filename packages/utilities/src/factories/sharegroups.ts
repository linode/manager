import { Factory } from './factoryProxy';

import type {
  AddSharegroupImagesPayload,
  AddSharegroupMemberPayload,
  CreateSharegroupPayload,
  GenerateSharegroupTokenPayload,
  Sharegroup,
  SharegroupImagePayload,
  SharegroupMember,
  SharegroupToken,
  UpdateSharegroupImagePayload,
  UpdateSharegroupMemberPayload,
  UpdateSharegroupPayload,
} from '@linode/api-v4';

export const sharegroupImagePayloadFactory =
  Factory.Sync.makeFactory<SharegroupImagePayload>({
    description: 'A shared image for the sharegroup.',
    id: Factory.each((id) => `private/${id}`),
    label: Factory.each((id) => `sharegroup-image-${id}`),
  });

export const sharegroupFactory = Factory.Sync.makeFactory<Sharegroup>({
  created: new Date().toISOString(),
  description: 'A test sharegroup.',
  expiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
  id: Factory.each((id) => id),
  images_count: 3,
  is_suspended: false,
  label: Factory.each((id) => `sharegroup-${id}`),
  members_count: 2,
  updated: new Date().toISOString(),
  uuid: Factory.each(() => crypto.randomUUID()),
});

export const createSharegroupPayloadFactory =
  Factory.Sync.makeFactory<CreateSharegroupPayload>({
    description: 'A test sharegroup.',
    images: sharegroupImagePayloadFactory.buildList(2),
    label: Factory.each((id) => `sharegroup-${id}`),
  });

export const updateSharegroupPayloadFactory =
  Factory.Sync.makeFactory<UpdateSharegroupPayload>({
    description: 'An updated test sharegroup.',
    disk_id: 1,
    label: Factory.each((id) => `updated-sharegroup-${id}`),
  });

export const addSharegroupImagesPayloadFactory =
  Factory.Sync.makeFactory<AddSharegroupImagesPayload>({
    images: sharegroupImagePayloadFactory.buildList(2),
  });

export const updateSharegroupImagePayloadFactory =
  Factory.Sync.makeFactory<UpdateSharegroupImagePayload>({
    description: 'An updated shared image.',
    label: Factory.each((id) => `updated-sharegroup-image-${id}`),
  });

export const sharegroupMemberFactory =
  Factory.Sync.makeFactory<SharegroupMember>({
    created: new Date().toISOString(),
    expiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    label: Factory.each((id) => `sharegroup-member-${id}`),
    status: 'active',
    token_uuid: Factory.each(() => crypto.randomUUID()),
    updated: new Date().toISOString(),
  });

export const addSharegroupMemberPayloadFactory =
  Factory.Sync.makeFactory<AddSharegroupMemberPayload>({
    label: Factory.each((id) => `sharegroup-member-${id}`),
    token: Factory.each((id) => `sharegroup-token-${id}`),
  });

export const updateSharegroupMemberPayloadFactory =
  Factory.Sync.makeFactory<UpdateSharegroupMemberPayload>({
    label: Factory.each((id) => `updated-sharegroup-member-${id}`),
  });

export const generateSharegroupTokenPayloadFactory =
  Factory.Sync.makeFactory<GenerateSharegroupTokenPayload>({
    label: Factory.each((id) => `sharegroup-token-${id}`),
    valid_for_sharegroup_uuid: Factory.each(() => crypto.randomUUID()),
  });

export const sharegroupTokenFactory = Factory.Sync.makeFactory<SharegroupToken>(
  {
    created: new Date().toISOString(),
    expiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    label: Factory.each((id) => `sharegroup-token-${id}`),
    sharegroup_label: Factory.each((id) => `sharegroup-${id}`),
    sharegroup_uuid: Factory.each(() => crypto.randomUUID()),
    status: 'active',
    token: Factory.each((id) => `token-${id}`),
    token_uuid: Factory.each(() => crypto.randomUUID()),
    updated: new Date().toISOString(),
    valid_for_sharegroup_uuid: Factory.each(() => crypto.randomUUID()),
  },
);
