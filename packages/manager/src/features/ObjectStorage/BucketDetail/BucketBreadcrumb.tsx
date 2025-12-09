import { useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { useWindowDimensions } from 'src/hooks/useWindowDimensions';

import { prefixArrayToString } from '../utilities';
import {
  StyledCopyTooltip,
  StyledLink,
  StyledPrefixWrapper,
  StyledRootContainer,
  StyledSlash,
} from './BucketBreadcrumb.styles';

interface Props {
  bucketName: string;
  prefix: string;
}

export const BucketBreadcrumb = (props: Props) => {
  const { bucketName, prefix } = props;
  const navigate = useNavigate();
  const { clusterId } = useParams({
    from: '/object-storage/buckets/$clusterId/$bucketName',
  });
  const { width } = useWindowDimensions();
  const bucketPath = bucketName + '/' + prefix;

  // Split the prefix into discrete sections for displaying in the component.
  // 'my/path/to/objects/` > ['my', 'path', 'to', 'objects]
  const prefixArray = prefix.split('/').filter((section) => section !== '');

  // This is not a very elegant way to truncate the prefix. In the future we
  // could take into account both the length of the prefix string AND the prefix
  // array (the number of sections). @todo: Intelligent breadcrumbs.
  const shouldTruncatePrefix =
    (width <= 600 && prefixArray.length >= 3) || prefixArray.length > 5;

  return (
    <StyledRootContainer>
      <StyledPrefixWrapper>
        {/* Bucket name */}
        <StyledLink
          onClick={() => {
            navigate({
              to: '/object-storage/buckets/$clusterId/$bucketName',
              params: { clusterId, bucketName },
              search: { prefix: '' },
            });
          }}
          variant="body1"
        >
          {bucketName}
        </StyledLink>
        {/* Ellipsis (if prefix is truncated) */}
        {shouldTruncatePrefix && (
          <StyledSlash variant="body1">/ ...</StyledSlash>
        )}

        {/* Mapped prefix */}
        {prefixArray.map((prefixSection, idx) => {
          if (shouldTruncatePrefix && idx < prefixArray.length - 3) {
            return null;
          }
          return (
            <React.Fragment key={idx}>
              <StyledSlash variant="body1">/</StyledSlash>
              <StyledLink
                onClick={() => {
                  // If clicking the last crumb, don't do anything (we're
                  // already on the correct level).
                  if (idx === prefixArray.length - 1) {
                    return;
                  }

                  const prefixString = prefixArrayToString(prefixArray, idx);
                  navigate({
                    to: '/object-storage/buckets/$clusterId/$bucketName',
                    params: { clusterId, bucketName },
                    search: { prefix: prefixString },
                  });
                }}
                variant="body1"
              >
                {prefixSection}
              </StyledLink>
            </React.Fragment>
          );
        })}
      </StyledPrefixWrapper>
      <StyledCopyTooltip placement="bottom" text={bucketPath} />
    </StyledRootContainer>
  );
};
