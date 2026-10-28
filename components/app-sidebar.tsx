import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";

const ChatWrapper = dynamic(() => import("./chat/ChatWrapper"), {
  loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 space-y-3 text-muted-foreground animate-pulse">
      <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      <span className="text-xs">Connecting AI Assistant...</span>
    </div>
  ),
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent className="h-full w-full bg-background border-l border-border">
        <Suspense
          fallback={
            <div className="h-full w-full flex flex-col items-center justify-center p-6 space-y-3 text-muted-foreground animate-pulse">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <span className="text-xs">Connecting AI Assistant...</span>
            </div>
          }
        >
          <ChatWrapper />
        </Suspense>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
