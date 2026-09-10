import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { Subjects } from '../pages/subjects/Subjects';
import { SubjectDetail } from '../pages/subjects/SubjectDetail';
import { Topics } from '../pages/topics/Topics';
import { Tasks } from '../pages/tasks/Tasks';
import { StudySessions } from '../pages/studySessions/StudySessions';
import { Goals } from '../pages/goals/Goals';
import { Notes } from '../pages/notes/Notes';
import { StudyPlans } from '../pages/studyPlans/StudyPlans';
import { Profile } from '../pages/profile/Profile';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/subjects/:id" element={<SubjectDetail />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/study-sessions" element={<StudySessions />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/study-plans" element={<StudyPlans />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}