"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Package, AlertTriangle, TrendingUp, TrendingDown, Download, Upload } from "lucide-react"
import { ProductDialog } from "@/components/product-dialog"
import { StockAdjustmentDialog } from "@/components/stock-adjustment-dialog"

interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  price: number
  cost: number
  category: string
  supplier: string
  stock: number
  minStock: number
  maxStock: number
  description?: string
  createdAt: Date
  updatedAt: Date
}

export function InventorySection() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showStockDialog, setShowStockDialog] = useState(false)

  // Load products from localStorage on component mount
  useEffect(() => {
    const savedProducts = localStorage.getItem("pos_products")
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    } else {
      // Initialize with sample data
      const sampleProducts: Product[] = [
        {
          id: "1",
          name: "Coffee Beans - Premium",
          sku: "CB001",
          barcode: "1234567890123",
          price: 12.99,
          cost: 8.5,
          category: "Beverages",
          supplier: "Coffee Co.",
          stock: 45,
          minStock: 10,
          maxStock: 100,
          description: "Premium arabica coffee beans",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          name: "Organic Tea Bags",
          sku: "TB002",
          barcode: "1234567890124",
          price: 8.5,
          cost: 5.25,
          category: "Beverages",
          supplier: "Tea Masters",
          stock: 8,
          minStock: 15,
          maxStock: 80,
          description: "Organic green tea bags",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "3",
          name: "Chocolate Bar - Dark",
          sku: "CH003",
          barcode: "1234567890125",
          price: 4.25,
          cost: 2.1,
          category: "Snacks",
          supplier: "Sweet Treats",
          stock: 120,
          minStock: 20,
          maxStock: 200,
          description: "70% dark chocolate bar",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "4",
          name: "Energy Drink",
          sku: "ED004",
          barcode: "1234567890126",
          price: 2.99,
          cost: 1.5,
          category: "Beverages",
          supplier: "Energy Plus",
          stock: 2,
          minStock: 25,
          maxStock: 150,
          description: "Natural energy drink",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
      setProducts(sampleProducts)
      localStorage.setItem("pos_products", JSON.stringify(sampleProducts))
    }
  }, [])

  // Save products to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem("pos_products", JSON.stringify(products))
  }, [products])

  const categories = [...new Set(products.map((p) => p.category))]
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && product.stock <= product.minStock) ||
      (stockFilter === "out" && product.stock === 0) ||
      (stockFilter === "normal" && product.stock > product.minStock)

    return matchesSearch && matchesCategory && matchesStock
  })

  const handleAddProduct = (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setProducts([...products, newProduct])
    setShowProductDialog(false)
  }

  const handleEditProduct = (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    if (selectedProduct) {
      const updatedProduct: Product = {
        ...productData,
        id: selectedProduct.id,
        createdAt: selectedProduct.createdAt,
        updatedAt: new Date(),
      }
      setProducts(products.map((p) => (p.id === selectedProduct.id ? updatedProduct : p)))
      setSelectedProduct(null)
      setShowProductDialog(false)
    }
  }

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId))
  }

  const handleStockAdjustment = (productId: string, adjustment: number, reason: string) => {
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + adjustment), updatedAt: new Date() } : p,
      ),
    )
    setShowStockDialog(false)
    setSelectedProduct(null)
  }

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { label: "Out of Stock", color: "destructive" }
    if (product.stock <= product.minStock) return { label: "Low Stock", color: "secondary" }
    return { label: "In Stock", color: "default" }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  ${products.reduce((sum, p) => sum + p.stock * p.cost, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
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
              <Package className="w-5 h-5" />
              Product Inventory
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button onClick={() => setShowProductDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name, SKU, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="normal">Normal Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Product</th>
                    <th className="text-left p-3 font-medium">SKU</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-left p-3 font-medium">Price</th>
                    <th className="text-left p-3 font-medium">Stock</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product)
                    return (
                      <tr key={product.id} className="border-t hover:bg-muted/50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.supplier}</p>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-sm">{product.sku}</td>
                        <td className="p-3">
                          <Badge variant="outline">{product.category}</Badge>
                        </td>
                        <td className="p-3 font-medium">${product.price}</td>
                        <td className="p-3">
                          <div className="text-center">
                            <p className="font-medium">{product.stock}</p>
                            <p className="text-xs text-muted-foreground">Min: {product.minStock}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={status.color as any}>{status.label}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product)
                                setShowProductDialog(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product)
                                setShowStockDialog(true)
                              }}
                            >
                              <Package className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProductDialog
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        product={selectedProduct}
        onSave={selectedProduct ? handleEditProduct : handleAddProduct}
        onCancel={() => {
          setSelectedProduct(null)
          setShowProductDialog(false)
        }}
      />

      <StockAdjustmentDialog
        open={showStockDialog}
        onOpenChange={setShowStockDialog}
        product={selectedProduct}
        onAdjust={handleStockAdjustment}
        onCancel={() => {
          setSelectedProduct(null)
          setShowStockDialog(false)
        }}
      />
    </div>
  )
}
