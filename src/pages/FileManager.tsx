import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Folder, 
  File, 
  Search, 
  ChevronRight, 
  Home, 
  Upload,
  FolderPlus,
  MoreHorizontal 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockFiles = [
  { name: "Documents", type: "folder", size: "-", modified: "2024-01-15", items: 24 },
  { name: "Applications", type: "folder", size: "-", modified: "2024-01-14", items: 45 },
  { name: "system.log", type: "file", size: "2.4 MB", modified: "2024-01-16", items: null },
  { name: "config.json", type: "file", size: "1.2 KB", modified: "2024-01-16", items: null },
  { name: "backup.tar.gz", type: "file", size: "256 MB", modified: "2024-01-15", items: null },
  { name: "database.sql", type: "file", size: "45.6 MB", modified: "2024-01-14", items: null },
  { name: "Scripts", type: "folder", size: "-", modified: "2024-01-13", items: 12 },
  { name: "nginx.conf", type: "file", size: "3.2 KB", modified: "2024-01-16", items: null },
];

const FileManager = () => {
  const [currentPath, setCurrentPath] = useState(["home", "server"]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFiles = mockFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (size: string) => {
    if (size === "-") return "-";
    return size;
  };

  const navigateToPath = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">File Manager</h1>
        <p className="text-muted-foreground">
          Browse and manage server files and directories
        </p>
      </div>

      {/* Breadcrumb Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-sm">
            <Home className="h-4 w-4" />
            {currentPath.map((path, index) => (
              <div key={index} className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-primary hover:text-primary/80"
                  onClick={() => navigateToPath(index)}
                >
                  {path}
                </Button>
                {index < currentPath.length - 1 && (
                  <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Operations */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button className="bg-gradient-primary text-primary-foreground">
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
          <Button variant="outline">
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* File Table */}
      <Card>
        <CardHeader>
          <CardTitle>Files and Folders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file, index) => (
                <TableRow key={index} className="hover:bg-muted/50 cursor-pointer">
                  <TableCell className="flex items-center gap-3">
                    {file.type === "folder" ? (
                      <Folder className="h-4 w-4 text-accent" />
                    ) : (
                      <File className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{file.name}</span>
                      {file.type === "folder" && file.items && (
                        <span className="text-xs text-muted-foreground">
                          {file.items} items
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {formatFileSize(file.size)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {file.modified}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        <DropdownMenuItem>Copy</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

export default FileManager;