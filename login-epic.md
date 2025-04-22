
# 🔐 Epic: User Authentication - Login Page

This epic covers the implementation of the frontend login page that interacts with the backend API for authenticating users.

---

## ✅ Story: Create Login Page

**Description:** Build a user interface for logging in to the application. The form will collect email and password and POST them to the `/api/auth/login` backend endpoint. The form should be styled using Tailwind CSS and include error handling.

---

### 📋 Tasks

- [ ] Create a new file at `src/pages/auth/Login.tsx`
- [ ] Implement controlled inputs for email and password
- [ ] Use `loginUser()` from `fetchService.js` to POST credentials
- [ ] Handle error responses and show feedback
- [ ] Include links to register and forgot password pages
- [ ] Use Tailwind CSS classes for styling

---

### ✅ Acceptance Criteria

- The page renders a login form with email and password fields
- On submit, a request is sent via `loginUser()` from the fetch service
- On error, a message is shown without crashing the app
- Tailwind CSS styles are used for layout and input fields
- Links to `/register` and `/forgot-password` work

---

### 💻 Code Example: `Login.tsx`

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginUser } from '../../services/fetchService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await loginUser(email, password);
      // handle login success (e.g., save token, redirect)
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded"
          required
        />
        {error && <div className="text-red-500">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
      </form>
      <div className="text-sm mt-4 flex justify-between">
        <Link to="/forgot-password" className="text-blue-600">Forgot password?</Link>
        <Link to="/register" className="text-blue-600">Register</Link>
      </div>
    </div>
  );
}
```

---
