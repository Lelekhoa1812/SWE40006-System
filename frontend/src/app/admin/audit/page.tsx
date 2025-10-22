'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Search, Filter, Calendar, User, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchJson } from '@/lib/api';

interface AuditLog {
  id: string;
  action: string;
  actorId?: string;
  actorRole?: string;
  targetId?: string;
  targetType?: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

interface AuditResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export default function AdminAuditPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const limitOptions = [25, 50, 100];

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      void fetchAuditLogs();
    }
  }, [user, page, limit, actionFilter, fetchAuditLogs]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
      });

      if (actionFilter !== 'all') {
        params.append('action', actionFilter);
      }

      const data = await fetchJson<AuditResponse>(
        `/api/v1/admin/audit?${params}`
      );
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch audit logs'
      );
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.actorId?.toLowerCase().includes(searchLower) ||
      log.targetId?.toLowerCase().includes(searchLower) ||
      log.targetType?.toLowerCase().includes(searchLower)
    );
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('register') || action.includes('login'))
      return 'default';
    if (action.includes('approve') || action.includes('create'))
      return 'default';
    if (action.includes('deny') || action.includes('delete'))
      return 'destructive';
    if (action.includes('update') || action.includes('edit'))
      return 'secondary';
    return 'outline';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-6">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Audit Logs</h1>
        </div>
        <p>Loading audit logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-6">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Audit Logs</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null; // Should be redirected by useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Audit Logs</h1>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="action-filter">Action Type</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="user_registered">
                    User Registration
                  </SelectItem>
                  <SelectItem value="user_logged_in">User Login</SelectItem>
                  <SelectItem value="user_logged_out">User Logout</SelectItem>
                  <SelectItem value="subscription_requested">
                    Subscription Requested
                  </SelectItem>
                  <SelectItem value="subscription_approved">
                    Subscription Approved
                  </SelectItem>
                  <SelectItem value="subscription_denied">
                    Subscription Denied
                  </SelectItem>
                  <SelectItem value="message_sent">Message Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="limit">Results per page</Label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {limitOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredLogs.length} of {total} audit logs
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm">Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={filteredLogs.length < limit}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Audit Logs Table */}
      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No audit logs found
            </h3>
            <p className="text-gray-600">
              {searchTerm || actionFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'No audit logs have been recorded yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <Card key={log.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Actor:</span>
                          <span className="text-gray-600">
                            {log.actorId || 'System'} ({log.actorRole || 'N/A'})
                          </span>
                        </div>
                        {log.targetId && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Target:</span>
                            <span className="text-gray-600">
                              {log.targetId} ({log.targetType || 'N/A'})
                            </span>
                          </div>
                        )}
                      </div>

                      {log.details && Object.keys(log.details).length > 0 && (
                        <div>
                          <span className="font-medium">Details:</span>
                          <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
