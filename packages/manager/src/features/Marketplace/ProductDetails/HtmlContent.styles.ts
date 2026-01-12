import { styled } from '@mui/material/styles';

/**
 * Styled container for rendering HTML content from the API
 * This provides consistent styling for all HTML elements across tabs
 */
export const StyledHtmlContent = styled('div')(({ theme }) => ({
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.borderColors.borderTable}`,
    fontStyle: 'italic',
    margin: '16px 0',
    paddingLeft: theme.spacingFunction(16),
  },
  '& code': {
    backgroundColor: theme.bg.offWhite,
    borderRadius: '3px',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '0.875rem',
    padding: '2px 6px',
  },
  '& h1': {
    color: theme.textColors.headlineStatic,
    fontFamily: theme.font.bold,
    fontSize: '1.75rem',
    lineHeight: '2rem',
    marginBottom: theme.spacingFunction(16),
    marginTop: theme.spacingFunction(24),
  },
  '& h2': {
    color: theme.textColors.headlineStatic,
    fontFamily: theme.font.bold,
    fontSize: '1.5rem',
    lineHeight: '1.75rem',
    marginBottom: theme.spacingFunction(16),
    marginTop: theme.spacingFunction(20),
  },
  '& h3': {
    color: theme.textColors.headlineStatic,
    fontFamily: theme.font.bold,
    fontSize: '1.25rem',
    lineHeight: '1.5rem',
    marginBottom: theme.spacingFunction(12),
    marginTop: theme.spacingFunction(16),
  },
  '& h4, & h5, & h6': {
    color: theme.textColors.headlineStatic,
    fontFamily: theme.font.bold,
    fontSize: '1rem',
    lineHeight: '1.25rem',
    marginBottom: theme.spacingFunction(8),
    marginTop: theme.spacingFunction(12),
  },
  '& img': {
    display: 'block',
    height: 'auto',
    margin: '16px 0',
    maxWidth: '100%',
  },
  '& li': {
    color: theme.textColors.tableStatic,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    marginBottom: theme.spacingFunction(4),
  },
  '& ol': {
    listStyleType: 'decimal',
    marginBottom: theme.spacingFunction(16),
    marginTop: theme.spacingFunction(8),
    paddingLeft: theme.spacingFunction(32),
  },
  '& p': {
    color: theme.textColors.tableStatic,
    fontFamily: theme.font.normal,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    marginBottom: theme.spacingFunction(16),
    marginTop: 0,
  },
  '& pre': {
    backgroundColor: theme.bg.offWhite,
    borderRadius: '4px',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '0.875rem',
    margin: '16px 0',
    overflowX: 'auto',
    padding: theme.spacingFunction(16),
  },
  '& strong': {
    fontFamily: theme.font.bold,
  },
  '& table': {
    borderCollapse: 'collapse',
    marginBottom: theme.spacingFunction(16),
    marginTop: theme.spacingFunction(16),
    width: '100%',
  },
  '& td': {
    border: `1px solid ${theme.borderColors.borderTable}`,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    padding: theme.spacingFunction(12),
  },
  '& th': {
    backgroundColor: theme.bg.tableHeader,
    border: `1px solid ${theme.borderColors.borderTable}`,
    color: theme.textColors.headlineStatic,
    fontFamily: theme.font.bold,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    padding: theme.spacingFunction(12),
    textAlign: 'left',
  },
  '& ul': {
    listStyleType: 'disc',
    marginBottom: theme.spacingFunction(16),
    marginTop: theme.spacingFunction(8),
    paddingLeft: theme.spacingFunction(32),
  },
  color: theme.textColors.tableStatic,
  fontFamily: theme.font.normal,
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  wordBreak: 'break-word',
}));
