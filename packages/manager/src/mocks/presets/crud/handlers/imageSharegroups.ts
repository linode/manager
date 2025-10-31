import {
  Image,
  Sharegroup,
  SharegroupMember,
  SharegroupToken,
} from '@linode/api-v4';
import {
  imageFactory,
  imageSharegroupFactory,
  imageSharegroupMemberFactory,
} from '@linode/utilities';
import { DateTime } from 'luxon';
import { http, StrictResponse } from 'msw';

import { mockState } from 'src/dev-tools/load';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { mswDB } from '../../../indexedDB';

import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

const getSharegroupInfo = async (id: number) => {
  const sharegroup = await mswDB.get('imageSharegroups', id);
  if (!sharegroup) {
    return makeNotFoundResponse();
  }

  return makeResponse(sharegroup);
};

const deleteImagesInSharegroup = async (
  id: number,
  imageId: null | string = null
) => {
  const images = await mswDB.getAll('images');

  let imagesToBeDeleted;
  if (!imageId) {
    imagesToBeDeleted = images?.filter(
      (image) => image.image_sharing?.shared_by?.sharegroup_id === id
    );
  } else {
    imagesToBeDeleted = images?.filter(
      (image) =>
        image.image_sharing?.shared_by?.sharegroup_id === id &&
        image.id === imageId
    );
  }

  if (!imagesToBeDeleted || imagesToBeDeleted.length === 0) {
    return;
  }

  const sourcePrivateImageIds = imagesToBeDeleted
    .map((image) => image.image_sharing?.shared_by?.source_image_id)
    .filter((id): id is string => !!id);

  const deleteSharedImagePromises = [];
  const updatePrivateImagePromises = [];

  for (const image of imagesToBeDeleted) {
    deleteSharedImagePromises.push(mswDB.delete('images', image.id, mockState));
  }

  for (const privateImageId of sourcePrivateImageIds) {
    const privateImage = await mswDB.get('images', privateImageId || '');
    if (privateImage) {
      const updatedPrivateImage: Image = {
        ...privateImage,
        updated: DateTime.now().toISO(),
        image_sharing: {
          shared_by: null,
          shared_with: {
            sharegroup_count:
              (privateImage?.image_sharing?.shared_with?.sharegroup_count ||
                1) - 1,
            sharegroup_list:
              privateImage.image_sharing?.shared_with?.sharegroup_list?.filter(
                (sharegroup) => sharegroup !== id
              ) || [],
            sharegroup_list_url: `/images/${privateImage.id}/sharegroups`,
          },
        },
      };
      if (
        updatedPrivateImage.image_sharing?.shared_with?.sharegroup_count === 0
      ) {
        updatedPrivateImage.is_shared = false;
        updatedPrivateImage.image_sharing.shared_with = null;
      }
      updatePrivateImagePromises.push(
        mswDB.update('images', privateImageId, updatedPrivateImage, mockState)
      );
    }
  }
  await Promise.all([
    ...deleteSharedImagePromises,
    ...updatePrivateImagePromises,
  ]);
};

export const getSharegroups = (mockState: MockState) => [
  http.get(
    '*/v4beta/images/sharegroups',
    ({
      request,
    }): StrictResponse<APIErrorResponse | APIPaginatedResponse<Sharegroup>> =>
      makePaginatedResponse({
        data: mockState.imageSharegroups,
        request,
      })
  ),

  http.get(
    '*/v4beta/images/sharegroups/:id',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | Sharegroup>> =>
      await getSharegroupInfo(Number(params.id))
  ),

  http.get(
    `*/v4beta/images/:id/sharegroups`,
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Sharegroup>>
    > => {
      const imageId = String(params.id);
      const image = await mswDB.get('images', imageId);
      const sharegroups = await mswDB.getAll('imageSharegroups');

      if (!image || !sharegroups) {
        return makeNotFoundResponse();
      }

      const sharegroupList = image.image_sharing?.shared_with?.sharegroup_list;

      if (!sharegroupList || sharegroupList.length === 0) {
        return makePaginatedResponse({ data: [], request });
      }

      const filteredSharegroups = sharegroups.filter((sharegroup) =>
        sharegroupList.includes(sharegroup.id)
      );

      return makePaginatedResponse({
        data: filteredSharegroups,
        request,
      });
    }
  ),
];

export const getSharegroupImages = (mockState: MockState) => [
  http.get(
    '*/v4beta/images/sharegroups/:id/images',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Image>>
    > => {
      const sharegroupId = Number(params.id);
      const images = await mswDB.getAll('images');

      if (!images) {
        return makeNotFoundResponse();
      }

      const filteredImages = images.filter(
        (image) =>
          image.image_sharing?.shared_by?.sharegroup_id === sharegroupId
      );

      return makePaginatedResponse({
        data: filteredImages,
        request,
      });
    }
  ),
];

