'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function NewsletterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-primary hover:underline">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold">Newsletter Management</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Newsletter management coming soon.</p>
          <p className="text-sm text-muted-foreground mt-2">
            You can manage newsletter subscribers and send campaigns here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
