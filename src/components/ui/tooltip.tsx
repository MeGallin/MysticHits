'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

const TooltipProvider = ({
  // Lower delayDuration for better mobile experience
  delayDuration = 100,
  // Reduce skipDelayDuration to make it more responsive
  skipDelayDuration = 100,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider
    delayDuration={delayDuration}
    skipDelayDuration={skipDelayDuration}
    {...props}
  />
);
TooltipProvider.displayName = TooltipPrimitive.Provider.displayName;

const Tooltip = ({
  // Important: disable hoverable content for better mobile experience
  disableHoverableContent = false,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) => (
  <TooltipPrimitive.Root
    disableHoverableContent={disableHoverableContent}
    {...props}
  />
);
Tooltip.displayName = TooltipPrimitive.Root.displayName;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(
  (
    {
      className,
      sideOffset = 4,
      collisionPadding = 10,
      avoidCollisions = true,
      ...props
    },
    ref,
  ) => (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      avoidCollisions={avoidCollisions}
      // Ensure tooltip stays visible long enough on mobile
      aria-hidden={false}
      className={cn(
        'z-50 overflow-visible rounded-md px-3 py-2 text-sm shadow-md',
        // Simplify animations for better mobile performance
        'animate-in fade-in-50 duration-200',
        // Adjust positioning based on side
        'data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
        // Use theme-appropriate styling
        'border border-gray-800 bg-gray-900 text-gray-50',
        // Mobile-friendly width constraints
        'max-w-[280px] w-auto break-words hyphens-auto',
        className,
      )}
      {...props}
    />
  ),
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
