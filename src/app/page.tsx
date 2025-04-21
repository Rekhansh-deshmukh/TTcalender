'use client';

import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

const formSchema = z.object({
  className: z.string().min(2, {
    message: "Class name must be at least 2 characters.",
  }),
  time: z.string().min(2, {
    message: "Time must be at least 2 characters.",
  }),
  day: z.string({
    required_error: "Please select a day.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
})

export default function Home() {
  const [schedule, setSchedule] = useState<ClassSchedule[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      className: "",
      time: "",
      day: "",
      location: "",
    },
  })

  const addClass = (values: z.infer<typeof formSchema>) => {
    if (values.className && values.time && values.day && values.location) {
      setSchedule([...schedule, values]);
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
          
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={(e) => {
             e.preventDefault()
            form.handleSubmit(addClass)(e)
          }}>
            <CardTitle>Class Schedule Input</CardTitle>
            <CardDescription>Enter your class details below.</CardDescription>
            <div className="grid gap-2">
              <Label htmlFor="className">Class Name</Label>
              <Input id="className" {...form.register("className")} />
              {form.formState.errors.className && (
                <p className="text-red-500">{form.formState.errors.className.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Time (e.g., 9:00-10:00)</Label>
              <Input id="time" {...form.register("time")} />
              {form.formState.errors.time && (
                <p className="text-red-500">{form.formState.errors.time.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="day">Day</Label>
              <Select onValueChange={form.setValue.bind(null, 'day')} defaultValue={form.getValues("day")} >
                <SelectTrigger id="day">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                </SelectContent>
              </Select>
              {form.formState.errors.day && (
                <p className="text-red-500">{form.formState.errors.day.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...form.register("location")} />
              {form.formState.errors.location && (
                <p className="text-red-500">{form.formState.errors.location.message}</p>
              )}
            </div>
            <Button type="submit">Add Class</Button>
          </form>
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
