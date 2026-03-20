"use client";

import { useEffect, useState } from "react";
import { Trash2, Mail, User, Briefcase, MessageSquare, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Submission, loadSubmissions, deleteSubmission } from "@/lib/submissions-store";

export function SubmissionsPageClient() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<"all" | "partner" | "contact">("all");

  useEffect(() => {
    setSubmissions(loadSubmissions());
  }, []);

  const handleDelete = (id: string) => {
    deleteSubmission(id);
    setSubmissions(loadSubmissions());
  };

  const filtered = filter === "all" ? submissions : submissions.filter((s) => s.type === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Form Submissions</h1>
        <p className="text-muted-foreground mt-2">
          View partner requests and contact form submissions
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "partner", "contact"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab === "all" ? "All" : tab === "partner" ? "Partner Requests" : "Contact Messages"}
            {" "}
            ({tab === "all" ? submissions.length : submissions.filter((s) => s.type === tab).length})
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No submissions yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((submission) => (
            <Card key={submission.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        submission.type === "partner"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {submission.type === "partner" ? "Partner Request" : "Contact"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(submission.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{submission.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(submission.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${submission.email}`} className="text-primary hover:underline">
                      {submission.email}
                    </a>
                  </div>

                  {submission.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${submission.phone}`} className="hover:underline">
                        {submission.phone}
                      </a>
                    </div>
                  )}

                  {submission.role && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Role: {submission.role}</span>
                    </div>
                  )}

                  {submission.partnerType && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>Partner Type: {submission.partnerType}</span>
                    </div>
                  )}

                  {submission.marketInterest && (
                    <div className="text-muted-foreground">
                      <strong>Market Interest:</strong> {submission.marketInterest}
                    </div>
                  )}

                  {submission.cashToInvest && (
                    <div className="text-muted-foreground">
                      <strong>Cash to Invest:</strong> {submission.cashToInvest}
                    </div>
                  )}

                  {submission.message && (
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <p className="text-muted-foreground whitespace-pre-wrap">{submission.message}</p>
                    </div>
                  )}

                  {submission.additionalInfo && (
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Additional Info:</p>
                      <p className="text-muted-foreground whitespace-pre-wrap">{submission.additionalInfo}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
