import React from "react";
import KanbanBoard from "../components/KanbanBoard";
import { useLocation } from "react-router-dom";

const ScreeningSchedule = () => {
  const state = useLocation();

  return (
    <div className="w-full overflow-scroll px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-xl font-bold text-white">Your Follow-Up Checklist</h2>
      <p className="text-sm text-neutral-400 mt-1 mb-6">
        These are suggested actions based on your most recent blood report. You can track what you’ve done or plan what’s next.
      </p>

      <KanbanBoard state={state} />
    </div>
  );
};

export default ScreeningSchedule;
