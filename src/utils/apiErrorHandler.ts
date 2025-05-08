import axios, { AxiosError } from 'axios';
import { toast } from '@/components/ui/use-toast';

// Event that will be triggered when a rate limit is hit
export const RATE_LIMIT_EVENT = 'api:rate-limited';

/**
 * Setup global axios interceptors to handle common API errors
 */
export const setupApiErrorHandlers = (): void => {
  // Response interceptor
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      if (!error.response) {
        // Network error
        toast({
          title: 'Network Error',
          description: 'Unable to connect to the server. Please check your internet connection.',
          variant: 'destructive',
        });
      } else {
        const status = error.response.status;
        
        // Handle rate limiting (429)
        if (status === 429) {
          toast({
            title: 'Rate Limit Exceeded',
            description: 'You\'re making requests too quickly. Please slow down.',
            variant: 'destructive',
          });
          
          // Dispatch custom event for the rate limit banner
          window.dispatchEvent(new CustomEvent(RATE_LIMIT_EVENT));
        } 
        // Handle server errors (500)
        else if (status >= 500) {
          toast({
            title: 'Server Error',
            description: 'Something went wrong on our end. We\'re working to fix it.',
            variant: 'destructive',
          });
        }
      }
      
      return Promise.reject(error);
    }
  );
};

/**
 * Handle API error and return formatted error information
 */
export const handleApiError = (error: any): { success: false; error: string } => {
  let errorMessage = 'An unexpected error occurred';
  
  if (axios.isAxiosError(error)) {
    // Handle Axios errors
    const axiosError = error as AxiosError;
    
    if (!axiosError.response) {
      // Network error
      errorMessage = 'Network error: Please check your connection';
    } else {
      // Server returned an error response
      const status = axiosError.response.status;
      
      // Use error message from response if available
      const responseData = axiosError.response.data as any;
      errorMessage = responseData?.error || responseData?.message || 
        `Server error: ${status}`;
    }
  } else if (error instanceof Error) {
    // Handle standard JS errors
    errorMessage = error.message;
  }
  
  return { success: false, error: errorMessage };
};