'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Clock, TrendingUp, Mail, Plus, Inbox } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // For now, just set initial stats
      // Blog posts will be stored in local state/DB
      setStats({
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        totalViews: 0,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      icon: FileText,
      description: 'All blog posts',
    },
    {
      title: 'Published',
      value: stats.publishedPosts,
      icon: Eye,
      description: 'Live on site',
    },
    {
      title: 'Drafts',
      value: stats.draftPosts,
      icon: Clock,
      description: 'In progress',
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: TrendingUp,
      description: 'All time views',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your admin control center
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/admin/blog/create"
              className="p-4 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Create New Post</h3>
                  <p className="text-sm text-muted-foreground">
                    Start writing a new blog post
                  </p>
                </div>
                <Plus className="h-5 w-5 text-primary" />
              </div>
            </Link>
            <Link
              href="/admin/blog"
              className="p-4 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-2">All Posts</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage existing posts
                  </p>
                </div>
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </Link>
            <Link
              href="/admin/newsletter"
              className="p-4 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Manage Newsletter</h3>
                  <p className="text-sm text-muted-foreground">
                    View newsletter subscribers
                  </p>
                </div>
                <Mail className="h-5 w-5 text-primary" />
              </div>
            </Link>
            <Link
              href="/admin/submissions"
              className="p-4 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Form Submissions</h3>
                  <p className="text-sm text-muted-foreground">
                    View partner & contact submissions
                  </p>
                </div>
                <Inbox className="h-5 w-5 text-primary" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