export const getSharegroupMembers = (mockState: MockState) => [
  http.get(
    '*/v4beta/images/sharegroups/:id/members',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<SharegroupMember>>
    > => {
      const sharegroupId = Number(params.id);
      const memberList = await mswDB.get(
        'imageSharegroupMembers',
        sharegroupId
      );
      const members = memberList?.[1];

      if (!memberList || !members) {
        return makeNotFoundResponse();
      }

      return makePaginatedResponse({
        data: members,
        request,
      });
    }
  ),
];

export const getSharegroupTokens = (mockState: MockState) => [
  http.get(
    '*/v4beta/images/sharegroups/tokens',
    ({
      request,
    }): StrictResponse<
      APIErrorResponse | APIPaginatedResponse<SharegroupToken>
    > =>
      makePaginatedResponse({
        data: mockState.imageSharegroupTokens,
        request,
      })
  ),
  http.get(
    '*/v4beta/images/sharegroups/tokens/:token_uuid',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | SharegroupToken>> => {
      const token = await mswDB.get(
        'imageSharegroupTokens',
        String(params.token_uuid)
      );

      if (!token) {
        return makeNotFoundResponse();
      }

      return makeResponse(token);
    }
  ),
];

export const createSharegroup = (mockState: MockState) => [
  http.post(
    '*/v4beta/images/sharegroups',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | Sharegroup>> => {
      const payload = await request.clone().json();
      const imagesPayload = payload?.images ?? [];
      delete payload.images;

      const sharegroup = imageSharegroupFactory.build({
        created: DateTime.now().toISO(),
        updated: DateTime.now().toISO(),
        ...payload,
      });

      const newSharegroupPromise = mswDB.add(
        'imageSharegroups',
        sharegroup,
        mockState
      );

      const createShareImagePromises = [];
      const updatePrivateImagePromises = [];
      for (const image of imagesPayload as Image[]) {
        const newSharedImage = imageFactory.build({
          ...image,
          created: DateTime.now().toISO(),
          image_sharing: {
            shared_with: null,
            shared_by: {
              sharegroup_id: sharegroup.id,
              sharegroup_label: sharegroup.label,
              sharegroup_uuid: sharegroup.uuid,
              source_image_id: image.id,
            },
          },
          id: `shared/${Math.floor(Math.random() * 100)}`,
          type: 'shared',
          updated: DateTime.now().toISO(),
        });

        const privateImageInfo = await mswDB.get('images', image.id);
        const updatedPrivateImage = {
          ...privateImageInfo,
          is_shared: true,
          updated: DateTime.now().toISO(),
          image_sharing: {
            shared_by: null,
            shared_with: {
              sharegroup_count:
                (privateImageInfo?.image_sharing?.shared_with
                  ?.sharegroup_count || 0) + 1,
              sharegroup_list: [
                ...(privateImageInfo?.image_sharing?.shared_with
                  ?.sharegroup_list ?? []),
                sharegroup.id,
              ],
              sharegroup_list_url: `/images/${image.id}/sharegroups`,
            },
          },
        };

        updatePrivateImagePromises.push(
          mswDB.update('images', image.id, updatedPrivateImage, mockState)
        );
        createShareImagePromises.push(
          mswDB.add('images', newSharedImage, mockState)
        );
      }

      await Promise.all([
        newSharegroupPromise,
        ...updatePrivateImagePromises,
        ...createShareImagePromises,
      ]);

      return makeResponse(sharegroup);
    }
  ),
];

