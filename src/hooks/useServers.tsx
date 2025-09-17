import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Server {
  id: string;
  name: string;
  hostname: string;
  ip_address: string;
  port: number;
  description: string | null;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  cpu_cores: number | null;
  ram_gb: number | null;
  storage_gb: number | null;
  os: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServerMetric {
  id: string;
  server_id: string;
  cpu_usage: number | null;
  memory_usage_mb: number | null;
  memory_total_mb: number | null;
  disk_usage_gb: number | null;
  disk_total_gb: number | null;
  network_in_mb: number | null;
  network_out_mb: number | null;
  uptime_seconds: number | null;
  load_average: number | null;
  recorded_at: string;
}

export const useServers = () => {
  return useQuery({
    queryKey: ['servers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Server[];
    },
  });
};

export const useServerMetrics = (serverId?: string) => {
  return useQuery({
    queryKey: ['server-metrics', serverId],
    queryFn: async () => {
      if (!serverId) return null;
      
      const { data, error } = await supabase
        .from('server_metrics')
        .select('*')
        .eq('server_id', serverId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as ServerMetric | null;
    },
    enabled: !!serverId,
  });
};

export const useCreateServer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (server: Omit<Server, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('servers')
        .insert([server])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast({
        title: "Server added",
        description: "New server has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add server",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateServerStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Server['status'] }) => {
      const { data, error } = await supabase
        .from('servers')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast({
        title: "Server status updated",
        description: "Server status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update server",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};