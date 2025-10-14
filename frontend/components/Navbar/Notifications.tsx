'use client'
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bell, MailCheck } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSelector } from "react-redux";
import { selectUserProfile } from "@/store/features/userSlice";
import { toast } from "sonner";

// A simple time-ago utility
const timeAgo = (date: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

type Notification = {
  notification_id: number;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

const Notifications = () => {
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const supabase = createClient();
  const userProfile = useSelector(selectUserProfile);

  const fetchNotifications = useCallback(async (limit?: number) => {
    if (!userProfile?.user_id) return;

    const query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userProfile.user_id)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (limit) {
      query.limit(limit);
    }

    const { data, error, count } = await query;

    if (error) {
      toast.error("Failed to fetch notifications: " + error.message);
    } else {
      setNotifications(data || []);
      setTotalNotifications(count || 0);
    }
  }, [supabase, userProfile?.user_id]);

  useEffect(() => {
    if (showAllNotifications) {
      fetchNotifications();
    } else {
      fetchNotifications(3);
    }
  }, [showAllNotifications, fetchNotifications]);

  const handleNotificationClick = useCallback(async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n))
    );
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('notification_id', id);
    if (error) {
      toast.error("Failed to mark notification as read.");
      fetchNotifications(showAllNotifications ? undefined : 3); // Re-fetch to revert optimistic update
    }
  }, [supabase, fetchNotifications, showAllNotifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userProfile?.user_id)
      .eq('is_read', false);

    if (error) {
      toast.error("Failed to mark all notifications as read.");
      fetchNotifications(showAllNotifications ? undefined : 3); // Re-fetch on error
    }
  }, [supabase, userProfile?.user_id, fetchNotifications, showAllNotifications]);

  const notificationsToShow = showAllNotifications
    ? notifications
    : notifications.slice(0, 3);
    
  const hasUnreadNotifications = useMemo(() => notifications.some(n => !n.is_read), [notifications]);
  
  return (
    <DropdownMenu onOpenChange={() => setShowAllNotifications(false)}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnreadNotifications && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-popover z-50">
        {/* MODIFIED: Header is now a flex container */}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          {/* NEW: Conditional "Mark all as read" button with tooltip */}
          {hasUnreadNotifications && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="Mark all as read"
                  >
                    <MailCheck className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark all as read</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <DropdownMenuSeparator />
        <div
          className={`overflow-y-auto p-2 space-y-1 transition-all duration-300 ease-in-out ${
            showAllNotifications ? "max-h-96" : "max-h-64"
          }`}
        >
          {notificationsToShow.map((notification) => (
            <DropdownMenuItem
            //   key={notification.user_id}
              key={notification.notification_id}
              onSelect={(event) => {
                event.preventDefault();
                if (!notification.is_read) {
                  handleNotificationClick(notification.notification_id);
                }
              }}
              className={`flex flex-col items-start p-3 hover:bg-accent/50 cursor-pointer rounded-md ${
                !notification.is_read ? "bg-blue-50 dark:bg-blue-900/20" : ""
              }`}
            >
              <p
                className={`text-sm ${!notification.is_read ? "font-semibold" : ""}`}
              >
                {notification.message}
              </p>
              <span className="text-xs text-muted-foreground">
                {timeAgo(notification.created_at)}
              </span>
            </DropdownMenuItem>
          ))}
        </div>
        {totalNotifications > 3 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setShowAllNotifications((prev) => !prev);
              }}
              className="w-full text-center text-sm text-primary py-2 cursor-pointer justify-center"
            >
              {showAllNotifications ? "Show less" : "View all notifications"}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