export const addSharegroupImages = (mockState: MockState) => [
  http.post(
    `*/v4beta/images/sharegroups/:id/images`,
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Image[]>> => {
      const sharegroupId = String(params.id);
      const sharegroup = await mswDB.get('imageSharegroups', sharegroupId);
      if (!sharegroup) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();

      const newSharedImages = [];
      const createShareImagePromises = [];
      const updateImagePromises = [];
      for (const image of payload.images as Image[]) {
        const newSharedImage = imageFactory.build({
          ...image,
          created: DateTime.now().toISO(),
          image_sharing: {
            shared_with: null,
            shared_by: {
              sharegroup_id: sharegroup.id,
              sharegroup_label: sharegroup.label,
              sharegroup_uuid: sharegroup.uuid,
              source_image_id: image.id,
            },
          },
          id: `shared/${Math.floor(Math.random() * 100)}`,
          type: 'shared',
          updated: DateTime.now().toISO(),
        });

        const privateImageInfo = await mswDB.get('images', image.id);
        const updatedPrivateImage = {
          ...privateImageInfo,
          is_shared: true,
          updated: DateTime.now().toISO(),
          image_sharing: {
            shared_by: null,
            shared_with: {
              sharegroup_count:
                (privateImageInfo?.image_sharing?.shared_with
                  ?.sharegroup_count || 0) + 1,
              sharegroup_list: [
                ...(privateImageInfo?.image_sharing?.shared_with
                  ?.sharegroup_list ?? []),
                sharegroup.id,
              ],
              sharegroup_list_url: `/images/${image.id}/sharegroups`,
            },
          },
        };

        newSharedImages.push(newSharedImage);
        updateImagePromises.push(
          mswDB.update('images', image.id, updatedPrivateImage, mockState)
        );
        createShareImagePromises.push(
          mswDB.add('images', newSharedImage, mockState)
        );
      }

      await Promise.all([...updateImagePromises, ...createShareImagePromises]);

      const updatedSharegroup = {
        ...sharegroup,
        images_count: (sharegroup.images_count || 0) + 1,
      };

      await mswDB.update(
        'imageSharegroups',
        sharegroupId,
        updatedSharegroup,
        mockState
      );

      return makeResponse(newSharedImages);
    }
  ),
];

export const addSharegroupMembers = (mockState: MockState) => [
  http.post(
    `*/v4beta/images/sharegroups/:id/members`,
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | SharegroupMember[]>> => {
      const sharegroupId = Number(params.id);
      const sharegroup = await mswDB.get('imageSharegroups', sharegroupId);
      const sharegroupMembers = await mswDB.get(
        'imageSharegroupMembers',
        sharegroupId
      );
      const userTokens = await mswDB.getAll('imageSharegroupTokens');

      const validToken = userTokens?.map((token) => token.token) || [];

      if (!sharegroup || !validToken) {
        return makeNotFoundResponse();
      }

      const updatedUserToken = {
        ...validToken,
        sharegroup_uuid: sharegroup.uuid,
        sharegroup_label: sharegroup.label,
        status: 'active',
        updated: DateTime.now().toISO(),
      };

      await mswDB.update(
        'imageSharegroupTokens',
        sharegroup.id,
        updatedUserToken,
        mockState
      );

      const payload = await request.clone().json();

      const newMembers = [];
      const oldMembers = sharegroupMembers?.[1] || [];
      for (const member of payload.members as SharegroupMember[]) {
        const newMember = imageSharegroupMemberFactory.build({
          ...member,
          created: DateTime.now().toISO(),
          updated: DateTime.now().toISO(),
        });

        newMembers.push(newMember);
      }

      await mswDB.update(
        'imageSharegroupMembers',
        sharegroupId,
        [sharegroupId, [...oldMembers, ...newMembers]],
        mockState
      );

      const updatedSharegroup = {
        ...sharegroup,
        members_count: (sharegroup.members_count || 0) + 1,
      };

      await mswDB.update(
        'imageSharegroups',
        sharegroupId,
        updatedSharegroup,
        mockState
      );

      return makeResponse(newMembers);
    }
  ),
];

export const generateSharegroupToken = (mockState: MockState) => [
  http.post(
    '*/v4beta/images/sharegroups/tokens',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | SharegroupToken>> => {
      const payload = await request.clone().json();
      const token: SharegroupToken = {
        ...payload,
        status: 'pending',
        created: DateTime.now().toISO(),
        updated: DateTime.now().toISO(),
        expiry: DateTime.now().plus({ days: 1 }).toISO(),
        token: Math.random().toString(36).substring(2, 15),
      };

      await mswDB.add('imageSharegroupTokens', token, mockState);

      return makeResponse(token);
    }
  ),
];

export const updateSharegroup = (mockState: MockState) => [
  http.put(
    '*/v4beta/images/sharegroups/:id',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Sharegroup>> => {
      const sharegroupId = String(params.id);
      const sharegroup = await mswDB.get('imageSharegroups', sharegroupId);

      if (!sharegroup) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();
      const updatedSharegroup = {
        ...payload,
        ...sharegroup,
      };

      mswDB.update(
        'imageSharegroups',
        sharegroupId,
        updatedSharegroup,
        mockState
      );

      return makeResponse(updatedSharegroup);
    }
  ),
];

export const updateSharegroupImage = (mockState: MockState) => [
  http.put(
    '*/v4beta/images/sharegroups/:id/images/:imageId',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Image>> => {
      const sharegroupId = Number(params.id);
      const imageId = String(params.imageId);
      const sharegroup = await mswDB.get('imageSharegroups', sharegroupId);
      const image = await mswDB.get('images', imageId);

      if (!sharegroup || !image) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();
      const updatedImage = {
        ...image,
        ...payload,
      };

      mswDB.update('images', imageId, updatedImage, mockState);

      return makeResponse(updatedImage);
    }
  ),
];

