import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Process {
  id: string;
  server_id: string;
  pid: number;
  name: string;
  command: string | null;
  cpu_percent: number | null;
  memory_mb: number | null;
  status: 'running' | 'stopped' | 'sleeping' | 'zombie';
  started_at: string | null;
  recorded_at: string;
}

export const useProcesses = (serverId?: string) => {
  return useQuery({
    queryKey: ['processes', serverId],
    queryFn: async () => {
      let query = supabase
        .from('processes')
        .select('*')
        .order('recorded_at', { ascending: false });
      
      if (serverId) {
        query = query.eq('server_id', serverId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Process[];
    },
  });
};

export const useTerminateProcess = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('processes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      toast({
        title: "Process terminated",
        description: "Process has been terminated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to terminate process",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};