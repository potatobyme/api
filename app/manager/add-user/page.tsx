"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function AddUser() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    address: "",
    phone: "",
    email: "",
  })

  const generateUserId = () => {
    const timestamp = Date.now().toString().slice(-4)
    return `PPJ${timestamp}`
  }

  const generateUserNumber = () => {
    // Get existing users to ensure unique number
    const existingUsers = JSON.parse(localStorage.getItem("penPackingUsers") || "[]")
    const existingNumbers = existingUsers.map((user: any) => Number.parseInt(user.userNumber))

    // Find the highest existing number and add 1
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 1000
    return (maxNumber + 1).toString()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.name || !formData.age || !formData.gender || !formData.address) {
      toast({
        title: "ত্রুটি",
        description: "অনুগ্রহ করে সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন",
        variant: "destructive",
      })
      return
    }

    // Create new user object
    const newUser = {
      ...formData,
      id: generateUserId(),
      userNumber: generateUserNumber(),
      status: "pending",
      registrationDate: new Date().toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    }

    // Get existing users from localStorage
    const existingUsers = JSON.parse(localStorage.getItem("penPackingUsers") || "[]")

    // Add new user to the list
    const updatedUsers = [...existingUsers, newUser]

    // Save to localStorage
    localStorage.setItem("penPackingUsers", JSON.stringify(updatedUsers))

    // Dispatch custom event to notify other components
    const event = new CustomEvent("userAdded", { detail: newUser })
    window.dispatchEvent(event)

    console.log("New user created:", newUser)

    toast({
      title: "সফল",
      description: `ব্যবহারকারী ${newUser.id} সফলভাবে তৈরি করা হয়েছে`,
    })

    // Reset form
    setFormData({
      name: "",
      age: "",
      gender: "",
      address: "",
      phone: "",
      email: "",
    })

    // Redirect back to manager dashboard after a short delay
    setTimeout(() => {
      router.push("/manager")
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">নতুন ব্যবহারকারী যোগ করুন</h1>
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>ব্যবহারকারী রেজিস্ট্রেশন ফর্ম</CardTitle>
            <CardDescription>পেন প্যাকিং জবের জন্য নতুন ব্যবহারকারী নিবন্ধন করতে বিবরণ পূরণ করুন</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">ব্যক্তিগত তথ্য</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">পূর্ণ নাম *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="পূর্ণ নাম লিখুন"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">বয়স *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="বয়স লিখুন"
                      min="18"
                      max="65"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">লিঙ্গ *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="লিঙ্গ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="পুরুষ">পুরুষ</SelectItem>
                      <SelectItem value="মহিলা">মহিলা</SelectItem>
                      <SelectItem value="অন্যান্য">অন্যান্য</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">যোগাযোগের তথ্য</h3>

                <div className="space-y-2">
                  <Label htmlFor="address">ঠিকানা *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="সম্পূর্ণ ঠিকানা লিখুন"
                    className="min-h-[80px]"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">ফোন নম্বর</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+880 1712-345678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">ইমেইল ঠিকানা</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/manager">
                  <Button variant="outline">বাতিল</Button>
                </Link>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  ব্যবহারকারী নিবন্ধন করুন
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
