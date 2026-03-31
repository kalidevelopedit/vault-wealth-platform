import { useGetAdminStats, useGetAdminUsers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Loader2, Search, Users, ShieldAlert, DollarSign } from "lucide-react";
import { useState } from "react";

export default function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useGetAdminStats();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: usersData, isLoading: loadingUsers } = useGetAdminUsers({ 
    search: search.length > 2 ? search : undefined,
    kycStatus: statusFilter !== "all" ? (statusFilter as any) : undefined
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground mt-1">High-level metrics and user management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <h3 className="text-2xl font-bold">{stats?.totalUsers || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending KYC</p>
                <h3 className="text-2xl font-bold">{stats?.pendingKyc || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platform AUM</p>
                <h3 className="text-2xl font-bold">${((stats?.totalPlatformAssets || 0) / 1e6).toFixed(1)}M</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Today</p>
                <h3 className="text-2xl font-bold">{stats?.todaySignups || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle>User Directory</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-9 h-9" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending KYC</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Country</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Balance</th>
                    <th className="px-4 py-3 font-medium text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {usersData?.users.map(u => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors group cursor-pointer">
                      <td className="px-4 py-3">
                        <Link href={`/admin/users/${u.id}`} className="block">
                          <div className="font-medium text-foreground group-hover:text-primary transition-colors">{u.fullName}</div>
                          <div className="text-muted-foreground text-xs">{u.email}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">{u.country}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider
                          ${u.kycStatus === 'approved' ? 'bg-success/10 text-success' : 
                            u.kycStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-600' : 
                            u.kycStatus === 'rejected' ? 'bg-destructive/10 text-destructive' :
                            'bg-muted text-muted-foreground'}
                        `}>
                          {u.kycStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        ${u.totalAssets.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {(!usersData?.users || usersData.users.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
