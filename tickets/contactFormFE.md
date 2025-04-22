
# 📞 Contact Page Frontend Integration

## Epic: Contact Page Integration

---

### 🧑‍💼 User Story 1:
**As a visitor, I want to view contact details on a dedicated page so I can easily get in touch with the business.**

---

### 🪪 Ticket 1: Create Contact Page Route

**Title:** `Add /contact route to React app`

**Description:**  
Create a new route `/contact` in the React app using React Router. This route should load a new `ContactPage` component.

**Acceptance Criteria:**
- The route `/contact` exists
- Navigating to `/contact` renders the `ContactPage` component
- The route appears in the app router config

---

### 🧱 Ticket 2: Build ContactPage component UI

**Title:** `Build ContactPage component layout with Tailwind CSS`

**Description:**  
Implement the `ContactPage` layout using Tailwind utility classes. The page should have a heading and styled sections for Name, Email, Phone, and Address.

**Acceptance Criteria:**
- Tailwind is used for all layout/styling
- Responsive and centered on desktop and mobile
- Placeholder UI shows while data is loading

---

### 🔄 Ticket 3: Fetch contact data from API

**Title:** `Fetch contact info from API in ContactPage`

**Description:**  
Use `useEffect` to fetch contact data from an external API when the component mounts. Display the contact details once data is received.

**Acceptance Criteria:**
- API call is made on component mount
- Shows loading state while fetching
- Displays error message if fetch fails
- Renders contact details from API

---

### 🔗 Ticket 4: Add "Contact" link to navigation

**Title:** `Add "Contact" link to navbar/footer`

**Description:**  
Add a visible navigation link to the Contact page in either the header navbar or site footer.

**Acceptance Criteria:**
- Link says “Contact” or similar
- Navigates to `/contact` when clicked
- Link is styled to match existing nav

---

### 🧪 Ticket 5: Test ContactPage functionality

**Title:** `Add basic tests for ContactPage`

**Description:**  
Add tests using your preferred testing library (e.g., React Testing Library + Jest) to ensure the contact page fetches and renders data correctly.

**Acceptance Criteria:**
- Tests cover loading, error, and success states
- API mock used in tests
- Component renders correctly with mock data

---

## 🆕 Epic: Contact Form Integration

---

### 🧑‍💼 User Story 2:
**As a user, I want to send a message via a contact form so I can get in touch with the business easily.**

---

### 📝 Ticket 6: Add contact form fields

**Title:** `Add input fields for name, email, and message`

**Description:**  
Extend the `ContactPage` component to include a form with inputs for user's name, email, and message.

**Acceptance Criteria:**
- Form includes `name`, `email`, and `message` fields
- Form fields are styled with Tailwind CSS
- Fields are required and accept user input

---

### 📤 Ticket 7: Submit contact form data to API

**Title:** `Send form data to API via POST request`

**Description:**  
On form submission, send a `POST` request to the contact API endpoint. Handle success and error cases with user-friendly messages.

**Acceptance Criteria:**
- Sends POST request to `POST /api/contact/submit`
- Displays confirmation on success
- Shows error message if submission fails

---

### ⚠️ Ticket 8: Basic form validation

**Title:** `Add basic form validation`

**Description:**  
Ensure that the contact form validates required fields and email format before submitting.

**Acceptance Criteria:**
- Prevent submission with empty fields
- Show inline validation messages
- Email must be in valid format (e.g., using regex)

---

### 🧪 Ticket 9: Test contact form behavior

**Title:** `Test contact form states and submission`

**Description:**  
Write tests for the contact form to ensure it handles user input, validation, submission success, and failure correctly.

**Acceptance Criteria:**
- Tests for input changes
- Tests for validation errors
- Tests for successful form submission
- Tests for submission failure state
