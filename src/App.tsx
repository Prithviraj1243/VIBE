import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { SplashScreen } from './features/splash/SplashScreen';
import { AuthPage } from './features/auth/AuthPage';
import { OnboardingWizard } from './features/onboarding/OnboardingWizard';
import { AppShell } from './components/layout/AppShell';
import { LinkedInCallback } from './features/integrations/LinkedInCallback';

// Features
import { DashboardOverview } from './features/dashboard/DashboardOverview';
import { CommandCenter } from './features/command-center/CommandCenter';
import { AgentsWorkspace } from './features/agents/AgentsWorkspace';
import { ContentStudio } from './features/content-studio/ContentStudio';
import { ContentCalendar } from './features/calendar/ContentCalendar';
import { SocialInbox } from './features/inbox/SocialInbox';
import { CommentsWorkspace } from './features/comments/CommentsWorkspace';
import { AnalyticsWorkspace } from './features/analytics/AnalyticsWorkspace';
import { ActivityWorkspace } from './features/activity/ActivityWorkspace';
import { IntegrationsWorkspace } from './features/integrations/IntegrationsWorkspace';
import { SettingsWorkspace } from './features/settings/SettingsWorkspace';

export const AppContent: React.FC = () => {
  const { isAuthenticated, isOnboarded } = useApp();
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return sessionStorage.getItem('vybe_splash_seen') !== 'true';
  });

  const handleSplashDone = () => {
    sessionStorage.setItem('vybe_splash_seen', 'true');
    setShowSplash(false);
  };

  // LinkedIn OAuth callback — always accessible regardless of auth state
  if (window.location.pathname === '/linkedin/callback') {
    return <LinkedInCallback />;
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashDone} />;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (!isOnboarded) {
    return <OnboardingWizard />;
  }

  return (
    <Routes>
      <Route path="/linkedin/callback" element={<LinkedInCallback />} />
      <Route path="/" element={<AppShell />}>
        <Route index element={<DashboardOverview />} />
        <Route path="command" element={<CommandCenter />} />
        <Route path="agents" element={<AgentsWorkspace />} />
        <Route path="create" element={<ContentStudio />} />
        <Route path="calendar" element={<ContentCalendar />} />
        <Route path="inbox" element={<SocialInbox />} />
        <Route path="comments" element={<CommentsWorkspace />} />
        <Route path="analytics" element={<AnalyticsWorkspace />} />
        <Route path="activity" element={<ActivityWorkspace />} />
        <Route path="integrations" element={<IntegrationsWorkspace />} />
        <Route path="settings" element={<SettingsWorkspace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
