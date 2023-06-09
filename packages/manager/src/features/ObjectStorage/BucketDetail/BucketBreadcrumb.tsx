import * as React from 'react';
import copy from 'copy-to-clipboard';
import { prefixArrayToString } from '../utilities';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';
import {
  StyledCopied,
  StyledFileCopy,
  StyledLink,
  StyledPrefixWrapper,
  StyledRootContainer,
  StyledSlash,
} from './BucketBreadcrumb.styles';

interface Props {
  prefix: string;
  history: any;
  bucketName: string;
}

export const BucketBreadcrumb = (props: Props) => {
  const [copied, setCopied] = React.useState<boolean>(false);
  let timeout: ReturnType<typeof setTimeout>;
  const iconOnClick = (value: string) => {
    setCopied(!copied);
    timeout = setTimeout(() => setCopied(false), 1500);
    copy(value);
  };
  const { prefix, bucketName, history } = props;
  const { width } = useWindowDimensions();

  React.useEffect(() => {
    return () => clearTimeout(timeout);
  }, []);

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
      {copied && <StyledCopied data-qa-copied>Copied!</StyledCopied>}
      <StyledFileCopy onClick={() => iconOnClick(bucketName + '/' + prefix)} />
      <StyledPrefixWrapper>
        {/* Bucket name */}
        <StyledLink
          variant="body1"
          onClick={() => {
            history.push({ search: '?prefix=' });
          }}
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
                variant="body1"
                onClick={() => {
                  // If clicking the last crumb, don't do anything (we're
                  // already on the correct level).
                  if (idx === prefixArray.length - 1) {
                    return;
                  }

                  const prefixString = prefixArrayToString(prefixArray, idx);
                  history.push({ search: '?prefix=' + prefixString });
                }}
              >
                {prefixSection}
              </StyledLink>
            </React.Fragment>
          );
        })}
      </StyledPrefixWrapper>
    </StyledRootContainer>
  );
};
