export type MockTag = { id: number; name: string };
export type MockPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published';
  publishedAt: Date | null;
  updatedAt?: Date | null;
  tags?: MockTag[];
};

export const mockPosts: MockPost[] = [
  {
    id: 1,
    title: 'Welcome to JOYDAO.Z',
    slug: 'welcome-to-joydao',
    excerpt: 'Booting up the creative terminal...',
    content: '# Hello Agent\n\nThis is a mock blog post rendered without a backend. In Phase B, this will be served from MySQL via tRPC.',
    status: 'published',
    publishedAt: new Date(),
    updatedAt: new Date(),
    tags: [
      { id: 1, name: 'announcement' },
      { id: 2, name: 'cyberpunk' },
    ],
  },
];
