"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import LoadingCursor from "@/app/loading";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

// Function to group data by date
const groupByDate = (data: { date: string; entries: { category: string, timeSpent: number }[] }[]) => {
  const groupedData = new Map<string, { category: string, timeSpent: number }[]>();

  data.forEach((entry) => {
    const formattedDate = formatDate(entry.date);
    const existingEntries = groupedData.get(formattedDate) || [];
    entry.entries.forEach((subEntry) => {
      const existingCategory = existingEntries.find((e) => e.category === subEntry.category);
      if (existingCategory) {
        existingCategory.timeSpent += subEntry.timeSpent; // Aggregate timeSpent by category
      } else {
        existingEntries.push(subEntry);
      }
    });
    groupedData.set(formattedDate, existingEntries);
  });

  return Array.from(groupedData, ([date, entries]) => ({ date, entries })).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

interface ScreenTimeGraphProps {
  refreshGraph: boolean;
  dotThreshold?: number;
}

const ScreenTimeGraph: React.FC<ScreenTimeGraphProps> = ({ refreshGraph, dotThreshold = 6 }) => {
  const [state, setState] = useState<{
    loading: boolean;
    data: { date: string; entries: { category: string, timeSpent: number }[] }[];
  }>({
    loading: true,
    data: [],
  });

  // Fetching data from the backend
  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const response = await fetch("https://digital-detox-y73b.onrender.com/tracker", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const result = await response.json();
      const groupedData = groupByDate(result.data); // Adjusted to new schema
      setState({ loading: false, data: groupedData });
    } catch (error) {
      console.error("Error in the fetch", error);
      setState({ loading: false, data: [] });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshGraph]);

  const chartData = useMemo(() => state.data, [state.data]);

  // Calculate average time spent from an array of time entries
  const calculateAverage = (entries: { timeSpent: number }[]) => {
    const total = entries.reduce((sum, entry) => sum + entry.timeSpent, 0);
    return total / entries.length || 0;
  };

  // Get today's screen time stats
  const getDailyStats = () => {
    const today = new Date().toLocaleDateString();
    const todayData = chartData.filter((entry) => entry.date === today);
    return todayData.length ? todayData : null;
  };

  // Get weekly screen time stats
  const getWeeklyStats = () => {
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    const currentWeekEnd = new Date();
    currentWeekEnd.setDate(currentWeekEnd.getDate() + (6 - currentWeekEnd.getDay()));

    const weeklyData = chartData.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= currentWeekStart && entryDate <= currentWeekEnd;
    });

    return weeklyData.length ? weeklyData : null;
  };

  // Get monthly screen time stats
  const getMonthlyStats = () => {
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    const currentMonthEnd = new Date();
    currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
    currentMonthEnd.setDate(0);

    const monthlyData = chartData.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= currentMonthStart && entryDate <= currentMonthEnd;
    });

    return monthlyData.length ? monthlyData : null;
  };

  // Calculate statistics for daily, weekly, and monthly data
  const dailyStats = getDailyStats();
  const weeklyStats = getWeeklyStats();
  const monthlyStats = getMonthlyStats();

  return (
    <div className="w-full h-full bg-blue-50 py-10 px-5">
      {state.loading ? (
        <div className="flex justify-center items-center">
          <LoadingCursor w={300} h={300} />
        </div>
      ) : (
        <div>
          {/* Daily Stats */}
          <div className="bg-white p-5 rounded-lg shadow-lg mb-5">
            <h2 className="text-xl font-semibold text-center text-blue-700">Daily Screen Time</h2>
            {dailyStats ? (
              <div className="text-center">
                {dailyStats.map((entry: any) => (
                  <p className="text-lg text-blue-600" key={entry.date}>
                    {entry.category}: {entry.timeSpent} minutes
                  </p>
                ))}
                <p className="text-md text-blue-600">
                  Average Screen Time: {calculateAverage(dailyStats.flatMap((e) => e.entries)).toFixed(2)} minutes
                </p>
              </div>
            ) : (
              <p className="text-center text-red-600">No data available for today.</p>
            )}
          </div>

          {/* Weekly Stats */}
          <div className="bg-white p-5 rounded-lg shadow-lg mb-5">
            <h2 className="text-xl font-semibold text-center text-blue-700">Weekly Screen Time</h2>
            {weeklyStats ? (
              <div className="text-center">
                {weeklyStats.map((entry: any) => (
                  <p className="text-lg text-blue-600" key={entry.date}>
                    {entry.category}: {entry.timeSpent} minutes
                  </p>
                ))}
                <p className="text-md text-blue-600">
                  Average Screen Time This Week: {calculateAverage(weeklyStats.flatMap((e) => e.entries)).toFixed(2)} minutes
                </p>
              </div>
            ) : (
              <p className="text-center text-red-600">No data available for this week.</p>
            )}
          </div>

          {/* Monthly Stats */}
          <div className="bg-white p-5 rounded-lg shadow-lg mb-5">
            <h2 className="text-xl font-semibold text-center text-blue-700">Monthly Screen Time</h2>
            {monthlyStats ? (
              <div className="text-center">
                {monthlyStats.map((entry: any) => (
                  <p className="text-lg text-blue-600" key={entry.date}>
                    {entry.category}: {entry.timeSpent} minutes
                  </p>
                ))}
                <p className="text-md text-blue-600">
                  Average Screen Time This Month: {calculateAverage(monthlyStats.flatMap((e) => e.entries)).toFixed(2)} minutes
                </p>
              </div>
            ) : (
              <p className="text-center text-red-600">No data available for this month.</p>
            )}
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-5 rounded-lg shadow-lg mb-5">
            <h2 className="text-xl font-semibold text-center text-blue-700">Screen Time Chart</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData.flatMap((entry) =>
                  entry.entries.map((subEntry) => ({
                    date: entry.date,
                    category: subEntry.category,
                    timeSpent: subEntry.timeSpent,
                  }))
                )}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="timeSpent" fill="#4C9FEF" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-5 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-center text-blue-700">Screen Time Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.flatMap((entry) =>
                    entry.entries.map((subEntry) => ({
                      name: subEntry.category,
                      value: subEntry.timeSpent,
                    }))
                  )}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#4C9FEF"
                  label
                >
                  {chartData.flatMap((entry) =>
                    entry.entries.map((subEntry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? "#4C9FEF" : "#6CC8FF"}
                      />
                    ))
                  )}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ScreenTimeGraph);