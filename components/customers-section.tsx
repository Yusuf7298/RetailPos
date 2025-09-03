"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Users, Star, Phone, Mail, Calendar, ShoppingBag, Gift } from "lucide-react"
import { CustomerDialog } from "@/components/customer-dialog"
import { CustomerDetailsDialog } from "@/components/customer-details-dialog"

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

export function CustomersSection() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  // Load customers and transactions from localStorage on component mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem("pos_customers")
    const savedTransactions = localStorage.getItem("pos_transactions")

    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers))
    } else {
      // Initialize with sample data
      const sampleCustomers: Customer[] = [
        {
          id: "1",
          firstName: "John",
          lastName: "Smith",
          email: "john.smith@email.com",
          phone: "(555) 123-4567",
          dateOfBirth: "1985-06-15",
          address: {
            street: "123 Main St",
            city: "Anytown",
            state: "CA",
            zipCode: "12345",
          },
          loyaltyPoints: 250,
          totalSpent: 1250.75,
          visitCount: 15,
          customerType: "vip",
          notes: "Prefers organic products",
          createdAt: new Date("2023-01-15"),
          lastVisit: new Date("2024-01-10"),
        },
        {
          id: "2",
          firstName: "Sarah",
          lastName: "Johnson",
          email: "sarah.j@email.com",
          phone: "(555) 987-6543",
          address: {
            street: "456 Oak Ave",
            city: "Somewhere",
            state: "NY",
            zipCode: "67890",
          },
          loyaltyPoints: 120,
          totalSpent: 580.25,
          visitCount: 8,
          customerType: "regular",
          createdAt: new Date("2023-03-22"),
          lastVisit: new Date("2024-01-08"),
        },
        {
          id: "3",
          firstName: "Mike",
          lastName: "Wilson",
          email: "mike.wilson@business.com",
          phone: "(555) 456-7890",
          address: {
            street: "789 Business Blvd",
            city: "Commerce",
            state: "TX",
            zipCode: "54321",
          },
          loyaltyPoints: 50,
          totalSpent: 2150.0,
          visitCount: 5,
          customerType: "wholesale",
          notes: "Bulk orders for office",
          createdAt: new Date("2023-08-10"),
          lastVisit: new Date("2024-01-05"),
        },
      ]
      setCustomers(sampleCustomers)
      localStorage.setItem("pos_customers", JSON.stringify(sampleCustomers))
    }

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }
  }, [])

  // Save customers to localStorage whenever customers change
  useEffect(() => {
    localStorage.setItem("pos_customers", JSON.stringify(customers))
  }, [customers])

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)

    const matchesType = customerTypeFilter === "all" || customer.customerType === customerTypeFilter

    return matchesSearch && matchesType
  })

  const handleAddCustomer = (
    customerData: Omit<Customer, "id" | "createdAt" | "loyaltyPoints" | "totalSpent" | "visitCount">,
  ) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      loyaltyPoints: 0,
      totalSpent: 0,
      visitCount: 0,
      createdAt: new Date(),
    }
    setCustomers([...customers, newCustomer])
    setShowCustomerDialog(false)
  }

  const handleEditCustomer = (
    customerData: Omit<Customer, "id" | "createdAt" | "loyaltyPoints" | "totalSpent" | "visitCount">,
  ) => {
    if (selectedCustomer) {
      const updatedCustomer: Customer = {
        ...customerData,
        id: selectedCustomer.id,
        loyaltyPoints: selectedCustomer.loyaltyPoints,
        totalSpent: selectedCustomer.totalSpent,
        visitCount: selectedCustomer.visitCount,
        createdAt: selectedCustomer.createdAt,
      }
      setCustomers(customers.map((c) => (c.id === selectedCustomer.id ? updatedCustomer : c)))
      setSelectedCustomer(null)
      setShowCustomerDialog(false)
    }
  }

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers(customers.filter((c) => c.id !== customerId))
  }

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

  const getCustomerTransactions = (customerId: string) => {
    return transactions.filter((t) => t.customerId === customerId)
  }

  const totalCustomers = customers.length
  const vipCustomers = customers.filter((c) => c.customerType === "vip").length
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)
  const averageSpent = customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">VIP Customers</p>
                <p className="text-2xl font-bold">{vipCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Loyalty Points</p>
                <p className="text-2xl font-bold">{totalLoyaltyPoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Customer Value</p>
                <p className="text-2xl font-bold">${averageSpent.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Customer Management
            </CardTitle>
            <Button onClick={() => setShowCustomerDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customer Types</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {customer.firstName} {customer.lastName}
                      </h3>
                      <Badge variant={getCustomerTypeColor(customer.customerType)} className="text-xs">
                        {customer.customerType.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCustomer(customer)
                          setShowCustomerDialog(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCustomer(customer.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.lastVisit && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Last visit: {new Date(customer.lastVisit).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Visits</p>
                        <p className="font-semibold">{customer.visitCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Points</p>
                        <p className="font-semibold">{customer.loyaltyPoints}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Spent</p>
                        <p className="font-semibold">${customer.totalSpent.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-3 bg-transparent"
                    onClick={() => {
                      setSelectedCustomer(customer)
                      setShowDetailsDialog(true)
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No customers found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CustomerDialog
        open={showCustomerDialog}
        onOpenChange={setShowCustomerDialog}
        customer={selectedCustomer}
        onSave={selectedCustomer ? handleEditCustomer : handleAddCustomer}
        onCancel={() => {
          setSelectedCustomer(null)
          setShowCustomerDialog(false)
        }}
      />

      <CustomerDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        customer={selectedCustomer}
        transactions={selectedCustomer ? getCustomerTransactions(selectedCustomer.id) : []}
        onClose={() => {
          setSelectedCustomer(null)
          setShowDetailsDialog(false)
        }}
      />
    </div>
  )
}
