"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  DollarSign,
  ShoppingBag,
  Receipt,
  RotateCcw,
  CheckCircle,
} from "lucide-react"
import { CheckoutDialog } from "@/components/checkout-dialog"
import { DiscountDialog } from "@/components/discount-dialog"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  sku: string
}

interface Transaction {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: string
  timestamp: Date
  receiptNumber: string
}

export function SalesSection() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")
  const [showCheckout, setShowCheckout] = useState(false)
  const [showDiscount, setShowDiscount] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null)

  // Sample products for demonstration
  const sampleProducts = [
    { id: "1", name: "Coffee Beans - Premium", price: 12.99, sku: "CB001" },
    { id: "2", name: "Organic Tea Bags", price: 8.5, sku: "TB002" },
    { id: "3", name: "Chocolate Bar - Dark", price: 4.25, sku: "CH003" },
    { id: "4", name: "Energy Drink", price: 2.99, sku: "ED004" },
    { id: "5", name: "Sandwich - Turkey Club", price: 7.99, sku: "SW005" },
    { id: "6", name: "Bottled Water", price: 1.5, sku: "BW006" },
  ]

  const addToCart = (product: (typeof sampleProducts)[0]) => {
    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const updateQuantity = (id: string, change: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + change
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
          }
          return item
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
    setDiscount(0)
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = discountType === "percentage" ? subtotal * (discount / 100) : Math.min(discount, subtotal)
  const taxableAmount = subtotal - discountAmount
  const tax = taxableAmount * 0.08 // 8% tax
  const total = taxableAmount + tax

  const completeTransaction = (paymentMethod: string, paymentDetails?: any) => {
    const transaction: Transaction = {
      id: `TXN-${Date.now()}`,
      items: [...cart],
      subtotal,
      tax,
      discount: discountAmount,
      total,
      paymentMethod,
      timestamp: new Date(),
      receiptNumber: `RCP-${Date.now().toString().slice(-6)}`,
    }

    // Store transaction in localStorage
    const transactions = JSON.parse(localStorage.getItem("pos_transactions") || "[]")
    transactions.push(transaction)
    localStorage.setItem("pos_transactions", JSON.stringify(transactions))

    setLastTransaction(transaction)
    clearCart()
    setShowCheckout(false)
  }

  const processReturn = () => {
    if (lastTransaction) {
      // In a real system, this would process the refund
      console.log("Processing return for transaction:", lastTransaction.id)
      setLastTransaction(null)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Product Search & Selection */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Product Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sampleProducts
                .filter(
                  (product) =>
                    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.sku.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((product) => (
                  <Card key={product.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-card-foreground">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                        <Badge variant="secondary">${product.price}</Badge>
                      </div>
                      <Button onClick={() => addToCart(product)} className="w-full" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>

        {lastTransaction && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                Last Transaction Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Receipt: {lastTransaction.receiptNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    Total: ${lastTransaction.total.toFixed(2)} - {lastTransaction.paymentMethod}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Receipt className="w-4 h-4 mr-2" />
                    Print Receipt
                  </Button>
                  <Button variant="outline" size="sm" onClick={processReturn}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Return
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cart & Checkout */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Current Transaction
              </div>
              {cart.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearCart}>
                  Clear All
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No items in cart</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">${item.price} each</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus className="w-3 h-3" />
                      </Button>

                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>

                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>

                      <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        {cart.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax (8%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <DiscountDialog
                  discount={discount}
                  discountType={discountType}
                  onApplyDiscount={(amount, type) => {
                    setDiscount(amount)
                    setDiscountType(type)
                  }}
                />
                <Button variant="outline" size="sm" onClick={() => completeTransaction("Cash")}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Quick Cash
                </Button>
              </div>

              <CheckoutDialog
                total={total}
                onComplete={completeTransaction}
                trigger={
                  <Button className="w-full mt-3" size="lg">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Checkout
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
