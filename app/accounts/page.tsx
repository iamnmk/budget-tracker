"use client"

import { useState, useEffect } from "react"
import {
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  CreditCard,
  Wallet,
  BarChart3,
  Settings,
  ChevronRight,
} from "lucide-react"
import { motion } from "framer-motion"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AddAccountDialog } from "@/components/accounts/AddAccountDialog"
import { getAccounts, deleteAccount } from "@/actions/accountActions"

// Define the account type to match our schema
interface AccountActivity {
  amount: number
  type: "deposit" | "withdrawal"
  date: string
}

interface Account {
  _id: string
  userId: string
  name: string
  type: string
  balance: number
  currency: string
  createdAt: number
  updatedAt: number
}

export default function AccountsDashboard() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const router = useRouter()

  // Function to load accounts
  const loadAccounts = async () => {
    try {
      setIsLoading(true)
      const result = await getAccounts()
      
      if (result.success) {
        setAccounts(result.data || [])
        console.log("Loaded accounts:", result.data)
      } else {
        setError(result.error || "Failed to load accounts")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error("Error loading accounts:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load accounts when component mounts or when requested to refresh
  useEffect(() => {
    loadAccounts()
  }, [])

  const handleDeleteAccount = async (accountId: string) => {
    if (confirm("Are you sure you want to delete this account?")) {
      try {
        const result = await deleteAccount(accountId)
        
        if (result.success) {
          // Remove account from state
          setAccounts(accounts.filter(account => account._id !== accountId))
        } else {
          alert(result.error || "Failed to delete account")
        }
      } catch (err) {
        alert("An unexpected error occurred")
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#050708] text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Accounts</h1>
            <p className="text-gray-400 mt-1">Manage your financial portfolio</p>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 border border-[#161b22]">
              <AvatarImage src={user?.imageUrl || "/placeholder.svg?height=40&width=40"} />
              <AvatarFallback className="bg-[#161b22] text-white">
                {user?.firstName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <AddAccountDialog onAccountAdded={loadAccounts} />
          </div>
        </header>

        <Tabs defaultValue="accounts" className="mb-8">
          <TabsList className="bg-[#161b22] border-0">
            <TabsTrigger
              value="accounts"
              className="data-[state=active]:bg-[#00b386] data-[state=active]:text-white text-gray-300"
            >
              Accounts
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-[#00b386] data-[state=active]:text-white text-gray-300"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-[#00b386] data-[state=active]:text-white text-gray-300"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00b386]"></div>
              </div>
            ) : error ? (
              <div className="bg-[#ff5252]/10 text-[#ff5252] p-4 rounded-lg text-center">
                {error}
              </div>
            ) : accounts.length === 0 ? (
              <div className="bg-[#161b22] p-8 rounded-lg text-center">
                <div className="text-gray-400 mb-4">You don't have any accounts yet</div>
                <AddAccountDialog />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => (
                  <motion.div
                    key={account._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden border-[#161b22] bg-[#0d1117] hover:shadow-lg hover:shadow-[#00b386]/5 transition-all duration-300">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl font-medium text-white">{account.name}</CardTitle>
                            <CardDescription className="text-gray-400">{account.type}</CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-[#161b22] text-white border-[#21262d]">
                            {account.type}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="mt-2 mb-6">
                          <div className="text-3xl font-bold text-white">
                            {account.currency}
                            {account.balance.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">Available Balance</div>
                        </div>

                        <div className="space-y-3">
                          <div className="text-sm font-medium text-white">Account Info</div>
                          <div className="flex items-center justify-between py-1 border-b border-[#21262d]">
                            <div className="text-gray-400">Created</div>
                            <div className="text-white">{new Date(account.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-[#21262d]">
                            <div className="text-gray-400">Last Updated</div>
                            <div className="text-white">{new Date(account.updatedAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="flex justify-between border-t border-[#21262d] pt-4">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-[#161b22]">
                          View Details <ChevronRight size={16} className="ml-1" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-[#ff5252] hover:bg-[#ff5252]/10"
                          onClick={() => handleDeleteAccount(account._id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="border-[#161b22] bg-[#0d1117]">
              <CardHeader>
                <CardTitle className="text-white">Analytics Dashboard</CardTitle>
                <CardDescription className="text-gray-400">View your financial analytics and trends</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="border-[#161b22] bg-[#0d1117]">
              <CardHeader>
                <CardTitle className="text-white">Account Settings</CardTitle>
                <CardDescription className="text-gray-400">Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Settings size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Settings dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 gap-6 mt-8">
          <Card className="border-[#161b22] bg-[#0d1117]">
            <CardHeader>
              <CardTitle className="text-lg text-white">Portfolio Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <p>Your portfolio visualization will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
