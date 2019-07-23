import { shallow } from 'enzyme';
import * as React from 'react';

import { BlogDashboardCard, BlogItem } from './BlogDashboardCard';

const mockData: BlogItem[] = [
  {
    description: 'Apostrophe &#8217;',
    link: 'linode.com',
    title: 'Blog post&#8230;'
  },
  {
    description: 'Right quotation mark &#8221;',
    link: 'linode.com',
    title: 'Blog Post&#8212;'
  }
];

describe('BlogDashboardCard', () => {
  const wrapper = shallow(
    <BlogDashboardCard classes={{ root: '', itemTitle: '' }} />
  );

  wrapper.setState({
    loading: false,
    items: mockData
  });

  it('renders a BlogItem for each item in state', () => {
    expect(wrapper.find('[data-qa-blog-post]')).toHaveLength(mockData.length);
  });

  it('renders links with correct href value', () => {
    expect(
      wrapper
        .find('[data-qa-blog-post]')
        .at(0)
        .prop('href')
    ).toBe(mockData[0].link);
  });

  it('decodes HTML encoded symbols in the description', () => {
    expect(
      wrapper
        .find('[data-qa-post-desc]')
        .at(0)
        .childAt(0)
        .text()
    ).toBe('Apostrophe ’');
    expect(
      wrapper
        .find('[data-qa-post-desc]')
        .at(1)
        .childAt(0)
        .text()
    ).toBe('Right quotation mark ”');
  });

  it('decodes HTML encoded symbols in the title', () => {
    expect(
      wrapper
        .find('[data-qa-blog-post]')
        .at(0)
        .childAt(0)
        .text()
    ).toBe('Blog post…');
    expect(
      wrapper
        .find('[data-qa-blog-post]')
        .at(1)
        .childAt(0)
        .text()
    ).toBe('Blog Post—');
  });

  it('does not render anything if there are no items', () => {
    wrapper.setState({ items: [], loading: true });
    expect(wrapper.find('[data-qa-blog-post]')).toHaveLength(0);
  });
});
