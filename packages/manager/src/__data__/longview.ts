import {
  LongviewLoad,
  LongviewSystemInfo
} from 'src/features/Longview/request.types';

export const longviewLoad: LongviewLoad = {
  Load: [
    {
      x: 2,
      y: 2
    }
  ]
};

export const systemInfo: LongviewSystemInfo = {
  SysInfo: {
    type: 'kvm',
    kernel: 'Linux 4.9.0-9-amd64',
    client: '1.1.5',
    os: {
      dist: 'Debian',
      distversion: '9.11'
    },
    arch: 'x86_64',
    cpu: {
      cores: 1,
      type: 'Intel(R) Xeon(R) CPU E5-2680 v3 @ 2.50GHz'
    },
    hostname: 'localhost'
  }
};
