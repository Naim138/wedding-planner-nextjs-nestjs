import EditCategoryClient from './EditCategoryClient';

export function generateStaticParams() {
  return [{ slug: 'default' }];
}

export default async function EditCategoryPage({ params }) {
  const resolvedParams = await params;

  return <EditCategoryClient params={resolvedParams} />;
}