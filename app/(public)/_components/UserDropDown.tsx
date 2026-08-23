"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { LandPlotIcon, LayoutDashboardIcon, LogOutIcon, ShieldIcon } from "lucide-react";
import Link from "next/link";

interface UserDropDownProps {
  name?: string;
  email?: string;
  imageUrl?: string | null;
  role?: string | null;
  onLogout: () => void;
}

export function UserDropDown({
  name,
  email,
  imageUrl,
  role,
  onLogout,
}: UserDropDownProps) {
  const isAdmin = role === "admin";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Avatar>
            <AvatarImage src={imageUrl || ""} alt={name || "User"} />
            <AvatarFallback>
              {name ? name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
        }
      />

      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col min-w-0">
            <span className="text-foreground truncate text-sm font-medium">
              {name}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {email}
            </span>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            render={
              <Link href="/dashboard" className="flex items-center gap-2">
                <LayoutDashboardIcon size={16} />
                Dashboard
              </Link>
            }
          />

          {isAdmin && (
            <>
              <DropdownMenuItem
                render={
                  <Link href="/admin" className="flex items-center gap-2">
                    <ShieldIcon size={16} />
                    Admin
                  </Link>
                }
              />
              <DropdownMenuItem
                render={
                  <Link
                    href="/admin/courses"
                    className="flex items-center gap-2"
                  >
                    <LandPlotIcon size={16} />
                    Courses
                  </Link>
                }
              />
            </>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onLogout} title="Logout">
          <LogOutIcon size={16} />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
