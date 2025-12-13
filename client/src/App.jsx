import { Routes, Route } from 'react-router-dom';

// Placeholder pages - to be created later
const HomePage = () => <div>HomePage</div>;
const LoginPage = () => <div>LoginPage</div>;
const RegisterPage = () => <div>RegisterPage</div>;
const NotFoundPage = () => <div>404 - Page Not Found</div>;


function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;