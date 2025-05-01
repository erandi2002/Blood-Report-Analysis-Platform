import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconFolder,
  IconHourglassHigh,
  IconChartBar,
} from "@tabler/icons-react";
import { usePrivy } from "@privy-io/react-auth";
import MetricsCard from "./MetricsCard";
import { useStateContext } from "../context";

const DisplayInfo = () => {
  const navigate = useNavigate();
  const { user } = usePrivy();
  const { fetchUserRecords, records, fetchUserByEmail } = useStateContext();

  const [metrics, setMetrics] = useState({
    totalReports: 0,
    completedFollowUps: 0,
    pendingActions: 0,
    criticalAlerts: 0,
  });

  useEffect(() => {
    if (user) {
      fetchUserByEmail(user.email.address)
        .then(() => {
          let totalReports = records.length;
          let completedFollowUps = 0;
          let pendingActions = 0;
          let criticalAlerts = 0;

          records.forEach((record) => {
            if (record.kanbanRecords) {
              try {
                const kanban = JSON.parse(record.kanbanRecords);
                completedFollowUps += kanban.tasks.filter(
                  (task) => task.columnId === "done"
                ).length;
                pendingActions += kanban.tasks.filter(
                  (task) => task.columnId === "todo"
                ).length;
                criticalAlerts += kanban.tasks.filter((task) =>
                  task.content.toLowerCase().includes("urgent")
                ).length;
              } catch (error) {
                console.error("Failed to parse kanbanRecords:", error);
              }
            }
          });

          setMetrics({
            totalReports,
            completedFollowUps,
            pendingActions,
            criticalAlerts,
          });
        })
        .catch((e) => console.error(e));
    }
  }, [user, fetchUserRecords, records]);

  const metricsData = [
    {
      title: "Total Reports Uploaded",
      subtitle: "View",
      value: metrics.totalReports,
      icon: IconFolder,
      onClick: () => navigate("/medical-records"),
    },
    {
      title: "completed Follow-Ups",
      subtitle: "View",
      value: metrics.completedFollowUps,
      icon: IconCircleCheck,
      onClick: () => navigate("/screenings/completed"),
    },
    {
      title: "Pending Actions",
      subtitle: "View",
      value: metrics.pendingActions,
      icon: IconHourglassHigh,
      onClick: () => navigate("/screenings/pending"),
    },
    {
      title: "Critical Alerts",
      subtitle: "View",
      value: metrics.criticalAlerts,
      icon: IconAlertTriangle,
      onClick: () => navigate("/screenings/critical"),
    },
    {
      title: "View Progress Charts",
      subtitle: "Explore",
      value: "-",
      icon: IconChartBar,
      onClick: () => navigate("/progress"),
    },
  ];

  return (
    <div className="flex flex-col gap-6 mt-7 w-full">
      {/* Row 1: Reports + Follow-ups */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <MetricsCard {...metricsData[0]} />
        <MetricsCard {...metricsData[1]} />
      </div>
  
      {/* Row 2: Pending + Alerts */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <MetricsCard {...metricsData[2]} />
        <MetricsCard {...metricsData[3]} />
      </div>
  
      {/* Row 3: Chart card aligned same size */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <MetricsCard {...metricsData[4]} />
      </div>
    </div>
  );  
  
};

export default DisplayInfo;
