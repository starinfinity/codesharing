import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import JobTable from '@/components/JobTable';
import AddJobModal from '@/components/AddJobModal';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { buildApiUrl, API_CONFIG } from '@/config/api';

interface Job {
  id: number;
  jobName: string;
  schedule: string;
  serverName: string;
  fileLocation: string;
  filePattern: string;
  lastSuccessfulAttempt: string | null;
  lastSensingAttempt: string | null;
  status: 'running' | 'failed' | 'paused';
}

interface JobFormData {
  jobName: string;
  schedule: string;
  serverName: string;
  fileLocation: string;
  filePattern: string;
}

const FilteringJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.FILTERING_JOBS));
      setJobs(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch filtering jobs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddJob = async (jobData: JobFormData) => {
    const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.FILTERING_JOBS), jobData);
    setJobs(prev => [...prev, response.data]);
  };

  const handleToggleJob = async (jobId: number) => {
    const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.FILTERING_JOB_TOGGLE(jobId)));
    setJobs(prev => 
      prev.map(job => job.id === jobId ? response.data : job)
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-96 bg-muted rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Character Filtering Jobs</h1>
          <p className="text-muted-foreground">
            Monitor and manage your character filtering jobs
          </p>
        </div>
        <AddJobModal onAddJob={handleAddJob} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jobs Overview</CardTitle>
          <CardDescription>
            All character filtering jobs in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobTable jobs={jobs} onToggleJob={handleToggleJob} />
        </CardContent>
      </Card>
    </div>
  );
};

export default FilteringJobsPage;