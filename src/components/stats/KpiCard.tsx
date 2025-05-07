import React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface KpiCardProps {
  /**
   * Label to display as the card title
   */
  label: string;

  /**
   * Value to display (usually a number)
   */
  value: number | string;

  /**
   * Optional icon to display in the card
   */
  icon?: React.ReactNode;

  /**
   * Optional description or subtitle
   */
  description?: string;

  /**
   * Optional tooltip content to show on hover
   */
  tooltip?: string;

  /**
   * Optional footer text (often used for timestamp)
   */
  footer?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Indicates a loading state
   */
  loading?: boolean;
}

/**
 * KpiCard component displays a single KPI metric in a card format
 * Used for displaying important metrics like DAU/WAU in the admin dashboard
 */
const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon,
  description,
  tooltip,
  footer,
  className = '',
  loading = false,
}) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between text-gray-800 dark:text-gray-100">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center">
                  {icon && <span className="mr-2">{icon}</span>}
                  {label}
                </span>
              </TooltipTrigger>
              {tooltip && (
                <TooltipContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600">
                  {tooltip}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-12 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
        ) : (
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            {value}
          </div>
        )}
      </CardContent>
      {footer && (
        <CardFooter className="pt-1 pb-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">{footer}</p>
        </CardFooter>
      )}
    </Card>
  );
};

export default KpiCard;
