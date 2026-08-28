import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './routes/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { ProjectWorkspacePage } from './pages/ProjectWorkspacePage';
import { FindingsPage } from './pages/FindingsPage';
import { CreateFindingPage } from './pages/CreateFindingPage';
import { FindingDetailsPage } from './pages/FindingDetailsPage';
import { AssistantPage } from './pages/AssistantPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { CreateReportPage } from './pages/CreateReportPage';
import { ReportPreviewPage } from './pages/ReportPreviewPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { KnowledgeSearchPage } from './pages/KnowledgeSearchPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public-only Auth Pages */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPasswordPage />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Dashboard & Projects */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <CreateProjectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <ProjectDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/workspace"
            element={
              <ProtectedRoute>
                <ProjectWorkspacePage />
              </ProtectedRoute>
            }
          />

          {/* Protected Findings Module */}
          <Route
            path="/findings"
            element={
              <ProtectedRoute>
                <FindingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/findings/new"
            element={
              <ProtectedRoute>
                <CreateFindingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/findings/:findingId"
            element={
              <ProtectedRoute>
                <FindingDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected AI Assistant Module */}
          <Route
            path="/assistant"
            element={
              <ProtectedRoute>
                <AssistantPage />
              </ProtectedRoute>
            }
          />
          {/* Protected Risk Analysis Module */}
          <Route
            path="/risk-analysis"
            element={
              <ProtectedRoute>
                <RiskAnalysisPage />
              </ProtectedRoute>
            }
          />
          {/* Protected Security Analytics & Monitoring Module */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          {/* Protected Reports Module */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/new"
            element={
              <ProtectedRoute>
                <CreateReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/:reportId"
            element={
              <ProtectedRoute>
                <ReportPreviewPage />
              </ProtectedRoute>
            }
          />
          {/* Protected Security Knowledge Base & RAG Module */}
          <Route
            path="/knowledge"
            element={
              <ProtectedRoute>
                <KnowledgePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/knowledge/search"
            element={
              <ProtectedRoute>
                <KnowledgeSearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <DashboardPage
                  moduleName="Remediation Recommendations"
                  moduleDescription="AI-suggested remediation guidelines and code fixes aligned with OWASP & NIST standards."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardPage
                  moduleName="Security Settings"
                  moduleDescription="Configure workspace security parameters, session limits, and role permissions."
                />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
