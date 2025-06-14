"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";

interface PasswordGateProps {
  onAuthenticated: () => void;
}

export function PasswordGate({ onAuthenticated }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated in this session
    const isAuthenticated = sessionStorage.getItem("crypto-tracker-auth");
    if (isAuthenticated === "true") {
      onAuthenticated();
    }
  }, [onAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        sessionStorage.setItem("crypto-tracker-auth", "true");
        onAuthenticated();
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Portfolio Tracker</h1>
          <p className="text-muted-foreground">Multi-chain portfolio tracking + Secure access</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
            disabled={isLoading}
          />
          
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? "Verifying..." : "Access"}
          </Button>
        </form>
      </Card>
    </div>
  );
}