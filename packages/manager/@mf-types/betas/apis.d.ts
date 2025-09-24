
    export type RemoteKeys = 'betas/app';
    type PackageType<T> = T extends 'betas/app' ? typeof import('betas/app') :any;