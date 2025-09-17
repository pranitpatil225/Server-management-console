import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Cpu, HardDrive, MemoryStick, Activity, Server } from "lucide-react";
import { useServers } from "@/hooks/useServers";

const cpuData = [
  { time: "00:00", usage: 23 },
  { time: "01:00", usage: 45 },
  { time: "02:00", usage: 32 },
  { time: "03:00", usage: 67 },
  { time: "04:00", usage: 89 },
  { time: "05:00", usage: 56 },
  { time: "06:00", usage: 34 },
  { time: "07:00", usage: 78 },
];

const diskData = [
  { name: "Used", value: 456, color: "hsl(158 64% 52%)" },
  { name: "Free", value: 544, color: "hsl(220 13% 18%)" },
];

const Dashboard = () => {
  const currentTime = new Date().toLocaleTimeString();
  const currentDate = new Date().toLocaleDateString();
  const { data: servers, isLoading } = useServers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Server monitoring and system overview • {currentDate} {currentTime}
        </p>
      </div>

      {/* Server Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Server Status Overview
          </CardTitle>
          <CardDescription>
            Current status of all managed servers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading servers...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {servers?.map((server) => (
                <div key={server.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{server.name}</h3>
                    <Badge 
                      variant={server.status === 'online' ? 'default' : 
                               server.status === 'maintenance' ? 'outline' : 'destructive'}
                      className={server.status === 'online' ? 'bg-success text-success-foreground' : 
                                 server.status === 'maintenance' ? 'bg-warning text-warning-foreground' : ''}
                    >
                      {server.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>{server.hostname}</div>
                    <div>{server.ip_address}</div>
                    <div className="flex gap-4 mt-2">
                      <span>CPU: {server.cpu_cores} cores</span>
                      <span>RAM: {server.ram_gb}GB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* CPU Usage Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67.8%</div>
            <p className="text-xs text-muted-foreground">
              +2.3% from last hour
            </p>
            <div className="mt-4 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cpuData}>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'hsl(215 20.2% 65.1%)' }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(220 13% 10%)',
                      border: '1px solid hsl(220 13% 18%)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="usage" 
                    stroke="hsl(158 64% 52%)" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* RAM Usage Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RAM Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.8 GB</div>
            <p className="text-xs text-muted-foreground">
              of 16 GB available
            </p>
            <div className="mt-4 space-y-2">
              <Progress value={80} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Used: 80%</span>
                <span>Free: 3.2 GB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disk Space Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Space</CardTitle>
            <HardDrive className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">456 GB</div>
            <p className="text-xs text-muted-foreground">
              of 1 TB used
            </p>
            <div className="mt-4 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {diskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(220 13% 10%)',
                      border: '1px solid hsl(220 13% 18%)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Activity Chart */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            System Activity
          </CardTitle>
          <CardDescription>
            Real-time system performance metrics over the last 8 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 18%)" />
                <XAxis 
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(215 20.2% 65.1%)' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(215 20.2% 65.1%)' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(220 13% 10%)',
                    border: '1px solid hsl(220 13% 18%)',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="hsl(158 64% 52%)"
                  fill="hsl(158 64% 52% / 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;