import { adminGetContactMessages } from "@/app/data/admin/admin-get-contact-messages";
import { EmptyState } from "@/components/general/EmptyState";
import { MessageCircleIcon } from "lucide-react";

import { ContactMessageCard } from "./ContactMessageCard";

export async function ContactMessagesList() {
  const messages = await adminGetContactMessages();

  if (messages.length === 0) {
    return (
      <EmptyState
        fill
        icon={MessageCircleIcon}
        title="No messages yet"
        description="When visitors send a message via the contact form, it will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground tabular-nums">
            {messages.length}
          </span>{" "}
          {messages.length === 1 ? "message" : "messages"} total
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {messages.map((message) => (
          <ContactMessageCard key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
