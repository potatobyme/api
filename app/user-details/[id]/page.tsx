"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Download, CheckCircle, Clock, FileText } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase, type User } from "@/lib/supabase"

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      try {
        const { data: userData, error } = await supabase.from("users").select("*").eq("id", params.id).single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (userData) {
          setUser(userData)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [params.id])

  const downloadCertificate = () => {
    if (!user) return

    const certificateContent = `
পেন প্যাকিং জব - অফিসিয়াল সার্টিফিকেট

এই সার্টিফিকেট প্রমাণ করে যে:

নাম: ${user.name}
ইউজার আইডি: ${user.id}
ইউজার নম্বর: ${user.user_number}
বয়স: ${user.age} বছর
লিঙ্গ: ${user.gender}
ঠিকানা: ${user.address}
ফোন: ${user.phone || "প্রদান করা হয়নি"}
ইমেইল: ${user.email || "প্রদান করা হয়নি"}

রেজিস্ট্রেশন তারিখ: ${new Date(user.registration_date).toLocaleDateString("bn-BD")}
স্ট্যাটাস: ${user.status === "approved" ? "অনুমোদিত ✓" : user.status === "pending" ? "অপেক্ষমান" : "প্রত্যাখ্যাত"}

${user.status === "approved" ? "এই ব্যক্তি পেন প্যাকিং কাজের জন্য অনুমোদিত এবং কাজ শুরু করতে পারেন।" : user.status === "pending" ? "এই আবেদনটি এখনও পর্যালোচনাধীন রয়েছে।" : "এই আবেদনটি প্রত্যাখ্যাত হয়েছে।"}

জারি করা হয়েছে: ${new Date().toLocaleDateString("bn-BD")}

পেন প্যাকিং জব
অনুমোদিত কর্তৃপক্ষ
    `

    const blob = new Blob([certificateContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${user.id}_certificate.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">ব্যবহারকারী পাওয়া যায়নি</h1>
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  হোম পেজে ফিরুন
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ব্যবহারকারী পাওয়া যায়নি</h2>
          <p className="text-gray-600 mb-8">আপনি যে আইডি বা নম্বর দিয়েছেন তা আমাদের রেকর্ডে নেই।</p>
          <Link href="/">
            <Button>হোম পেজে ফিরুন</Button>
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
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">রেজিস্ট্রেশন সার্টিফিকেট</h1>
            </div>
            <div className="flex space-x-2">
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  হোম পেজে ফিরুন
                </Button>
              </Link>
              <Button onClick={downloadCertificate} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                সার্টিফিকেট ডাউনলোড
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Certificate Document */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden border-2 border-gray-200">
          {/* Document Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 text-center relative">
            <div className="absolute top-4 right-4">
              {user.status === "approved" ? (
                <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold transform rotate-12 shadow-lg">
                  অনুমোদিত ✓
                </div>
              ) : user.status === "pending" ? (
                <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold transform rotate-12 shadow-lg">
                  অপেক্ষমান
                </div>
              ) : (
                <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold transform rotate-12 shadow-lg">
                  প্রত্যাখ্যাত
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">পেন প্যাকিং জব</h1>
            <p className="text-blue-100 text-lg">অফিসিয়াল রেজিস্ট্রেশন সার্টিফিকেট</p>
            <div className="mt-4 w-24 h-1 bg-white mx-auto rounded"></div>
          </div>

          {/* Status Banner */}
          <div
            className={`p-4 text-center ${
              user.status === "approved"
                ? "bg-green-50 border-green-200"
                : user.status === "pending"
                  ? "bg-orange-50 border-orange-200"
                  : "bg-red-50 border-red-200"
            } border-b`}
          >
            <div className="flex items-center justify-center space-x-2">
              {user.status === "approved" ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-green-800 font-semibold text-lg">আপনার আবেদন অনুমোদিত হয়েছে</span>
                </>
              ) : user.status === "pending" ? (
                <>
                  <Clock className="h-6 w-6 text-orange-600" />
                  <span className="text-orange-800 font-semibold text-lg">আপনার আবেদন পর্যালোচনাধীন</span>
                </>
              ) : (
                <>
                  <div className="h-6 w-6 text-red-600">✕</div>
                  <span className="text-red-800 font-semibold text-lg">আপনার আবেদন প্রত্যাখ্যাত হয়েছে</span>
                </>
              )}
            </div>
          </div>

          {/* Document Body */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">রেজিস্ট্রেশন বিবরণ</h2>
              <p className="text-gray-600">এই সার্টিফিকেট নিম্নলিখিত ব্যক্তির রেজিস্ট্রেশন প্রমাণ করে</p>
            </div>

            {/* User Information Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-blue-700">ব্যক্তিগত তথ্য</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">নাম:</span>
                    <span className="font-bold text-gray-900">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">বয়স:</span>
                    <span className="text-gray-900">{user.age} বছর</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">লিঙ্গ:</span>
                    <span className="text-gray-900">{user.gender}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-700">রেজিস্ট্রেশন তথ্য</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">ইউজার আইডি:</span>
                    <span className="font-bold text-gray-900">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">ইউজার নম্বর:</span>
                    <span className="font-bold text-gray-900">{user.user_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">তারিখ:</span>
                    <span className="text-gray-900">
                      {new Date(user.registration_date).toLocaleDateString("bn-BD")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg text-purple-700">যোগাযোগের তথ্য</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-600 block">ঠিকানা:</span>
                    <span className="text-gray-900">{user.address}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 block">ফোন:</span>
                    <span className="text-gray-900">{user.phone || "প্রদান করা হয়নি"}</span>
                  </div>
                </div>
                {user.email && (
                  <div>
                    <span className="font-medium text-gray-600">ইমেইল:</span>
                    <span className="text-gray-900 ml-2">{user.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card
              className={`mb-8 ${
                user.status === "approved"
                  ? "bg-green-50 border-green-200"
                  : user.status === "pending"
                    ? "bg-orange-50 border-orange-200"
                    : "bg-red-50 border-red-200"
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`text-lg ${
                    user.status === "approved"
                      ? "text-green-700"
                      : user.status === "pending"
                        ? "text-orange-700"
                        : "text-red-700"
                  }`}
                >
                  বর্তমান স্ট্যাটাস
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge
                      variant={user.status === "approved" ? "default" : "secondary"}
                      className={`text-lg px-4 py-2 ${
                        user.status === "approved"
                          ? "bg-green-600"
                          : user.status === "pending"
                            ? "bg-orange-600"
                            : "bg-red-600"
                      }`}
                    >
                      {user.status === "approved" ? "অনুমোদিত" : user.status === "pending" ? "অপেক্ষমান" : "প্রত্যাখ্যাত"}
                    </Badge>
                  </div>
                  {user.status === "approved" && (
                    <div className="text-right">
                      <div className="bg-green-600 text-white px-6 py-3 rounded-lg transform rotate-3 shadow-lg">
                        <div className="text-center">
                          <CheckCircle className="h-8 w-8 mx-auto mb-1" />
                          <div className="font-bold text-sm">অনুমোদিত</div>
                          <div className="text-xs">APPROVED</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-4 bg-white rounded-lg">
                  {user.status === "approved" ? (
                    <p className="text-green-800">
                      <strong>অভিনন্দন!</strong> আপনার আবেদন অনুমোদিত হয়েছে। আপনি এখন পেন প্যাকিং কাজ শুরু করতে পারেন। আরও তথ্যের
                      জন্য আমাদের সাথে যোগাযোগ করুন।
                    </p>
                  ) : user.status === "pending" ? (
                    <p className="text-orange-800">
                      আপনার আবেদনটি বর্তমানে পর্যালোচনাধীন রয়েছে। অনুগ্রহ করে ধৈর্য ধরুন। আমরা শীঘ্রই আপনাকে আপডেট দেব।
                    </p>
                  ) : (
                    <p className="text-red-800">
                      দুঃখিত, আপনার আবেদনটি প্রত্যাখ্যাত হয়েছে। আরও তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন।
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="border-t pt-6 text-center text-gray-600">
              <p className="mb-2">এই সার্টিফিকেট ইলেকট্রনিকভাবে জেনারেট করা হয়েছে</p>
              <p className="text-sm">জারি করা হয়েছে: {new Date().toLocaleDateString("bn-BD")} তারিখে</p>
              <div className="mt-4">
                <div className="inline-block bg-gray-100 px-4 py-2 rounded">
                  <span className="text-sm font-medium">পেন প্যাকিং জব - অনুমোদিত কর্তৃপক্ষ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
