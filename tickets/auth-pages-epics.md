
# 🔐 Epics for Authentication Pages (Register, Forgot, Reset)

---

## 🟢 Epic: Register Page

### ✅ Story: Create Register Page UI

**Description:** Build a form for new users to register using their email and password, styled with Tailwind CSS and powered by a `registerUser()` call from `fetchService.js`.

**Tasks:**
- [ ] Create a new component at `src/pages/auth/Register.tsx`
- [ ] Controlled inputs for email and password
- [ ] Call `registerUser(email, password)` on submit
- [ ] Display error feedback on failure
- [ ] Link to login page
- [ ] Style using Tailwind CSS

**Acceptance Criteria:**
- New users can enter their email and password
- Valid submissions hit the backend register endpoint
- Form shows feedback and has clear visual hierarchy

---

## 🔵 Epic: Forgot Password Page

### ✅ Story: Implement Forgot Password Form

**Description:** Create a simple UI to accept a user’s email and trigger a password reset link via `forgotPassword()` from `fetchService.js`.

**Tasks:**
- [ ] Create a new component at `src/pages/auth/ForgotPassword.tsx`
- [ ] Controlled email input
- [ ] Call `forgotPassword(email)` on submit
- [ ] Show success message if link is sent
- [ ] Show error message if request fails
- [ ] Tailwind CSS for styling

**Acceptance Criteria:**
- Form sends reset request to backend
- Feedback messages are shown appropriately
- Page is responsive and styled with Tailwind

---

## 🔴 Epic: Reset Password Page

### ✅ Story: Implement Reset Password UI

**Description:** Build a form to let users enter a new password using a reset token from the URL. Uses `resetPassword(token, password)` from `fetchService.js`.

**Tasks:**
- [ ] Create component at `src/pages/auth/ResetPassword.tsx`
- [ ] Parse `:token` from route using `useParams()`
- [ ] Controlled password input
- [ ] Call `resetPassword(token, password)` on submit
- [ ] Show confirmation message on success
- [ ] Style with Tailwind CSS

**Acceptance Criteria:**
- Token is used securely from URL
- New password is submitted to backend
- Confirmation or error is clearly displayed

---
