import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface JobTableProps {
  jobs: Job[];
  onToggleJob: (id: number) => Promise<void>;
}

const JobTable: React.FC<JobTableProps> = ({ jobs, onToggleJob }) => {
  const [toggleLoading, setToggleLoading] = useState<number | null>(null);
  const { toast } = useToast();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Running</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Paused</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleToggle = async (job: Job) => {
    setToggleLoading(job.id);
    try {
      await onToggleJob(job.id);
      toast({
        title: 'Success',
        description: `Job ${job.status === 'paused' ? 'resumed' : 'paused'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle job status',
        variant: 'destructive',
      });
    } finally {
      setToggleLoading(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Name</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Server Name</TableHead>
            <TableHead>File Location</TableHead>
            <TableHead>File Pattern</TableHead>
            <TableHead>Last Successful</TableHead>
            <TableHead>Last Sensing</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No jobs found
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.jobName}</TableCell>
                <TableCell className="font-mono text-sm">{job.schedule}</TableCell>
                <TableCell>{job.serverName}</TableCell>
                <TableCell className="font-mono text-sm max-w-xs truncate">
                  {job.fileLocation}
                </TableCell>
                <TableCell className="font-mono text-sm">{job.filePattern}</TableCell>
                <TableCell className="text-sm">
                  {formatDate(job.lastSuccessfulAttempt)}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(job.lastSensingAttempt)}
                </TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={toggleLoading === job.id}
                      >
                        {toggleLoading === job.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        ) : job.status === 'paused' ? (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </>
                        ) : (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {job.status === 'paused' ? 'Resume' : 'Pause'} Job
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to {job.status === 'paused' ? 'resume' : 'pause'} the job "{job.jobName}"?
                          {job.status !== 'paused' && ' This will stop the job from running on its scheduled intervals.'}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleToggle(job)}>
                          {job.status === 'paused' ? 'Resume' : 'Pause'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default JobTable;