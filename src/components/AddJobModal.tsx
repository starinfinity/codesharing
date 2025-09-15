import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JobFormData {
  jobName: string;
  schedule: string;
  serverName: string;
  fileLocation: string;
  filePattern: string;
}

interface AddJobModalProps {
  onAddJob: (jobData: JobFormData) => Promise<void>;
}

const AddJobModal: React.FC<AddJobModalProps> = ({ onAddJob }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    jobName: '',
    schedule: '',
    serverName: '',
    fileLocation: '',
    filePattern: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onAddJob(formData);
      setFormData({
        jobName: '',
        schedule: '',
        serverName: '',
        fileLocation: '',
        filePattern: '',
      });
      setOpen(false);
      toast({
        title: 'Success',
        description: 'Job added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add job',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof JobFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Job</DialogTitle>
          <DialogDescription>
            Create a new job with the following details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="jobName">Job Name</Label>
              <Input
                id="jobName"
                value={formData.jobName}
                onChange={handleChange('jobName')}
                placeholder="Enter job name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule (Cron Expression)</Label>
              <Input
                id="schedule"
                value={formData.schedule}
                onChange={handleChange('schedule')}
                placeholder="e.g., 0 6 * * *"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serverName">Server Name</Label>
              <Input
                id="serverName"
                value={formData.serverName}
                onChange={handleChange('serverName')}
                placeholder="e.g., prod-server-01"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fileLocation">File Location</Label>
              <Input
                id="fileLocation"
                value={formData.fileLocation}
                onChange={handleChange('fileLocation')}
                placeholder="e.g., /data/imports"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filePattern">File Pattern</Label>
              <Input
                id="filePattern"
                value={formData.filePattern}
                onChange={handleChange('filePattern')}
                placeholder="e.g., data_*.csv"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddJobModal;