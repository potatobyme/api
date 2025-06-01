"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Download, Edit, Save, X } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

// Example data - in a real app, this would be fetched from an API
const usersData = {
  PPJ001: {
    id: "PPJ001",
    userNumber: "1001",
    name: "রহিম আহমেদ",
    age: 28,
    gender: "পুরুষ",
    address: "১২৩ মেইন স্ট্রিট, ঢাকা, বাংলাদেশ",
    phone: "+880 1712-345678",
    email: "rahim@example.com",
    status: "approved",
    registrationDate: "১৫-০১-২০২৪",
    lastUpdated: "২০-০১-২০২৪",
  },
  PPJ002: {
    id: "PPJ002",
    userNumber: "1002",
    name: "ফাতেমা বেগম",
    age: 32,
    gender: "মহিলা",
    address: "৪৫৬ লেক রোড, খুলনা, বাংলাদেশ",
    phone: "+880 1812-345678",
    email: "fatema@example.com",
    status: "pending",
    registrationDate: "১৬-০১-২০২৪",
    lastUpdated: "১৬-০১-২০২৪",
  },
  PPJ003: {
    id: "PPJ003",
    userNumber: "1003",
    name: "করিম মিয়া",
    age: 25,
    gender: "পুরুষ",
    address: "৭৮৯ স্টেশন রোড, রাজশাহী, বাংলাদেশ",
    phone: "+880 1912-345678",
    email: "karim@example.com",
    status: "approved",
    registrationDate: "১৭-০১-২০২৪",
    lastUpdated: "১৮-০১-২০২৪",
  },
}

