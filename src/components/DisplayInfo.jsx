import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconFileText,
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertOctagon,
} from "@tabler/icons-react";

import { usePrivy } from "@privy-io/react-auth";
import MetricsCard from "./MetricsCard"; // Adjust the import path
import { useStateContext } from "../context"; // Ensure correct import path

const DisplayInfo = () => {
  const navigate = useNavigate();
  const { user } = usePrivy();
  const { fetchUserRecords, records, fetchUserByEmail } = useStateContext();
  const [metrics, setMetrics] = useState({
    totalReports: 0,
    normalReports: 0,
    abnormalReports: 0,
    criticalAlerts: 0,
  });

  useEffect(() => {
    if (user) {
      fetchUserByEmail(user.email.address)
        .then(() => {
          console.log(records);
          const totalReports = records.length;
          let normalReports = 0;
          let abnormalReports = 0;
          let criticalAlerts = 0;

          records.forEach((record) => {
            if (record.analysisResults) {
              try {
                const analysis = JSON.parse(record.analysisResults);
                if (analysis.status === "normal") normalReports++;
                if (analysis.status === "abnormal") abnormalReports++;
                if (analysis.status === "critical") criticalAlerts++;
              } catch (error) {
                console.error("Failed to parse analysisResults:", error);
              }
            }
          });

          setMetrics({
            totalReports,
            normalReports,
            abnormalReports,
            criticalAlerts,
          });
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [user, fetchUserRecords, records]);

  const metricsData = [
    {
      title: "Total Reports Uploaded",
      subtitle: "View",
      value: metrics.totalReports,
      icon: IconFileText,
      onClick: () => navigate("/reports"),
    },
    {
      title: "Normal Reports",
      subtitle: "View",
      value: metrics.normalReports,
      icon: IconCircleCheck,
      onClick: () => navigate("/reports/normal"),
    },
    {
      title: "Abnormal Reports",
      subtitle: "View",
      value: metrics.abnormalReports,
      icon: IconAlertTriangle,
      onClick: () => navigate("/reports/abnormal"),
    },
    {
      title: "Critical Alerts",
      subtitle: "View",
      value: metrics.criticalAlerts,
      icon: IconAlertOctagon,
      onClick: () => navigate("/reports/critical"),
    },
  ];
  

  return (
    <div className="flex flex-wrap gap-[26px]">
      <div className="mt-7 grid w-full gap-4 sm:grid-cols-2 sm:gap-6">
        {metricsData.map((metric) => (
          <MetricsCard key={metric.title} {...metric} />
        ))}
      </div>

    </div>
  );
};

export default DisplayInfo;
