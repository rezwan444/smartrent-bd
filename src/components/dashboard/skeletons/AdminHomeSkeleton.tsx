import StatsCard from "@/components/shared/StatsCard";
import MostViewedTeamsCard from "../pages/admin/AdminHome/MostViewedTeamsCard";
import NextMajorEvent from "../pages/admin/AdminHome/NextMajorEvent";
import RecentCheatingAlerts from "../pages/admin/AdminHome/RecentCheatingAlerts";
import TodaysMatchesCard from "../pages/admin/AdminHome/TodaysMatchesCard";
import WaitlistCard from "../pages/admin/AdminHome/WaitlistCard";

const AdminHomeSkeleton = () => {
  return (
    <div>
      {/* Cards */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Registered" isLoading={true} />
        <StatsCard title="Assigned Teams" isLoading={true} />
        <StatsCard title="Investigations" isLoading={true} />
        <StatsCard title="Revenue (7 days)" isLoading={true} />
      </div>
      {/* NextMajorEvent */}
      <div className="mt-8">
        <NextMajorEvent
          title="Loading Event..."
          eventName=""
          dateText=""
          isLoading={true}
        />
      </div>
      {/* Statistics Display Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        <MostViewedTeamsCard isLoading={true} />
        <RecentCheatingAlerts isLoading={true} />
      </div>

      {/* Todays Matches, Waitlist */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 ">
        <TodaysMatchesCard isLoading={true} />
        <WaitlistCard isLoading={true} />
      </div>
    </div>
  );
};

export default AdminHomeSkeleton;
