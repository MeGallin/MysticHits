interface Advertisement {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  backgroundColor: string;
  textColor: string;
}

export const advertisements: Advertisement[] = [
  {
    id: 1,
    title: 'Premium Music Subscription',
    description:
      'Unlock unlimited ad-free listening with our Premium plan. First month free!',
    imageUrl: 'https://placehold.co/300x200/5D3FD3/FFFFFF?text=Premium+Music',
    linkUrl: 'https://example.com/premium',
    backgroundColor: 'from-indigo-600 to-purple-700',
    textColor: 'text-white',
  },
  {
    id: 2,
    title: 'Live Concert Series',
    description:
      'Experience your favorite artists live. Get 15% off tickets with code MUSIC15.',
    imageUrl: 'https://placehold.co/300x200/E91E63/FFFFFF?text=Live+Concerts',
    linkUrl: 'https://example.com/concerts',
    backgroundColor: 'from-pink-600 to-rose-700',
    textColor: 'text-white',
  },
  {
    id: 3,
    title: 'New Headphones Collection',
    description:
      'Enhance your listening experience with our premium headphones.',
    imageUrl: 'https://placehold.co/300x200/00BCD4/FFFFFF?text=Headphones',
    linkUrl: 'https://example.com/headphones',
    backgroundColor: 'from-cyan-500 to-blue-600',
    textColor: 'text-white',
  },
  {
    id: 4,
    title: 'Music Production Course',
    description:
      'Learn to create your own music with our online production courses.',
    imageUrl: 'https://placehold.co/300x200/FF9800/FFFFFF?text=Music+Courses',
    linkUrl: 'https://example.com/courses',
    backgroundColor: 'from-amber-500 to-orange-600',
    textColor: 'text-white',
  },
];

export const getRandomAdvertisement = (): Advertisement => {
  const randomIndex = Math.floor(Math.random() * advertisements.length);
  return advertisements[randomIndex];
};
