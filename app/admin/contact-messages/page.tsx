import { Suspense } from "react";

import { PageHeader } from "@/components/admin/page-header";

import { ContactMessagesList } from "./_components/ContactMessagesList";
import { ContactMessagesListSkeleton } from "./_components/ContactMessagesListSkeleton";

export default function ContactMessagesPage() {
  return (
    <>
      <PageHeader title="Contact Messages" />

      <Suspense fallback={<ContactMessagesListSkeleton />}>
        <ContactMessagesList />
      </Suspense>
    </>
  );
}
