// Type definitions for fetchServices.js

// Define the structure of API responses
interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  error: string;
  status: number;
  success?: false;
}

// Define the contact form data structure
interface ContactFormData {
  fullName: string;
  email: string;
  message: string;
}

// Define the contact services
export interface ContactServices {
  submitContactForm: (
    formData: ContactFormData,
  ) => Promise<ApiSuccessResponse | ApiErrorResponse>;
}

// Export the contact services
export const contactServices: ContactServices;

// Default export
declare const services: {
  contactServices: ContactServices;
};

export default services;
