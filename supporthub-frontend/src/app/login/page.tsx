import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import LoginClientWrapper from './LoginClientWrapper';

export default async function LoginPage() {
  const queryClient = new QueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LoginClientWrapper />
    </HydrationBoundary>
  );
}
