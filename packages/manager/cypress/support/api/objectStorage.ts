import { apiCheckErrors, deleteById, getAll, isTestEntity } from './common';
const oauthtoken = Cypress.env('MANAGER_OAUTH');
const apiroot = Cypress.env('REACT_APP_API_ROOT') + '/';

export const getAccessKeys = () => getAll('/object-storage/keys');
export const getBuckets = () => getAll('/object-storage/buckets');

const makeBucketCreateReq = (label, cluster, bucket) => {
  const bucketData = bucket
    ? bucket
    : {
        cluster,
        label
      };

  return cy.request({
    method: 'POST',
    url: Cypress.env('REACT_APP_API_ROOT') + '/object-storage/buckets',
    body: bucketData,
    auth: {
      bearer: oauthtoken
    }
  });
};

export const createBucket = (
  label: string,
  cluster: string,
  bucket = undefined
) => {
  return makeBucketCreateReq(label, cluster, bucket).then(resp => {
    apiCheckErrors(resp);
    console.log(`Created Bucket ${resp.body.label} successfully`, resp);
    return resp.body;
  });
};

export const deleteBucketByLabel = (cluster, bucket) => {
  return cy.request({
    method: 'DELETE',
    url: `${apiroot}/object-storage/buckets/${cluster}/${bucket}`,
    auth: {
      bearer: oauthtoken
    }
  });
};

export const deleteAllTestBuckets = () => {
  getBuckets().then(resp => {
    resp.body.data.forEach(bucket => {
      if (isTestEntity(bucket)) {
        deleteBucketByLabel(bucket['cluster'], bucket.label);
      }
    });
  });
};

export const deleteAccessKeyById = (keyId: number) =>
  deleteById(`object-storage/keys/`, keyId);

export const deleteAllTestAccessKeys = () => {
  getAccessKeys().then(resp => {
    resp.body.data.forEach(key => {
      if (isTestEntity(key)) {
        deleteAccessKeyById(key.id);
      }
    });
  });
};
