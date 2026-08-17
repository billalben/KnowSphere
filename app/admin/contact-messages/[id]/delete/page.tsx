import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { adminGetContactMessage } from "@/app/data/admin/admin-get-contact-messages";
import { PageHeader } from "@/components/admin/page-header";
import { notFound } from "next/navigation";

import { DeleteContactMessageForm } from "./_components/DeleteContactMessageForm";

type Params = Promise<{ id: string }>;

export default async function DeleteContactMessagePage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const message = await adminGetContactMessage(id);

  if (!message) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader backHref="/admin/contact-messages" title="Delete Message" />

      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Are you sure?</CardTitle>
            <CardDescription>
              This action cannot be undone. This will permanently delete the
              message from <strong>&ldquo;{message.name}&rdquo;</strong> (
              {message.email}).
            </CardDescription>
          </CardHeader>

          <CardContent>
            <DeleteContactMessageForm messageId={id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
