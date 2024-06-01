"use client";

import { useTheme } from "@juliusmarminge/next-themes";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "~/ui/select";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Select value={theme ?? ""} onValueChange={setTheme}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  );
}
