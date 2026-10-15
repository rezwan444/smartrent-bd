import MatchDetailsPage from "@/components/dashboard/pages/admin/live-matches/details/MatchDetailsPage";
import React from "react";

type Props = {
  params: Promise<{
    matchId: string;
  }>;
};

const Page = async ({ params }: Props) => {
  const resolvedParams = await params;
  return (
    <>
      <MatchDetailsPage matchId={resolvedParams.matchId} />
    </>
  );
};

export default Page;
