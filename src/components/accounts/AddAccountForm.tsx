'use client';

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'

export default function AddAccountForm() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [accountName, setAccountName] = useState('')
  const [accountType, setAccountType] = useState('')
  const [balance, setBalance] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically call a function to add the account to Supabase
    console.log('Adding account:', { accountName, accountType, balance })
    // Reset form
    setAccountName('')
    setAccountType('')
    setBalance('')
    setIsExpanded(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>Add New Account</span>
          {isExpanded ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="accountType">Account Type</Label>
              <Input
                id="accountType"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="balance">Initial Balance</Label>
              <Input
                id="balance"
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-between">
              <Button type="submit">Add Account</Button>
              <Button type="button" variant="outline" onClick={() => setIsExpanded(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  )
}