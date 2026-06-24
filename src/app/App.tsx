import { AppProviders } from "@/app/providers/AppProviders";
import { AppRoutes } from "@/app/router";
import { Layout } from "@/widgets/layout";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { OnboardingTour } from "@/features/onboarding";
import { CopyToastProvider } from "@/features/copy-toast";
import { DailyCheckIn } from "@/features/promo";
import { CornerPromo } from "@/features/promo";
import {
  GenerationQueueStatusBar,
  QueueProvider,
} from "@/features/generation-queue";

export default function App() {
  return (
    <AppProviders>
      <QueueProvider>
        <Layout>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </Layout>
        <GenerationQueueStatusBar />
      </QueueProvider>
      <OnboardingTour />
      <CopyToastProvider />
      <DailyCheckIn />
      <CornerPromo />
    </AppProviders>
  );
}