export default function UserDetails({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch user data from localStorage
    const fetchUser = async () => {
      setIsLoading(true)
      try {
        // Get users from localStorage
        const storedUsers = localStorage.getItem("penPackingUsers")
        let allUsers = []

        if (storedUsers) {
          allUsers = JSON.parse(storedUsers)
        } else {
          // If no stored users, use the default data
          allUsers = Object.values(usersData)
          localStorage.setItem("penPackingUsers", JSON.stringify(allUsers))
        }

        const userData = allUsers.find((user: any) => user.id === params.id)
        if (userData) {
          setUser(userData)
          setEditData(userData)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        toast({
          title: "ত্রুটি",
          description: "ব্যবহারকারীর তথ্য লোড করতে সমস্যা হয়েছে",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [params.id, toast])

  const handleSave = () => {
    // Update user in localStorage
    const storedUsers = JSON.parse(localStorage.getItem("penPackingUsers") || "[]")
    const updatedUsers = storedUsers.map((u: any) =>
      u.id === user.id
        ? {
            ...editData,
            lastUpdated: new Date().toLocaleDateString("bn-BD", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }),
          }
        : u,
    )

    localStorage.setItem("penPackingUsers", JSON.stringify(updatedUsers))

    // Update local state
    const updatedUser = {
      ...editData,
      lastUpdated: new Date().toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    }

    setUser(updatedUser)
    setIsEditing(false)

    toast({
      title: "সফল",
      description: "ব্যবহারকারীর তথ্য সফলভাবে আপডেট করা হয়েছে",
    })
  }

  const handleCancel = () => {
    setEditData(user)
    setIsEditing(false)
  }

  const generatePDF = () => {
    if (!user) return

    // In a real app, this would generate and download a PDF
    const pdfContent = `
      পেন প্যাকিং জব - ব্যবহারকারী রেজিস্ট্রেশন বিবরণ
      
      ইউজার আইডি: ${user.id}
      ইউজার নম্বর: ${user.userNumber}
      নাম: ${user.name}
      বয়স: ${user.age}
      লিঙ্গ: ${user.gender}
      ঠিকানা: ${user.address}
      ফোন: ${user.phone}
      ইমেইল: ${user.email}
      স্ট্যাটাস: ${user.status === "approved" ? "অনুমোদিত" : "অপেক্ষমান"}
      রেজিস্ট্রেশন তারিখ: ${user.registrationDate}
      সর্বশেষ আপডেট: ${user.lastUpdated}
      
      তৈরি করা হয়েছে: ${new Date().toLocaleDateString("bn-BD")}
    `

    // Create and download blob
    const blob = new Blob([pdfContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${user.id}_registration_details.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "পিডিএফ তৈরি করা হয়েছে",
      description: `${user.name} এর রেজিস্ট্রেশন বিবরণ সফলভাবে ডাউনলোড করা হয়েছে`,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">ব্যবহারকারী পাওয়া যায়নি</h1>
              </div>
              <Link href="/manager">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  ড্যাশবোর্ডে ফিরুন
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ব্যবহারকারী পাওয়া যায়নি</h2>
          <p className="text-gray-600 mb-8">আপনি যে ব্যবহারকারী আইডি খুঁজছেন তা পাওয়া যায়নি।</p>
          <Link href="/manager">
            <Button>ড্যাশবোর্ডে ফিরুন</Button>
          </Link>
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
              <h1 className="text-2xl font-bold text-gray-900">ব্যবহারকারী বিবরণ - {user.id}</h1>
            </div>
            <div className="flex space-x-2">
              <Link href="/manager">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  ড্যাশবোর্ডে ফিরুন
                </Button>
              </Link>
              <Button onClick={generatePDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                পিডিএফ ডাউনলোড করুন
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>রেজিস্ট্রেশন বিবরণ</span>
                      <Badge variant={user.status === "approved" ? "default" : "secondary"}>
                        {user.status === "approved" ? "অনুমোদিত" : "অপেক্ষমান"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      ইউজার আইডি: {user.id} • ইউজার নম্বর: {user.userNumber} • রেজিস্ট্রেশন: {user.registrationDate}
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      সম্পাদনা
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        সংরক্ষণ
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        বাতিল
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">ব্যক্তিগত তথ্য</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">পূর্ণ নাম</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">বয়স</Label>
                      {isEditing ? (
                        <Input
                          id="age"
                          type="number"
                          value={editData.age}
                          onChange={(e) => setEditData({ ...editData, age: Number.parseInt(e.target.value) })}
                        />
                      ) : (
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.age}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">লিঙ্গ</Label>
                    {isEditing ? (
                      <Select
                        value={editData.gender}
                        onValueChange={(value) => setEditData({ ...editData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="পুরুষ">পুরুষ</SelectItem>
                          <SelectItem value="মহিলা">মহিলা</SelectItem>
                          <SelectItem value="অন্যান্য">অন্যান্য</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.gender}</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">যোগাযোগের তথ্য</h3>

                  <div className="space-y-2">
                    <Label htmlFor="address">ঠিকানা</Label>
                    {isEditing ? (
                      <Textarea
                        id="address"
                        value={editData.address}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        className="min-h-[80px]"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.address}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">ফোন নম্বর</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">ইমেইল ঠিকানা</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>স্ট্যাটাস পরিচালনা</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>বর্তমান স্ট্যাটাস</Label>
                  <Select value={user.status} onValueChange={(value) => setUser({ ...user, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">অপেক্ষমান</SelectItem>
                      <SelectItem value="approved">অনুমোদিত</SelectItem>
                      <SelectItem value="rejected">প্রত্যাখ্যাত</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>রেজিস্ট্রেশন তারিখ:</strong>
                    <br />
                    {user.registrationDate}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>সর্বশেষ আপডেট:</strong>
                    <br />
                    {user.lastUpdated}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>দ্রুত অ্যাকশন</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={generatePDF} className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  পিডিএফ রিপোর্ট তৈরি করুন
                </Button>
                <Button className="w-full" variant="outline">
                  নোটিফিকেশন পাঠান
                </Button>
                <Button className="w-full" variant="outline">
                  অ্যাক্টিভিটি লগ দেখুন
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
