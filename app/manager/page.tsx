"use client"

import { useState, useEffect } from "react"
import { Plus, Users, Download, Eye, Search, RefreshCw } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { supabase, type User } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function ManagerDashboard() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch users from database
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "ত্রুটি",
        description: "ব্যবহারকারীদের তথ্য লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users based on status and search query
  const filteredUsers = users.filter(
    (user) =>
      (statusFilter === "all" || user.status === statusFilter) &&
      (searchQuery === "" ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.user_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          status: newStatus,
          last_updated: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, status: newStatus as any } : user)))

      toast({
        title: "সফল",
        description: "ব্যবহারকারীর স্ট্যাটাস আপডেট করা হয়েছে",
      })
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "ত্রুটি",
        description: "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      })
    }
  }

  const generatePDF = (user: User) => {
    // In a real app, this would generate and download a PDF
    alert(`${user.name} (${user.id}) এর জন্য পিডিএফ তৈরি করা হচ্ছে`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ম্যানেজার প্যানেল</h1>
            </div>
            <div className="flex space-x-2">
              <Button onClick={fetchUsers} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                রিফ্রেশ
              </Button>
              <Link href="/">
                <Button variant="outline">হোম পেজে ফিরুন</Button>
              </Link>
              <Link href="/manager/add-user">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন ব্যবহারকারী
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট ব্যবহারকারী</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">অনুমোদিত</CardTitle>
              <Badge variant="default" className="text-xs">
                সক্রিয়
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {users.filter((u) => u.status === "approved").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">অপেক্ষমান</CardTitle>
              <Badge variant="secondary" className="text-xs">
                পর্যালোচনা
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {users.filter((u) => u.status === "pending").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">প্রত্যাখ্যাত</CardTitle>
              <Badge variant="destructive" className="text-xs">
                বাতিল
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {users.filter((u) => u.status === "rejected").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="আইডি, নম্বর বা নাম দিয়ে খুঁজুন"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
              <SelectItem value="approved">অনুমোদিত</SelectItem>
              <SelectItem value="pending">অপেক্ষমান</SelectItem>
              <SelectItem value="rejected">প্রত্যাখ্যাত</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>ব্যবহারকারী রেজিস্ট্রেশন</CardTitle>
                <CardDescription>ব্যবহারকারী রেজিস্ট্রেশন এবং স্ট্যাটাস পরিচালনা করুন</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ইউজার আইডি</TableHead>
                  <TableHead>ইউজার নম্বর</TableHead>
                  <TableHead>নাম</TableHead>
                  <TableHead>বয়স</TableHead>
                  <TableHead>লিঙ্গ</TableHead>
                  <TableHead>রেজিস্ট্রেশন তারিখ</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      কোন ব্যবহারকারী পাওয়া যায়নি
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.user_number}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.age}</TableCell>
                      <TableCell>{user.gender}</TableCell>
                      <TableCell>{new Date(user.registration_date).toLocaleDateString("bn-BD")}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "approved"
                              ? "default"
                              : user.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {user.status === "approved" ? "অনুমোদিত" : user.status === "pending" ? "অপেক্ষমান" : "প্রত্যাখ্যাত"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/manager/user/${user.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => generatePDF(user)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Select value={user.status} onValueChange={(value) => updateUserStatus(user.id, value)}>
                            <SelectTrigger className="w-28 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">অপেক্ষমান</SelectItem>
                              <SelectItem value="approved">অনুমোদিত</SelectItem>
                              <SelectItem value="rejected">প্রত্যাখ্যাত</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
