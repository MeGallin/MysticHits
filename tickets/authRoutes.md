
# 🔐 Frontend Route Definitions for Authentication

This document outlines the new route structure and responsibilities for the user authentication flows in the frontend React app using React Router and Tailwind CSS.

---

## ✅ Routes Overview

| Path                     | Component            | Purpose                      |
|--------------------------|----------------------|------------------------------|
| `/login`                | `Login.tsx`          | User login form              |
| `/register`             | `Register.tsx`       | New user signup form         |
| `/forgot-password`      | `ForgotPassword.tsx` | Send password reset link     |
| `/reset-password/:token`| `ResetPassword.tsx`  | Set new password via token   |

---

## 📂 Folder Structure

```
src/
├── pages/
│   └── auth/
│       ├── Login.tsx
│       ├── Register.tsx
│       ├── ForgotPassword.tsx
│       └── ResetPassword.tsx
├── AppRouter.tsx
```

---

## 📄 Example Router Setup (`AppRouter.tsx`)

```tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}
```

---

## 🧪 Integration Notes

- All forms will be styled using Tailwind CSS.
- Error and success messages will be shown in each form.
- Navigation between routes (e.g. "Already have an account? Login") will use `react-router-dom` `<Link>`.

---

