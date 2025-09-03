"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  CalendarIcon,
  Download,
} from "lucide-react"
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns"
import { posStorage } from "@/lib/storage"

interface Transaction {
  id: string
  customerId?: string
  items: Array<{ name: string; quantity: number; price: number; sku: string }>
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: string
  timestamp: Date
  receiptNumber: string
}

interface Product {
  id: string
  name: string
  sku: string
  price: number
  cost: number
  category: string
  stock: number
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  customerType: string
  totalSpent: number
  visitCount: number
}

export function ReportsSection() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [reportType, setReportType] = useState<"sales" | "inventory" | "customers" | "financial">("sales")

  useEffect(() => {
    // Load data from storage
    const loadedTransactions = posStorage.getData<Transaction[]>("transactions") || []
    const loadedProducts = posStorage.getData<Product[]>("products") || []
    const loadedCustomers = posStorage.getData<Customer[]>("customers") || []

    // Convert timestamp strings to Date objects
    const parsedTransactions = loadedTransactions.map((t) => ({
      ...t,
      timestamp: new Date(t.timestamp),
    }))

    setTransactions(parsedTransactions)
    setProducts(loadedProducts)
    setCustomers(loadedCustomers)
  }, [])

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) =>
      isWithinInterval(transaction.timestamp, {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to),
      }),
    )
  }, [transactions, dateRange])

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0)
    const totalTransactions = filteredTransactions.length
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    const totalItems = filteredTransactions.reduce(
      (sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    )

    // Calculate growth compared to previous period
    const periodDays = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    const previousPeriodStart = subDays(dateRange.from, periodDays)
    const previousPeriodEnd = subDays(dateRange.to, periodDays)

    const previousTransactions = transactions.filter((transaction) =>
      isWithinInterval(transaction.timestamp, {
        start: startOfDay(previousPeriodStart),
        end: endOfDay(previousPeriodEnd),
      }),
    )

    const previousRevenue = previousTransactions.reduce((sum, t) => sum + t.total, 0)
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0

    return {
      totalRevenue,
      totalTransactions,
      averageOrderValue,
      totalItems,
      revenueGrowth,
      uniqueCustomers: new Set(filteredTransactions.map((t) => t.customerId).filter(Boolean)).size,
    }
  }, [filteredTransactions, transactions, dateRange])

  // Prepare chart data
  const dailySalesData = useMemo(() => {
    const salesByDay = new Map<string, number>()

    filteredTransactions.forEach((transaction) => {
      const day = format(transaction.timestamp, "MMM dd")
      salesByDay.set(day, (salesByDay.get(day) || 0) + transaction.total)
    })

    return Array.from(salesByDay.entries()).map(([day, sales]) => ({
      day,
      sales: Number(sales.toFixed(2)),
    }))
  }, [filteredTransactions])

  const categoryData = useMemo(() => {
    const categoryStats = new Map<string, { revenue: number; quantity: number }>()

    filteredTransactions.forEach((transaction) => {
      transaction.items.forEach((item) => {
        const product = products.find((p) => p.sku === item.sku)
        const category = product?.category || "Unknown"
        const current = categoryStats.get(category) || { revenue: 0, quantity: 0 }

        categoryStats.set(category, {
          revenue: current.revenue + item.price * item.quantity,
          quantity: current.quantity + item.quantity,
        })
      })
    })

    return Array.from(categoryStats.entries()).map(([category, stats]) => ({
      category,
      revenue: Number(stats.revenue.toFixed(2)),
      quantity: stats.quantity,
    }))
  }, [filteredTransactions, products])

  const topProducts = useMemo(() => {
    const productStats = new Map<string, { name: string; quantity: number; revenue: number }>()

    filteredTransactions.forEach((transaction) => {
      transaction.items.forEach((item) => {
        const current = productStats.get(item.sku) || { name: item.name, quantity: 0, revenue: 0 }
        productStats.set(item.sku, {
          name: item.name,
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + item.price * item.quantity,
        })
      })
    })

    return Array.from(productStats.entries())
      .map(([sku, stats]) => ({ sku, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }, [filteredTransactions])

  const paymentMethodData = useMemo(() => {
    const paymentStats = new Map<string, number>()

    filteredTransactions.forEach((transaction) => {
      const method = transaction.paymentMethod
      paymentStats.set(method, (paymentStats.get(method) || 0) + transaction.total)
    })

    return Array.from(paymentStats.entries()).map(([method, total]) => ({
      method,
      total: Number(total.toFixed(2)),
    }))
  }, [filteredTransactions])

  const COLORS = ["#d97706", "#164e63", "#fbbf24", "#34d399", "#60a5fa"]

  const handleExportReport = () => {
    const reportData = {
      dateRange,
      metrics,
      dailySales: dailySalesData,
      categoryBreakdown: categoryData,
      topProducts,
      paymentMethods: paymentMethodData,
      generatedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pos-report-${format(new Date(), "yyyy-MM-dd")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4 items-center">
          <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales Report</SelectItem>
              <SelectItem value="inventory">Inventory Report</SelectItem>
              <SelectItem value="customers">Customer Report</SelectItem>
              <SelectItem value="financial">Financial Report</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-64 justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                  initialFocus
                />
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={handleExportReport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1">
                {metrics.revenueGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ${metrics.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {Math.abs(metrics.revenueGrowth).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{metrics.totalTransactions}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">${metrics.averageOrderValue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Customers</p>
                <p className="text-2xl font-bold">{metrics.uniqueCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
                <Line type="monotone" dataKey="sales" stroke="#d97706" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Total"]} />
                <Bar dataKey="total" fill="#164e63" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={product.sku} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {product.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${product.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Report */}
      {reportType === "inventory" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{products.filter((p) => p.stock <= 10).length}</p>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  ${products.reduce((sum, p) => sum + p.stock * p.cost, 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Low Stock Alert</h4>
              {products
                .filter((p) => p.stock <= 10)
                .map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                    <Badge variant="destructive">{product.stock} left</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
