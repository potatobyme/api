"use client"

import type React from "react"

import { useState } from "react"
import { Search, Package, Users, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("id")
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchError("")

    try {
      // Search in database by ID or user number
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .or(`id.ilike.${searchQuery},user_number.eq.${searchQuery}`)
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (user) {
        // Redirect to user details page
        router.push(`/user-details/${user.id}`)
      } else {
        setSearchError("কোন তথ্য পাওয়া যায়নি। আপনার আইডি বা নম্বর চেক করে আবার চেষ্টা করুন।")
      }
    } catch (error) {
      console.error("Search error:", error)
      setSearchError("একটি ত্রুটি হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।")
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">পেন প্যাকিং জব</h1>
            </div>
            <Link href="/manager">
              <Button variant="outline">ম্যানেজার প্যানেল</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">আপনার রেজিস্ট্রেশন স্ট্যাটাস দেখুন</h2>
          <p className="text-xl text-gray-600 mb-12">
            আপনার ইউজার আইডি অথবা ইউজার নম্বর দিয়ে আপনার রেজিস্ট্রেশন সার্টিফিকেট দেখুন
          </p>

          {/* Search Section */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Search className="h-5 w-5" />
                <span>সার্টিফিকেট দেখুন</span>
              </CardTitle>
              <CardDescription>আপনার ইউজার আইডি (যেমন PPJ001) অথবা ইউজার নম্বর দিন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="id" onValueChange={setSearchType}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="id">ইউজার আইডি</TabsTrigger>
                  <TabsTrigger value="number">ইউজার নম্বর</TabsTrigger>
                </TabsList>
                <TabsContent value="id" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId">ইউজার আইডি</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="userId"
                        placeholder="PPJ001"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button onClick={handleSearch} disabled={!searchQuery || isSearching}>
                        {isSearching ? "খুঁজছি..." : "দেখুন"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="number" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="userNumber">ইউজার নম্বর</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="userNumber"
                        placeholder="1001"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button onClick={handleSearch} disabled={!searchQuery || isSearching}>
                        {isSearching ? "খুঁজছি..." : "দেখুন"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Search Error */}
              {searchError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{searchError}</p>
                </div>
              )}

              {/* Instructions */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 text-sm">
                  <strong>নির্দেশনা:</strong> আপনার আইডি বা নম্বর দিয়ে খুঁজলে আপনি আপনার সম্পূর্ণ রেজিস্ট্রেশন সার্টিফিকেট দেখতে পাবেন।
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">কেন পেন প্যাকিং জব বেছে নিবেন?</h3>
            <p className="text-lg text-gray-600">বাড়ি থেকে নমনীয় কাজের সুযোগ</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Package className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>নমনীয় কাজ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">আপনার নিজের গতিতে বাড়ি থেকে কাজ করুন, নমনীয় সময়সূচী সহ।</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>সহজ রেজিস্ট্রেশন</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">সহজ রেজিস্ট্রেশন প্রক্রিয়া এবং যোগ্য প্রার্থীদের জন্য দ্রুত অনুমোদন।</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>নিরাপদ আয়</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">প্রতিযোগিতামূলক পারিশ্রমিক হারের সাথে ধারাবাহিক কাজের সুযোগ।</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; ২০২৪ পেন প্যাকিং জব। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  )
}
