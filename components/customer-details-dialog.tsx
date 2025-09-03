"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Calendar, Star, ShoppingBag, Gift, CreditCard } from "lucide-react"

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth?: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  loyaltyPoints: number
  totalSpent: number
  visitCount: number
  customerType: "regular" | "vip" | "wholesale"
  notes?: string
  createdAt: Date
  lastVisit?: Date
}

interface Transaction {
  id: string
  customerId: string
  total: number
  items: Array<{ name: string; quantity: number; price: number }>
  timestamp: Date
  receiptNumber: string
}

interface CustomerDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  transactions: Transaction[]
  onClose: () => void
}

export function CustomerDetailsDialog({
  open,
  onOpenChange,
  customer,
  transactions,
  onClose,
}: CustomerDetailsDialogProps) {
  if (!customer) return null

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case "vip":
        return "default"
      case "wholesale":
        return "secondary"
      default:
        return "outline"
    }
  }

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {customer.firstName[0]}
                {customer.lastName[0]}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {customer.firstName} {customer.lastName}
              </h2>
              <Badge variant={getCustomerTypeColor(customer.customerType)} className="text-xs">
                {customer.customerType.toUpperCase()}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p>{customer.address.street}</p>
                    <p>
                      {customer.address.city}, {customer.address.state} {customer.address.zipCode}
                    </p>
                  </div>
                </div>
                {customer.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(customer.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Total Spent</span>
                  </div>
                  <span className="font-semibold">${customer.totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm">Loyalty Points</span>
                  </div>
                  <span className="font-semibold">{customer.loyaltyPoints}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Visit Count</span>
                  </div>
                  <span className="font-semibold">{customer.visitCount}</span>
                </div>
                {customer.lastVisit && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Last Visit</span>
                    </div>
                    <span className="font-semibold text-sm">{new Date(customer.lastVisit).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {customer.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{customer.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">Receipt #{transaction.receiptNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.timestamp).toLocaleDateString()} at{" "}
                              {new Date(transaction.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          <Badge variant="outline">${transaction.total.toFixed(2)}</Badge>
                        </div>
                        <div className="space-y-1">
                          {transaction.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span>${(item.quantity * item.price).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No transaction history available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
