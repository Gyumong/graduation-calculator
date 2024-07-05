'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

const fetchScrapingData = async (username, password) => {
  const response = await fetch('/api/startScrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  const taskId = data.taskId;

  // Polling for task status
  let taskStatusResponse;
  do {
    await new Promise(resolve => setTimeout(resolve, 2000)); // wait for 2 seconds
    taskStatusResponse = await fetch(`/api/taskStatus?taskId=${taskId}`);
    const taskData = await taskStatusResponse.json();
    if (taskData.status === 'completed') {
      return taskData.data;
    } else if (taskData.status === 'failed') {
      throw new Error('Task failed.');
    }
  } while (taskStatusResponse.status === 200);

  throw new Error('Task polling failed.');
};

const ScrapePage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScrape = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchScrapingData(username, password);
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="w-full px-4">
        <div className="flex flex-col gap-4 mt-10 mb-10">

        <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="학번"
        />
        <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
        />
        </div>
        <Button onClick={handleScrape} disabled={loading} className="w-full">
          {loading ? '계산중...' : '계산하기'}
        </Button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {data && (
            <Accordion type="single" collapsible>
              {data.map((semesterData, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="mb-4">{semesterData.semester}</AccordionTrigger>
                    <AccordionContent>
                      {semesterData.courses.map((course, courseIndex) => (
                          <Card className="w-full mb-4">
                            <CardHeader>
                              <CardTitle>{course.courseName}</CardTitle>
                              <CardDescription>{course.departmentName}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-2">
                                <div>
                                  <strong>강의 교수:</strong> {course.professorName}
                                </div>
                                <div>
                                  <strong>Schedule:</strong> {course.scheduleSummary}
                                </div>
                                <div>
                                  <strong>수강 학점:</strong> {course.points}
                                </div>
                                <div>
                                  <strong>수강 학기:</strong> {course.subjectEstablishmentYearSemester}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
              ))}
            </Accordion>
        )}
      </div>
  );
};

export default ScrapePage;