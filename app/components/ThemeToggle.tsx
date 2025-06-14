"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleThemeChange = (value: string) => {
    setTheme(value as "light" | "dark" | "system");
  };

  const getIcon = () => {
    switch (resolvedTheme) {
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "light":
        return <Sun className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <Select value={theme} onValueChange={handleThemeChange}>
      <SelectTrigger className="w-[60px] h-10 px-3 py-2 gap-2">
        {getIcon()}
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="light">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Light
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Dark
          </div>
        </SelectItem>
        <SelectItem value="system">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            System
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}