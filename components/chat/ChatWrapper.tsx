import Chat from "@/components/chat/Chat";
import { getProfile } from "@/lib/db-service";
import SidebarToggle from "../SidebarToggle";

async function ChatWrapper() {
  const profile = await getProfile();

  return (
    <div className="h-full w-full">
      <div className="md:hidden p-2 sticky top-0 z-10">
        <SidebarToggle />
      </div>

      <Chat profile={profile} />
    </div>
  );
}

export default ChatWrapper;
