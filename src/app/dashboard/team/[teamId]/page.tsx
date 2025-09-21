"use client";

import { use } from "react";
import { TeamDetail } from "@/components/dashboard/team-detail";

interface TeamPageProps {
  params: Promise<{ teamId: string }>;
}

export default function TeamPage({ params }: TeamPageProps) {
  const { teamId } = use(params);

  return <TeamDetail teamId={teamId} />;
}
