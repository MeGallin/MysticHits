import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import HealthCard from '@/components/admin/HealthCard';
import ApiMetricsCard from '@/components/admin/ApiMetricsCard';
import SystemResourcesCard from '@/components/admin/SystemResourcesCard';
import EndpointPerformanceTable from '@/components/admin/EndpointPerformanceTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SystemStats: React.FC = () => {
  return (
    <div className="container py-6">
      <Link
        to="/admin/dashboard"
        className="flex items-center text-gray-400 hover:text-white mb-4"
      >
        <FiArrowLeft className="mr-2" /> Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold mb-6">System Statistics</h1>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <HealthCard />
            <SystemResourcesCard />
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <ApiMetricsCard />
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <EndpointPerformanceTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemStats;
