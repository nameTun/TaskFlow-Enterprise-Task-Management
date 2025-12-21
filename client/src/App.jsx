import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/theme/ThemeContext';
import Layout from './components/layout/Layout';
import TodoPage from './components/todos/TodoPage';

import RegisterPage from './components/auth/RegisterPage';
import LoginPage from './components/auth/LoginPage';

// Placeholder pages - to be created later
const NotFoundPage = () => <div>404 - Page Not Found</div>;


function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<TodoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;