import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Terminal, Server, Power, Trash2, History } from "lucide-react";
import { useServers } from "@/hooks/useServers";
import { useToast } from "@/hooks/use-toast";

interface ConsoleOutput {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: Date;
  server?: string;
}

const Console = () => {
  const [selectedServer, setSelectedServer] = useState<string>("");
  const [currentCommand, setCurrentCommand] = useState("");
  const [output, setOutput] = useState<ConsoleOutput[]>([
    {
      id: "welcome",
      type: "system",
      content: "Server Management Console v2.1.0 - Select a server to begin",
      timestamp: new Date(),
    }
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isConnected, setIsConnected] = useState(false);
  
  const { data: servers, isLoading } = useServers();
  const { toast } = useToast();
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const addOutput = (content: string, type: ConsoleOutput['type'] = 'output', server?: string) => {
    const newOutput: ConsoleOutput = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      server,
    };
    setOutput(prev => [...prev, newOutput]);
  };

  const handleServerSelect = (serverId: string) => {
    const server = servers?.find(s => s.id === serverId);
    if (server) {
      setSelectedServer(serverId);
      setIsConnected(true);
      addOutput(`Connected to ${server.name} (${server.hostname})`, 'system');
      addOutput(`${server.hostname}:~$ `, 'input');
      toast({
        title: "Connected to server",
        description: `Successfully connected to ${server.name}`,
      });
    }
  };

  const simulateCommand = async (command: string): Promise<{ output: string; type: ConsoleOutput['type'] }> => {
    // Simulate command execution delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    const cmd = command.toLowerCase().trim();
    const server = servers?.find(s => s.id === selectedServer);

    // Basic command simulation
    switch (true) {
      case cmd === 'ls' || cmd === 'ls -la':
        return {
          output: `total 48
drwxr-xr-x  8 root root 4096 Jan 16 10:30 .
drwxr-xr-x  3 root root 4096 Jan 15 09:15 ..
-rw-r--r--  1 root root  220 Jan 15 09:15 .bash_logout
-rw-r--r--  1 root root 3771 Jan 15 09:15 .bashrc
drwx------  2 root root 4096 Jan 16 08:45 .cache
drwxr-xr-x  3 root root 4096 Jan 16 09:30 .config
-rw-r--r--  1 root root  807 Jan 15 09:15 .profile
drwxr-xr-x  2 root root 4096 Jan 16 10:30 logs
drwxr-xr-x  3 root root 4096 Jan 16 09:45 scripts
-rwxr-xr-x  1 root root 1024 Jan 16 10:15 start.sh`,
          type: 'output'
        };

      case cmd === 'pwd':
        return { output: `/home/${server?.hostname || 'server'}`, type: 'output' };

      case cmd === 'whoami':
        return { output: 'root', type: 'output' };

      case cmd === 'date':
        return { output: new Date().toString(), type: 'output' };

      case cmd.startsWith('ps'):
        return {
          output: `  PID TTY          TIME CMD
 1234 pts/0    00:00:02 nginx
 1235 pts/0    00:00:45 mysql
 1236 pts/0    00:00:12 node
 1237 pts/0    00:00:03 apache2
 1238 pts/0    00:00:01 redis-server`,
          type: 'output'
        };

      case cmd === 'df -h':
        return {
          output: `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        ${server?.storage_gb || 500}G  ${Math.floor((server?.storage_gb || 500) * 0.6)}G  ${Math.floor((server?.storage_gb || 500) * 0.4)}G  60% /
tmpfs           ${Math.floor((server?.ram_gb || 16) / 2)}G     0  ${Math.floor((server?.ram_gb || 16) / 2)}G   0% /dev/shm`,
          type: 'output'
        };

      case cmd === 'free -h':
        return {
          output: `              total        used        free      shared  buff/cache   available
Mem:           ${server?.ram_gb || 16}Gi       ${Math.floor((server?.ram_gb || 16) * 0.7)}Gi       ${Math.floor((server?.ram_gb || 16) * 0.2)}Gi       256Mi       ${Math.floor((server?.ram_gb || 16) * 0.1)}Gi       ${Math.floor((server?.ram_gb || 16) * 0.25)}Gi
Swap:          2.0Gi          0B       2.0Gi`,
          type: 'output'
        };

      case cmd === 'uptime':
        return {
          output: ` ${new Date().toTimeString().split(' ')[0]} up ${Math.floor(Math.random() * 30 + 1)} days, ${Math.floor(Math.random() * 24)} hours, ${Math.floor(Math.random() * 60)} minutes, 1 user, load average: 1.45, 1.23, 0.98`,
          type: 'output'
        };

      case cmd === 'help':
        return {
          output: `Available commands:
  ls, ls -la    - List directory contents
  pwd          - Print working directory
  whoami       - Print current user
  date         - Display current date and time
  ps           - Show running processes
  df -h        - Display disk usage
  free -h      - Display memory usage
  uptime       - Show system uptime
  clear        - Clear terminal
  exit         - Disconnect from server
  help         - Show this help message`,
          type: 'output'
        };

      case cmd === 'clear':
        setOutput([]);
        return { output: '', type: 'output' };

      case cmd === 'exit':
        setIsConnected(false);
        setSelectedServer("");
        addOutput("Connection closed.", 'system');
        return { output: '', type: 'output' };

      case cmd === '':
        return { output: '', type: 'output' };

      default:
        return {
          output: `bash: ${command}: command not found`,
          type: 'error'
        };
    }
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedServer) {
      toast({
        title: "No server selected",
        description: "Please select a server first",
        variant: "destructive",
      });
      return;
    }

    if (!currentCommand.trim()) return;

    const server = servers?.find(s => s.id === selectedServer);
    const prompt = `${server?.hostname}:~$ `;

    // Add command to output
    addOutput(`${prompt}${currentCommand}`, 'input');

    // Add to history
    setCommandHistory(prev => [...prev, currentCommand]);
    setHistoryIndex(-1);

    // Execute command
    const { output: result, type } = await simulateCommand(currentCommand);
    if (result) {
      addOutput(result, type);
    }

    // Clear input
    setCurrentCommand("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand("");
      }
    }
  };

  const clearTerminal = () => {
    setOutput([]);
    addOutput("Terminal cleared", 'system');
  };

  const disconnectServer = () => {
    setIsConnected(false);
    setSelectedServer("");
    addOutput("Disconnected from server", 'system');
  };

  const getOutputClass = (type: ConsoleOutput['type']) => {
    switch (type) {
      case 'input':
        return 'text-primary font-mono';
      case 'output':
        return 'text-foreground font-mono';
      case 'error':
        return 'text-destructive font-mono';
      case 'system':
        return 'text-accent font-mono italic';
      default:
        return 'text-foreground font-mono';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Console</h1>
        <p className="text-muted-foreground">
          Interactive terminal access to your servers
        </p>
      </div>

      {/* Server Selection and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Terminal Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 max-w-sm">
              <Select 
                value={selectedServer} 
                onValueChange={handleServerSelect}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a server" />
                </SelectTrigger>
                <SelectContent>
                  {servers?.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        <span>{server.name}</span>
                        <Badge 
                          variant={server.status === 'online' ? 'default' : 'destructive'}
                          className={server.status === 'online' ? 'bg-success text-success-foreground' : ''}
                        >
                          {server.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearTerminal}
                disabled={!selectedServer}
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectServer}
                disabled={!isConnected}
              >
                <Power className="h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </div>
          
          {isConnected && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
              Connected to {servers?.find(s => s.id === selectedServer)?.name}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terminal Interface */}
      <Card className="bg-black text-green-400 font-mono">
        <CardContent className="p-0">
          <div 
            ref={terminalRef}
            className="h-96 overflow-y-auto p-4 space-y-1 text-sm"
          >
            {output.map((line) => (
              <div key={line.id} className={getOutputClass(line.type)}>
                <span className="text-muted-foreground text-xs mr-2">
                  {line.timestamp.toLocaleTimeString()}
                </span>
                <pre className="inline whitespace-pre-wrap">{line.content}</pre>
              </div>
            ))}
          </div>
          
          {/* Command Input */}
          {isConnected && (
            <form onSubmit={handleCommandSubmit} className="border-t border-muted p-4">
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">
                  {servers?.find(s => s.id === selectedServer)?.hostname}:~$
                </span>
                <Input
                  ref={inputRef}
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none text-green-400 font-mono focus:ring-0 focus:ring-offset-0"
                  placeholder="Enter command..."
                  autoComplete="off"
                />
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Command History */}
      {commandHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <History className="h-4 w-4" />
              Command History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {commandHistory.slice(-10).reverse().map((cmd, index) => (
                <div 
                  key={index}
                  className="text-sm font-mono text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded hover:bg-muted"
                  onClick={() => setCurrentCommand(cmd)}
                >
                  {cmd}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Console;