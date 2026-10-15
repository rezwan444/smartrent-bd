"use client";
import { usePathname } from "next/navigation";

const TeamDetails = () => {
  const pathname = usePathname();
  console.log(pathname);
  return (
    <div>
      <div>
        <h2>Team Details</h2>
        <p>{pathname.toString()}</p>
      </div>
    </div>
  );
};

export default TeamDetails;
