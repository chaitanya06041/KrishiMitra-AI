// Add this directive at the top to mark it as a client component
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Changed from useLocation
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, LogOut, Settings, Sprout, Menu } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import EditProfileDialog from "./EditProfileDialog";
import { createClient } from "@/lib/supabase/client";
import { useSelector, useDispatch } from 'react-redux';
import { selectUserProfile, clearUser } from '@/store/features/userSlice';

const Navbar = () => {
  const pathname = usePathname(); // Changed from useLocation
  const router = useRouter();
  const supabase = createClient();
  const dispatch = useDispatch();
  const userProfile = useSelector(selectUserProfile);

  const [notifications] = useState([
    {
      id: 1,
      message: "Your crop disease prediction is ready",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      message: "Weather alert: Rain expected tomorrow",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      message: "New recommendation available",
      time: "3 hours ago",
      unread: false,
    },
  ]);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Logic remains the same, just uses the 'pathname' from usePathname
  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Logout failed: ${error.message}`);
    } else {
      dispatch(clearUser());
      toast.success("Logged out successfully");
      router.push("/");
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Hamburger Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  {/* Mobile Navigation Links - 'to' prop changed to 'href' */}
                  <div className="flex flex-col gap-4 mt-8">
                    <Link href="/disease-prediction" className={`text-sm font-medium transition-colors px-4 py-2 rounded-md ${isActive("/disease-prediction") ? "bg-accent text-primary" : "text-green-700 hover:text-green-900"}`}>
                      Crop Disease Prediction
                    </Link>
                    <Link href="/chatbot" className={`text-sm font-medium transition-colors px-4 py-2 rounded-md ${isActive("/chatbot") ? "bg-accent text-primary" : "text-green-700 hover:text-green-900"}`}>
                      Chatbot
                    </Link>
                    <Link href="/history" className={`text-sm font-medium transition-colors px-4 py-2 rounded-md ${isActive("/history") ? "bg-accent text-primary" : "text-green-700 hover:text-green-900"}`}>
                      History
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo - 'to' prop changed to 'href' */}
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-xl text-primary" style={{color: '#396619'}}
              >
                <Sprout className="h-6 w-6" />
                KrushiMitra
              </Link>
            </div>

            {/* Desktop Navigation Links - 'to' prop changed to 'href' */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/disease-prediction"
                className={`text-sm font-medium transition-colors ${
                  isActive("/disease-prediction")
                    ? "text-primary font-semibold"
                    : "text-green-700 hover:text-green-900"
                }`}
              >
                Crop Disease Prediction
              </Link>
              <Link
                href="/chatbot"
                className={`text-sm font-medium transition-colors ${
                  isActive("/chatbot")
                    ? "text-primary font-semibold"
                    : "text-green-700 hover:text-green-900"
                }`}
              >
                Chatbot
              </Link>
              <Link
                href="/history"
                className={`text-sm font-medium transition-colors ${
                  isActive("/history")
                    ? "text-primary font-semibold"
                    : "text-green-700 hover:text-green-900"
                }`}
              >
                History
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.some((n) => n.unread) && (
                      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" /> // Changed color for visibility
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 bg-popover z-50"
                >
                  <div className="px-3 py-2 text-sm font-semibold">
                    Notifications
                  </div>
                  <DropdownMenuSeparator />
                  {notifications.slice(0, 3).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex flex-col items-start p-3 hover:bg-accent/50"
                    >
                      <p
                        className={`text-sm ${
                          notification.unread ? "font-semibold" : ""
                        }`}
                      >
                        {notification.message}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    {/* 'to' prop changed to 'href' */}
                    <Link
                      href="/notifications"
                      className="w-full text-center text-sm text-primary py-2"
                    >
                      View all notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      {userProfile?.profile_image_url && (
                        <AvatarImage src={userProfile.profile_image_url} alt="Profile" />
                      )}
                      <AvatarFallback className="bg-black text-white">
                        {userProfile?.email?.[0].toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-popover z-50"
                >
                  <DropdownMenuItem asChild>
                    {/* 'to' prop changed to 'href' */}
                      <button
                        onClick={() => {
                          setShowEditProfile(true);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Edit Profile</span>
                      </button>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
      {showEditProfile && (
        <EditProfileDialog onClose={() => setShowEditProfile(false)} />
      )}
    </>
  );
};

export default Navbar;
