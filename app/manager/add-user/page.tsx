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
import { supabase } from "@/lib/supabase"

export default function AddUser() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    address: "",
    phone: "",
    email: "",
  })

  const generateUserId = async () => {
    // Get all existing IDs to find the next available one
    const { data, error } = await supabase.from("users").select("id").order("id", { ascending: false })

    if (error) {
      console.error("Error fetching user IDs:", error)
      // Fallback to timestamp-based ID if query fails
      return `PPJ${Date.now().toString().slice(-6)}`
    }

    if (!data || data.length === 0) {
      return "PPJ001"
    }

    // Extract numbers from all IDs and find the highest
    const existingNumbers = data
      .map((user) => {
        const match = user.id.match(/PPJ(\d+)/)
        return match ? Number.parseInt(match[1]) : 0
      })
      .filter((num) => num > 0)

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0
    const nextNumber = maxNumber + 1

    return `PPJ${String(nextNumber).padStart(3, "0")}`
  }

  const generateUserNumber = async () => {
    // Get all existing user numbers to find the next available one
    const { data, error } = await supabase
      .from("users")
      .select("user_number")
      .order("user_number", { ascending: false })

    if (error) {
      console.error("Error fetching user numbers:", error)
      // Fallback to timestamp-based number if query fails
      return Date.now().toString().slice(-4)
    }

    if (!data || data.length === 0) {
      return "1001"
    }

    // Convert all user numbers to integers and find the highest
    const existingNumbers = data.map((user) => Number.parseInt(user.user_number)).filter((num) => !isNaN(num))

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 1000
    const nextNumber = maxNumber + 1

    return String(nextNumber)
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true)

    try {
      // Generate unique IDs with retry logic
      let userId = await generateUserId()
      let userNumber = await generateUserNumber()

      // Double-check for uniqueness
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, user_number")
        .or(`id.eq.${userId},user_number.eq.${userNumber}`)

      if (existingUser && existingUser.length > 0) {
        // If there's a conflict, regenerate IDs
        userId = `PPJ${Date.now().toString().slice(-6)}`
        userNumber = Date.now().toString().slice(-4)
      }

      // Create new user object
      const newUser = {
        id: userId,
        user_number: userNumber,
        name: formData.name,
        age: Number.parseInt(formData.age),
        gender: formData.gender,
        address: formData.address,
        phone: formData.phone || null,
        email: formData.email || null,
        status: "pending" as const,
      }

      // Insert into database with conflict handling
      const { error } = await supabase.from("users").insert([newUser])

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          throw new Error("একটি অনন্য আইডি তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।")
        }
        throw error
      }

      toast({
        title: "সফল",
        description: `ব্যবহারকারী ${userId} সফলভাবে তৈরি করা হয়েছে`,
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
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "ত্রুটি",
        description: error instanceof Error ? error.message : "ব্যবহারকারী তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">লিঙ্গ *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                    disabled={isSubmitting}
                  >
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
                    disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/manager">
                  <Button variant="outline" disabled={isSubmitting}>
                    বাতিল
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : "ব্যবহারকারী নিবন্ধন করুন"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
