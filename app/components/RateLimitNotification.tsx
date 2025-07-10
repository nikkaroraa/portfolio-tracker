"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface FetchingAddress {
  id: string;
  name: string;
  address: string;
  chain: string;
  status: "pending" | "fetching" | "success" | "error" | "rate_limited";
  error?: string;
  retryAt?: Date;
}

interface RateLimitNotificationProps {
  addresses: FetchingAddress[];
  onRetry?: (addressId: string) => void;
}

export function RateLimitNotification({ addresses }: RateLimitNotificationProps) {
  const [now, setNow] = React.useState(new Date());
  
  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const totalAddresses = addresses.length;
  const completedAddresses = addresses.filter(addr => 
    addr.status === "success" || addr.status === "error"
  ).length;
  const fetchingAddresses = addresses.filter(addr => addr.status === "fetching");
  const rateLimitedAddresses = addresses.filter(addr => addr.status === "rate_limited");
  const errorAddresses = addresses.filter(addr => addr.status === "error");
  
  const progress = totalAddresses > 0 ? (completedAddresses / totalAddresses) * 100 : 0;
  
  // Don't show if no addresses are being processed
  if (totalAddresses === 0) return null;
  
  // Don't show if all are completed and no errors
  if (completedAddresses === totalAddresses && errorAddresses.length === 0) return null;

  const getStatusIcon = (status: FetchingAddress["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "fetching":
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "rate_limited":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: FetchingAddress["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "fetching":
        return <Badge className="bg-blue-100 text-blue-800">Fetching</Badge>;
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "rate_limited":
        return <Badge className="bg-yellow-100 text-yellow-800">Rate Limited</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRemainingTime = (retryAt: Date) => {
    const diff = retryAt.getTime() - now.getTime();
    if (diff <= 0) return "Ready to retry";
    
    const seconds = Math.ceil(diff / 1000);
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.ceil(seconds / 60);
    return `${minutes}m`;
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Progress Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className={`h-5 w-5 ${fetchingAddresses.length > 0 ? 'animate-spin' : ''}`} />
              <h3 className="font-semibold">
                Fetching Portfolio Data ({completedAddresses}/{totalAddresses})
              </h3>
            </div>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          
          {/* Progress Bar */}
          <Progress value={progress} className="w-full" />
          
          {/* Rate Limit Alert */}
          {rateLimitedAddresses.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Rate limit reached:</strong> {rateLimitedAddresses.length} addresses are waiting. 
                We&apos;ll automatically retry them as the rate limit resets.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Error Alert */}
          {errorAddresses.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Errors occurred:</strong> {errorAddresses.length} addresses failed to fetch. 
                Check your API keys and network connection.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Address List */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getStatusIcon(addr.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{addr.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {addr.chain.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {addr.address}
                    </div>
                    {addr.error && (
                      <div className="text-xs text-red-600 mt-1">
                        {addr.error}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {addr.status === "rate_limited" && addr.retryAt && (
                    <span className="text-xs text-muted-foreground">
                      Retry in {getRemainingTime(addr.retryAt)}
                    </span>
                  )}
                  {getStatusBadge(addr.status)}
                </div>
              </div>
            ))}
          </div>
          
          {/* Currently Fetching */}
          {fetchingAddresses.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Currently fetching: {fetchingAddresses.map(addr => addr.name).join(", ")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}