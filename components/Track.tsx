'use client';

import { useState } from 'react';
import AreaChart from '@/components/AreaChartComponent';
import ScreenTimeGraph from '@/components/AreaChartComponent';

const Track = () => {
  const [screenTime, setScreenTime] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const weeklyUsage = {
        usage: screenTime,
        date: new Date(date).toISOString()
    }

    try {
      const response = await fetch(
        'https://digital-detox-y73b.onrender.com/tracker',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ weeklyUsage }),
        }
      );

      if (response.ok) {
        alert('Screen time data saved!');
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData);
        alert('Error saving data');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving data');
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">Track Screen Time</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Screen Time (hrs)</label>
          <input
            type="number"
            value={screenTime}
            onChange={(e) => setScreenTime(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit
        </button>
      </form>

      {/* Chart Section */}
      <div className=" my-10 max-w-[1000px] h-auto md:mx-auto mx-auto text-center">
        <p className='text-[30px] my-5'>Screen Time Usage</p>
        <ScreenTimeGraph/>
      </div>
    </div>
  );
};

export default Track;
