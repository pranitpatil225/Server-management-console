-- Add more servers for management
INSERT INTO public.servers (name, hostname, ip_address, description, status, cpu_cores, ram_gb, storage_gb, os) VALUES
('Load Balancer', 'lb-prod-01', '192.168.1.103', 'Primary load balancer for web traffic', 'online', 4, 8, 100, 'Ubuntu 22.04 LTS'),
('Backup Server', 'backup-01', '192.168.1.104', 'Automated backup and disaster recovery', 'online', 8, 16, 2000, 'Ubuntu 22.04 LTS'),
('Monitoring Server', 'monitor-01', '192.168.1.105', 'System monitoring and alerting', 'online', 2, 4, 200, 'Ubuntu 22.04 LTS'),
('API Gateway', 'api-gw-01', '192.168.1.106', 'API management and gateway', 'maintenance', 6, 12, 300, 'Ubuntu 22.04 LTS');

-- Add sample metrics for all servers
INSERT INTO public.server_metrics (server_id, cpu_usage, memory_usage_mb, memory_total_mb, disk_usage_gb, disk_total_gb, network_in_mb, network_out_mb, uptime_seconds, load_average) 
SELECT 
  s.id,
  CASE s.name
    WHEN 'Database Server' THEN 45.3
    WHEN 'Development Server' THEN 23.1
    WHEN 'Load Balancer' THEN 12.8
    WHEN 'Backup Server' THEN 8.9
    WHEN 'Monitoring Server' THEN 35.2
    WHEN 'API Gateway' THEN 28.7
    ELSE 15.0
  END,
  CASE s.name
    WHEN 'Database Server' THEN 52000
    WHEN 'Development Server' THEN 8200
    WHEN 'Load Balancer' THEN 4100
    WHEN 'Backup Server' THEN 12800
    WHEN 'Monitoring Server' THEN 2800
    WHEN 'API Gateway' THEN 9600
    ELSE 4000
  END,
  CASE s.name
    WHEN 'Database Server' THEN 65536
    WHEN 'Development Server' THEN 16384
    WHEN 'Load Balancer' THEN 8192
    WHEN 'Backup Server' THEN 16384
    WHEN 'Monitoring Server' THEN 4096
    WHEN 'API Gateway' THEN 12288
    ELSE 8192
  END,
  CASE s.name
    WHEN 'Database Server' THEN 780
    WHEN 'Development Server' THEN 120
    WHEN 'Load Balancer' THEN 45
    WHEN 'Backup Server' THEN 1200
    WHEN 'Monitoring Server' THEN 150
    WHEN 'API Gateway' THEN 180
    ELSE 100
  END,
  s.storage_gb,
  CASE s.name
    WHEN 'Database Server' THEN 2048.5
    WHEN 'Development Server' THEN 512.3
    WHEN 'Load Balancer' THEN 4096.8
    WHEN 'Backup Server' THEN 256.1
    WHEN 'Monitoring Server' THEN 1024.7
    WHEN 'API Gateway' THEN 1536.4
    ELSE 1024.0
  END,
  CASE s.name
    WHEN 'Database Server' THEN 1024.2
    WHEN 'Development Server' THEN 256.7
    WHEN 'Load Balancer' THEN 2048.9
    WHEN 'Backup Server' THEN 128.5
    WHEN 'Monitoring Server' THEN 512.3
    WHEN 'API Gateway' THEN 768.6
    ELSE 512.0
  END,
  CASE s.name
    WHEN 'Database Server' THEN 5184000
    WHEN 'Development Server' THEN 2592000
    WHEN 'Load Balancer' THEN 7776000
    WHEN 'Backup Server' THEN 1296000
    WHEN 'Monitoring Server' THEN 3888000
    WHEN 'API Gateway' THEN 4320000
    ELSE 2592000
  END,
  CASE s.name
    WHEN 'Database Server' THEN 2.15
    WHEN 'Development Server' THEN 0.85
    WHEN 'Load Balancer' THEN 0.45
    WHEN 'Backup Server' THEN 0.12
    WHEN 'Monitoring Server' THEN 1.35
    WHEN 'API Gateway' THEN 1.78
    ELSE 1.0
  END
FROM public.servers s
WHERE s.name IN ('Database Server', 'Development Server', 'Load Balancer', 'Backup Server', 'Monitoring Server', 'API Gateway');

-- Add sample processes for different servers
INSERT INTO public.processes (server_id, pid, name, command, cpu_percent, memory_mb, status, started_at)
SELECT 
  s.id,
  CASE s.name
    WHEN 'Database Server' THEN 5432
    WHEN 'Load Balancer' THEN 8080
    WHEN 'Backup Server' THEN 9876
    WHEN 'Monitoring Server' THEN 3000
    WHEN 'API Gateway' THEN 8443
    ELSE 1000
  END,
  CASE s.name
    WHEN 'Database Server' THEN 'postgres'
    WHEN 'Load Balancer' THEN 'haproxy'
    WHEN 'Backup Server' THEN 'rsync'
    WHEN 'Monitoring Server' THEN 'prometheus'
    WHEN 'API Gateway' THEN 'kong'
    ELSE 'systemd'
  END,
  CASE s.name
    WHEN 'Database Server' THEN 'postgres: server process'
    WHEN 'Load Balancer' THEN 'haproxy -f /etc/haproxy/haproxy.cfg'
    WHEN 'Backup Server' THEN 'rsync --daemon --config=/etc/rsyncd.conf'
    WHEN 'Monitoring Server' THEN 'prometheus --config.file=/etc/prometheus/prometheus.yml'
    WHEN 'API Gateway' THEN 'kong start'
    ELSE 'systemd --system'
  END,
  CASE s.name
    WHEN 'Database Server' THEN 35.6
    WHEN 'Load Balancer' THEN 8.2
    WHEN 'Backup Server' THEN 2.1
    WHEN 'Monitoring Server' THEN 15.8
    WHEN 'API Gateway' THEN 12.4
    ELSE 1.0
  END,
  CASE s.name
    WHEN 'Database Server' THEN 512.8
    WHEN 'Load Balancer' THEN 64.2
    WHEN 'Backup Server' THEN 128.5
    WHEN 'Monitoring Server' THEN 256.7
    WHEN 'API Gateway' THEN 345.6
    ELSE 32.1
  END,
  'running',
  now() - interval '7 days'
FROM public.servers s
WHERE s.name IN ('Database Server', 'Load Balancer', 'Backup Server', 'Monitoring Server', 'API Gateway');

-- Create console_sessions table for terminal sessions
CREATE TABLE public.console_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  server_id UUID REFERENCES public.servers(id) ON DELETE CASCADE NOT NULL,
  session_data JSONB DEFAULT '{"commands": [], "output": []}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on console_sessions
ALTER TABLE public.console_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for console_sessions
CREATE POLICY "Users can view their own console sessions" 
ON public.console_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own console sessions" 
ON public.console_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own console sessions" 
ON public.console_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own console sessions" 
ON public.console_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for console_sessions timestamps
CREATE TRIGGER update_console_sessions_updated_at
  BEFORE UPDATE ON public.console_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();