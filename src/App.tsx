import { ApolloProvider } from "@apollo/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { apolloClient } from "./api/apollo";
import { RequireStaff } from "./components/guards/RequireStaff";
import { AdminLayout } from "./layout/AdminLayout";
import { LoginPage } from "./pages/Login";
import { RevenuePage } from "./pages/Revenue";
import { WorkspacesPage } from "./pages/Workspaces";
import { WorkspaceDetailPage } from "./pages/WorkspaceDetail";
import { AsaConnectionsPage } from "./pages/AsaConnections";
import { AsaConnectionDetailPage } from "./pages/AsaConnectionDetail";
import { TasksPage } from "./pages/Tasks";
import { TaskDetailPage } from "./pages/TaskDetail";
import { AppDetailPage } from "./pages/AppDetail";
import { SyncPage } from "./pages/Sync";
import { ActivityPage } from "./pages/Activity";
import { ActivityDetailPage } from "./pages/ActivityDetail";
import { UsersPage } from "./pages/Users";
import { BillingPage } from "./pages/Billing";
import { RampUpsPage } from "./pages/RampUps";

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireStaff />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/revenue" replace />} />
              <Route path="/revenue" element={<RevenuePage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/tasks/:id" element={<TaskDetailPage />} />
              <Route path="/sync" element={<SyncPage />} />
              <Route path="/ramp-ups" element={<RampUpsPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/activity/:id" element={<ActivityDetailPage />} />
              <Route path="/workspaces" element={<WorkspacesPage />} />
              <Route path="/workspaces/:id" element={<WorkspaceDetailPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/asa-connections" element={<AsaConnectionsPage />} />
              <Route path="/asa-connections/:id" element={<AsaConnectionDetailPage />} />
              <Route path="/apps/:id" element={<AppDetailPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
