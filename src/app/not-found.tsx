import ErrorPage from '@/app/components/ErrorPage';

export default function NotFound() {
  return (
    <ErrorPage 
      title="Page Not Found"
      message="We couldn't find the page you're looking for. The page might have been moved or deleted."
    />
  );
}
