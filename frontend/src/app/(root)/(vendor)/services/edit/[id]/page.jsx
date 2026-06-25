import EditServiceClient from './EditServiceClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function EditServicePage({ params }) {
  const resolvedParams = await params;

  return <EditServiceClient params={resolvedParams} />;
}