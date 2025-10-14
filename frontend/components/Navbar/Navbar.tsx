// Add this directive at the top to mark it as a client component
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Notifications from "./Notifications";
import EditProfileDialog from "./EditProfileDialog";
import { createClient } from "@/lib/supabase/client";
import { useSelector, useDispatch } from 'react-redux';
import { selectUserProfile, clearUser } from '@/store/features/userSlice';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, Sprout, Menu } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const dispatch = useDispatch();
  const userProfile = useSelector(selectUserProfile);
  
  const [showEditProfile, setShowEditProfile] = useState(false);

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
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    A list of links to navigate to different pages of the application.
                  </SheetDescription>
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
              <Link
                href="/dashboard"
                className="flex items-center gap-2 font-bold text-xl text-primary" style={{color: '#396619'}}
              >
                <Sprout className="h-6 w-6" />
                KrushiMitra
              </Link>
            </div>
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

            <div className="flex items-center gap-2">
              
              <Notifications />
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

