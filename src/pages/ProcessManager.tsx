import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  RefreshCw, 
  StopCircle,
  ChevronUp,
  ChevronDown,
  Activity
} from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const mockProcesses = [
  { pid: 1234, name: "nginx", cpu: 15.2, memory: 45.6, status: "running" },
  { pid: 1235, name: "mysql", cpu: 8.7, memory: 128.4, status: "running" },
  { pid: 1236, name: "node", cpu: 22.1, memory: 87.2, status: "running" },
  { pid: 1237, name: "apache2", cpu: 5.3, memory: 32.1, status: "running" },
  { pid: 1238, name: "redis-server", cpu: 3.4, memory: 18.7, status: "running" },
  { pid: 1239, name: "postgres", cpu: 12.8, memory: 156.3, status: "running" },
  { pid: 1240, name: "docker", cpu: 6.9, memory: 67.8, status: "running" },
  { pid: 1241, name: "systemd", cpu: 0.8, memory: 12.4, status: "running" },
  { pid: 1242, name: "ssh", cpu: 0.2, memory: 4.2, status: "running" },
  { pid: 1243, name: "fail2ban", cpu: 1.1, memory: 8.9, status: "running" },
];

type SortField = "pid" | "name" | "cpu" | "memory";
type SortDirection = "asc" | "desc";

const ProcessManager = () => {
  const [processes, setProcesses] = useState(mockProcesses);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("pid");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { toast } = useToast();

  const filteredProcesses = processes.filter(process =>
    process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.pid.toString().includes(searchTerm)
  );

  const sortedProcesses = [...filteredProcesses].sort((a, b) => {
    let aValue: string | number = a[sortField];
    let bValue: string | number = b[sortField];

    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleTerminateProcess = (pid: number, name: string) => {
    setProcesses(processes.filter(p => p.pid !== pid));
    toast({
      title: "Process terminated",
      description: `${name} (PID: ${pid}) has been terminated successfully`,
    });
  };

  const refreshProcesses = () => {
    // Simulate refreshing with slight variations
    const refreshedProcesses = mockProcesses.map(process => ({
      ...process,
      cpu: Math.max(0, process.cpu + (Math.random() - 0.5) * 5),
      memory: Math.max(0, process.memory + (Math.random() - 0.5) * 10),
    }));
    setProcesses(refreshedProcesses);
    toast({
      title: "Process list refreshed",
      description: "All process information has been updated",
    });
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge 
        variant={status === "running" ? "default" : "destructive"} 
        className={status === "running" ? "bg-success text-success-foreground" : ""}
      >
        {status}
      </Badge>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? 
      <ChevronUp className="h-3 w-3 ml-1" /> : 
      <ChevronDown className="h-3 w-3 ml-1" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Process Manager</h1>
        <p className="text-muted-foreground">
          Monitor and manage running processes on your server
        </p>
      </div>

      {/* Process Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button 
            onClick={refreshProcesses}
            className="bg-gradient-primary text-primary-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search processes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Process Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processes</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processes.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processes.reduce((sum, p) => sum + p.cpu, 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Total CPU consumption
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Activity className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(processes.reduce((sum, p) => sum + p.memory, 0) / 1024).toFixed(1)} GB
            </div>
            <p className="text-xs text-muted-foreground">
              Total memory consumption
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Process Table */}
      <Card>
        <CardHeader>
          <CardTitle>Running Processes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:text-primary flex items-center"
                  onClick={() => handleSort("pid")}
                >
                  PID <SortIcon field="pid" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Process Name <SortIcon field="name" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort("cpu")}
                >
                  <div className="flex items-center">
                    CPU % <SortIcon field="cpu" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort("memory")}
                >
                  <div className="flex items-center">
                    Memory (MB) <SortIcon field="memory" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProcesses.map((process) => (
                <TableRow key={process.pid} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">
                    {process.pid}
                  </TableCell>
                  <TableCell className="font-medium">
                    {process.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {process.cpu.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {process.memory.toFixed(1)} MB
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(process.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <StopCircle className="h-3 w-3 mr-1" />
                          Terminate
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-popover border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Terminate Process</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to terminate {process.name} (PID: {process.pid})? 
                            This action cannot be undone and may affect system stability.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleTerminateProcess(process.pid, process.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Terminate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessManager;