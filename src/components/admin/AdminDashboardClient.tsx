"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FileText, Eye, Clock, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadAdminBlogPosts } from "@/lib/admin-blog-store";

export function AdminDashboardClient() {
  const stats = useMemo(() => {
    const posts = loadAdminBlogPosts();
    const published = posts.filter((post) => post.status === "published").length;
    const drafts = posts.filter((post) => post.status === "draft").length;

    return {
      totalPosts: posts.length,
      publishedPosts: published,
      draftPosts: drafts,
    };
  }, []);

  const statCards = [
    { title: "Total Insights", value: stats.totalPosts, icon: FileText },
    { title: "Published", value: stats.publishedPosts, icon: Eye },
    { title: "Drafts", value: stats.draftPosts, icon: Clock },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage Focus Health admin content and insights</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog">
            <PlusCircle className="h-4 w-4 mr-2" />
            Manage Insights
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
