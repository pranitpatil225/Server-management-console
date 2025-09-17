import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FileItem {
  id: string;
  server_id: string;
  path: string;
  name: string;
  type: 'file' | 'directory';
  size_bytes: number | null;
  permissions: string | null;
  owner: string | null;
  group_name: string | null;
  modified_at: string | null;
  created_at: string;
}

export const useFiles = (serverId?: string, path?: string) => {
  return useQuery({
    queryKey: ['files', serverId, path],
    queryFn: async () => {
      if (!serverId) return [];
      
      let query = supabase
        .from('files')
        .select('*')
        .eq('server_id', serverId)
        .order('type', { ascending: false }) // directories first
        .order('name', { ascending: true });
      
      if (path) {
        query = query.like('path', `${path}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as FileItem[];
    },
    enabled: !!serverId,
  });
};

export const useCreateFile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: Omit<FileItem, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('files')
        .insert([file])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast({
        title: "File created",
        description: "File has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create file",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast({
        title: "File deleted",
        description: "File has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete file",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};