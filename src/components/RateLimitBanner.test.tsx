import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RateLimitBanner from './RateLimitBanner';
import { RATE_LIMIT_EVENT } from '../utils/apiErrorHandler';

describe('RateLimitBanner', () => {
  test('should not be visible by default', () => {
    render(<RateLimitBanner />);
    
    const banner = screen.queryByText(/You're making requests too quickly/i);
    expect(banner).not.toBeInTheDocument();
  });

  test('should appear when rate limit event is dispatched', () => {
    render(<RateLimitBanner />);
    
    // Dispatch rate limit event
    window.dispatchEvent(new CustomEvent(RATE_LIMIT_EVENT));
    
    // Banner should now be visible
    const banner = screen.queryByText(/You're making requests too quickly/i);
    expect(banner).toBeInTheDocument();
  });

  test('should close when dismiss button is clicked', () => {
    render(<RateLimitBanner />);
    
    // Dispatch rate limit event to show banner
    window.dispatchEvent(new CustomEvent(RATE_LIMIT_EVENT));
    
    // Banner should be visible
    const banner = screen.queryByText(/You're making requests too quickly/i);
    expect(banner).toBeInTheDocument();
    
    // Click dismiss button
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButton);
    
    // Banner should no longer be visible
    expect(screen.queryByText(/You're making requests too quickly/i)).not.toBeInTheDocument();
  });
  
  // This test would require jest.useFakeTimers() to work properly
  test('should auto-hide after 10 seconds', () => {
    jest.useFakeTimers();
    
    render(<RateLimitBanner />);
    
    // Show the banner
    window.dispatchEvent(new CustomEvent(RATE_LIMIT_EVENT));
    
    // Banner should be visible
    expect(screen.queryByText(/You're making requests too quickly/i)).toBeInTheDocument();
    
    // Fast-forward time
    jest.advanceTimersByTime(10000);
    
    // Banner should no longer be visible
    expect(screen.queryByText(/You're making requests too quickly/i)).not.toBeInTheDocument();
    
    jest.useRealTimers();
  });
});