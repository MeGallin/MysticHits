import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

interface HealthData {
  status: string;
  uptimeSec: number;
  memoryMB: number;
  db: {
    connected: boolean;
    latencyMs: number | null;
  };
  timestamp: string;
}

export default function HealthCard() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<HealthData>('/api/health');
      setHealth(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch system health');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Format uptime to human-readable format
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          System Status
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500 font-medium">{error}</div>
        ) : !health ? (
          <div className="text-muted-foreground">Loading system status...</div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge
                variant={health.status === 'ok' ? 'success' : 'destructive'}
              >
                {health.status.toUpperCase()}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Uptime:</span>
              <span className="font-medium">
                {formatUptime(health.uptimeSec)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Memory:</span>
              <span className="font-medium">{health.memoryMB} MB</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Database:</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={health.db.connected ? 'success' : 'destructive'}
                >
                  {health.db.connected ? 'CONNECTED' : 'OFFLINE'}
                </Badge>
                {health.db.connected && health.db.latencyMs && (
                  <span className="text-xs text-muted-foreground">
                    {health.db.latencyMs}ms
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground mt-4">
              Last updated: {new Date(health.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
