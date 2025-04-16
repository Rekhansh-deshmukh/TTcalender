'use client';

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format } from 'date-fns';

interface ClassSchedule {
  className: string;
  time: string;
  day: string;
  location: string;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function generateICS(schedule: ClassSchedule[]): string {
  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ClassSync//NONSGML v1.0//EN
`;

  schedule.forEach((cls) => {
    const [startTime, endTime] = cls.time.split('-').map(t => t.trim());

    // Convert start and end times to a 24-hour format
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Get the current year
    const currentYear = new Date().getFullYear();

    // Map the day of the week to a specific start date within the current year
    const dayToDateMap: { [key: string]: string } = {
      'Monday': `${currentYear}0909`,
      'Tuesday': `${currentYear}0910`,
      'Wednesday': `${currentYear}0911`,
      'Thursday': `${currentYear}0912`,
      'Friday': `${currentYear}0913`,
      'Saturday': `${currentYear}0914`,
      'Sunday': `${currentYear}0915`,
    };

    // Convert day of the week to a date string in YYYYMMDD format
    const startDate = dayToDateMap[cls.day];

    icsContent += `BEGIN:VEVENT
UID:${Math.random().toString(36).substring(2)}@classsync
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, -5)}Z
DTSTART;VALUE=DATE-TIME:${startDate}T${String(startHour).padStart(2, '0')}${String(startMinute).padStart(2, '0')}00
DTEND;VALUE=DATE-TIME:${startDate}T${String(endHour).padStart(2, '0')}${String(endMinute).padStart(2, '0')}00
SUMMARY:${cls.className}
LOCATION:${cls.location}
END:VEVENT
`;
  });

  icsContent += 'END:VCALENDAR';
  return icsContent;
}

export default function Home() {
  const [schedule, setSchedule] = useState<ClassSchedule[]>([]);
  const [className, setClassName] = useState('');
  const [time, setTime] = useState('');
  const [day, setDay] = useState('');
  const [location, setLocation] = useState('');

  const addClass = () => {
    if (className && time && day && location) {
      setSchedule([...schedule, { className, time, day, location }]);
      setClassName('');
      setTime('');
      setDay('');
      setLocation('');
    }
  };

  const downloadICSFile = () => {
    const icsContent = generateICS(schedule);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Class Schedule Input</CardTitle>
          <CardDescription>Enter your class details below.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="className">Class Name</Label>
            <Input id="className" value={className} onChange={(e) => setClassName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="time">Time (e.g., 9:00-10:00)</Label>
            <Input id="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="day">Day</Label>
            <select
              id="day"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              <option value="">Select Day</option>
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <Button onClick={addClass}>Add Class</Button>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mt-4">
        <CardHeader>
          <CardTitle>Weekly Timetable</CardTitle>
          <CardDescription>Your schedule at a glance.</CardDescription>
        </CardHeader>
        <CardContent>
          {schedule.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">Class</th>
                  <th className="border p-2">Time</th>
                  <th className="border p-2">Day</th>
                  <th className="border p-2">Location</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((cls, index) => (
                  <tr key={index}>
                    <td className="border p-2">{cls.className}</td>
                    <td className="border p-2">{cls.time}</td>
                    <td className="border p-2">{cls.day}</td>
                    <td className="border p-2">{cls.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No classes added yet.</p>
          )}
        </CardContent>
      </Card>
      
      {schedule.length > 0 && (
        <Button className="mt-4" onClick={downloadICSFile}>Download ICS File</Button>
      )}
    </div>
  );
}
