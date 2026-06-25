import ServiceViewClient from './ServiceViewClient';

export function generateStaticParams() {
  return [{ slug: 'default', service: 'default' }];
}

export default async function ServicePage({ params }) {
  const resolvedParams = await params;

  return <ServiceViewClient params={resolvedParams} />;
}