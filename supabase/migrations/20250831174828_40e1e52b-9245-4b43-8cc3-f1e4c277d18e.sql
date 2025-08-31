-- Create user profiles table for storing user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create servers table for managing multiple servers
CREATE TABLE public.servers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  hostname TEXT NOT NULL,
  ip_address INET NOT NULL,
  port INTEGER DEFAULT 22,
  description TEXT,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance', 'error')),
  cpu_cores INTEGER,
  ram_gb INTEGER,
  storage_gb INTEGER,
  os TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on servers
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;

-- Create policies for servers (admins can manage all, users can view)
CREATE POLICY "Users can view servers" 
ON public.servers 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can manage servers" 
ON public.servers 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create server_metrics table for storing real-time metrics
CREATE TABLE public.server_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id UUID REFERENCES public.servers(id) ON DELETE CASCADE NOT NULL,
  cpu_usage DECIMAL(5,2),
  memory_usage_mb INTEGER,
  memory_total_mb INTEGER,
  disk_usage_gb INTEGER,
  disk_total_gb INTEGER,
  network_in_mb DECIMAL(10,2),
  network_out_mb DECIMAL(10,2),
  uptime_seconds BIGINT,
  load_average DECIMAL(4,2),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on server_metrics
ALTER TABLE public.server_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for server_metrics
CREATE POLICY "Users can view server metrics" 
ON public.server_metrics 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can insert server metrics" 
ON public.server_metrics 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create processes table for tracking server processes
CREATE TABLE public.processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id UUID REFERENCES public.servers(id) ON DELETE CASCADE NOT NULL,
  pid INTEGER NOT NULL,
  name TEXT NOT NULL,
  command TEXT,
  cpu_percent DECIMAL(5,2),
  memory_mb DECIMAL(10,2),
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'stopped', 'sleeping', 'zombie')),
  started_at TIMESTAMP WITH TIME ZONE,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on processes
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;

-- Create policy for processes
CREATE POLICY "Users can view processes" 
ON public.processes 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can manage processes" 
ON public.processes 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create files table for file management
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id UUID REFERENCES public.servers(id) ON DELETE CASCADE NOT NULL,
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('file', 'directory')),
  size_bytes BIGINT,
  permissions TEXT,
  owner TEXT,
  group_name TEXT,
  modified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(server_id, path)
);

-- Enable RLS on files
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Create policy for files
CREATE POLICY "Users can view files" 
ON public.files 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can manage files" 
ON public.files 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create audit_logs table for tracking changes
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  server_id UUID REFERENCES public.servers(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for audit_logs (admins only)
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_servers_updated_at
  BEFORE UPDATE ON public.servers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data for development
INSERT INTO public.servers (name, hostname, ip_address, description, status, cpu_cores, ram_gb, storage_gb, os) VALUES
('Production Web Server', 'web-prod-01', '192.168.1.100', 'Main production web server', 'online', 8, 32, 500, 'Ubuntu 22.04 LTS'),
('Database Server', 'db-prod-01', '192.168.1.101', 'Primary database server', 'online', 16, 64, 1000, 'Ubuntu 22.04 LTS'),
('Development Server', 'dev-01', '192.168.1.102', 'Development and testing server', 'online', 4, 16, 250, 'Ubuntu 22.04 LTS');

-- Insert sample metrics for the servers
INSERT INTO public.server_metrics (server_id, cpu_usage, memory_usage_mb, memory_total_mb, disk_usage_gb, disk_total_gb, network_in_mb, network_out_mb, uptime_seconds, load_average) 
SELECT 
  s.id,
  67.8,
  12800,
  16384,
  456,
  500,
  1024.5,
  2048.3,
  2592000,
  1.45
FROM public.servers s
WHERE s.name = 'Production Web Server';

-- Insert sample processes
INSERT INTO public.processes (server_id, pid, name, command, cpu_percent, memory_mb, status, started_at)
SELECT 
  s.id,
  1234,
  'nginx',
  'nginx: master process /usr/sbin/nginx -g daemon on; master_process on;',
  15.2,
  45.6,
  'running',
  now() - interval '30 days'
FROM public.servers s
WHERE s.name = 'Production Web Server';

-- Insert sample files
INSERT INTO public.files (server_id, path, name, type, size_bytes, permissions, owner, group_name, modified_at)
SELECT 
  s.id,
  '/etc/nginx/nginx.conf',
  'nginx.conf',
  'file',
  3200,
  '-rw-r--r--',
  'root',
  'root',
  now() - interval '1 day'
FROM public.servers s
WHERE s.name = 'Production Web Server';