import AllServicesBySlugClient from './AllServicesBySlugClient';

export function generateStaticParams() {
  return [{ slug: 'default' }];
}

export default async function AllServicesBySlugPage({ params }) {
  const resolvedParams = await params;

  return <AllServicesBySlugClient params={resolvedParams} />;
}