export const updateSharegroupMember = (mockState: MockState) => [
  http.put(
    '*/v4beta/images/sharegroups/:id/members/:token_uuid',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | SharegroupMember>> => {
      const sharegroupId = Number(params.id);
      const memberTokenId = String(params.token_uuid);
      const sharegroup = await mswDB.get('imageSharegroups', sharegroupId);
      const sharegroupMembers = await mswDB.get(
        'imageSharegroupMembers',
        sharegroupId
      );

      if (!sharegroup || !sharegroupMembers) {
        return makeNotFoundResponse();
      }

      const members = sharegroupMembers[1];
      const memberIndex = members.findIndex(
        (m) => m.token_uuid === memberTokenId
      );

      if (memberIndex === -1) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();
      const updatedMember = {
        ...members[memberIndex],
        ...payload,
      };

      members[memberIndex] = updatedMember;

      await mswDB.update(
        'imageSharegroupMembers',
        sharegroupId,
        [sharegroupId, members],
        mockState
      );

      return makeResponse(updatedMember);
    }
  ),
];

export const updateSharegroupToken = (mockState: MockState) => [
  http.put(
    '*/v4beta/images/sharegroups/tokens/:token_uuid',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | SharegroupToken>> => {
      const token_uuid = String(params.token_uuid);
      const token = await mswDB.get('imageSharegroupTokens', token_uuid);

      if (!token) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();
      const updatedToken = {
        ...token,
        ...payload,
      };

      mswDB.update(
        'imageSharegroupTokens',
        token_uuid,
        updatedToken,
        mockState
      );

      return makeResponse(updatedToken);
    }
  ),
];

export const deleteSharegroup = (mockState: MockState) => [
  http.delete(
    '*/v4beta/images/sharegroups/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const sharegroupId = Number(params.id);
      const sharegroup = await mswDB.get('imageSharegroups', sharegroupId);

      if (!sharegroup) {
        return makeNotFoundResponse();
      }

      await deleteImagesInSharegroup(sharegroupId);

      await mswDB.delete(
        'imageSharegroupMembers',
        Number(sharegroupId),
        mockState
      );
      await mswDB.delete('imageSharegroups', sharegroupId, mockState);

      return makeResponse({});
    }
  ),
];

export const deleteSharegroupImages = (mockState: MockState) => [
  http.delete(
    '*/v4beta/images/sharegroups/:id/images/:imageId',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const sharegroupId = Number(params.id);
      const imageId = String(params.imageId);
      const sharegroup = await mswDB.get('imageSharegroups', sharegroupId);

      if (!sharegroup) {
        return makeNotFoundResponse();
      }

      await deleteImagesInSharegroup(sharegroupId, imageId);

      const updatedSharegroup = {
        ...sharegroup,
        images_count: (sharegroup.images_count || 1) - 1,
      };

      await mswDB.update(
        'imageSharegroups',
        sharegroupId,
        updatedSharegroup,
        mockState
      );

      return makeResponse({});
    }
  ),
];

export const deleteSharegroupMember = (mockState: MockState) => [
  http.delete(
    '*/v4beta/images/sharegroups/:id/members/:token_uuid',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const sharegroupId = Number(params.id);
      const token_uuid = String(params.token_uuid);
      const sharegroup = await mswDB.get('imageSharegroups', sharegroupId);

      if (!sharegroup) {
        return makeNotFoundResponse();
      }

      const sharegroupMembers = await mswDB.get(
        'imageSharegroupMembers',
        sharegroupId
      );

      const updatedMembers =
        sharegroupMembers?.[1]?.filter(
          (mem) => mem.token_uuid !== token_uuid
        ) || [];

      await mswDB.update(
        'imageSharegroupMembers',
        sharegroupId,
        [sharegroupId, updatedMembers],
        mockState
      );

      const updatedSharegroup = {
        ...sharegroup,
        members_count: (sharegroup.members_count || 0) - 1,
      };

      await mswDB.update(
        'imageSharegroups',
        sharegroupId,
        updatedSharegroup,
        mockState
      );

      return makeResponse({});
    }
  ),
];

export const deleteSharegroupToken = (mockState: MockState) => [
  http.delete(
    '*/v4beta/images/sharegroups/tokens/:token_uuid',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const token_uuid = String(params.token_uuid);

      const token = await mswDB.get('imageSharegroupTokens', token_uuid);
      if (!token) {
        return makeNotFoundResponse();
      }

      await mswDB.delete('imageSharegroupTokens', token_uuid, mockState);

      return makeResponse({});
    }
  ),
];
