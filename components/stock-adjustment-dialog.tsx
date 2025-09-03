"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Product {
  id: string
  name: string
  sku: string
  stock: number
  minStock: number
  maxStock: number
}

interface StockAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onAdjust: (productId: string, adjustment: number, reason: string) => void
  onCancel: () => void
}

export function StockAdjustmentDialog({ open, onOpenChange, product, onAdjust, onCancel }: StockAdjustmentDialogProps) {
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove" | "set">("add")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!product || !quantity || !reason) return

    let adjustment = 0
    const qty = Number.parseInt(quantity)

    switch (adjustmentType) {
      case "add":
        adjustment = qty
        break
      case "remove":
        adjustment = -qty
        break
      case "set":
        adjustment = qty - product.stock
        break
    }

    onAdjust(product.id, adjustment, reason)
    setQuantity("")
    setReason("")
    setAdjustmentType("add")
  }

  const getNewStock = () => {
    if (!product || !quantity) return product?.stock || 0

    const qty = Number.parseInt(quantity)
    switch (adjustmentType) {
      case "add":
        return product.stock + qty
      case "remove":
        return Math.max(0, product.stock - qty)
      case "set":
        return qty
      default:
        return product.stock
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
        </DialogHeader>

        {product && (
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
              <p className="text-sm">
                Current Stock: <span className="font-medium">{product.stock}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Adjustment Type</Label>
                <Select
                  value={adjustmentType}
                  onValueChange={(value: "add" | "remove" | "set") => setAdjustmentType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Stock</SelectItem>
                    <SelectItem value="remove">Remove Stock</SelectItem>
                    <SelectItem value="set">Set Stock Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">{adjustmentType === "set" ? "New Stock Level" : "Quantity"}</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              {quantity && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm">
                    New Stock Level: <span className="font-medium">{getNewStock()}</span>
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="reason">Reason for Adjustment</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Received shipment, Damaged goods, Inventory count correction"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit">Apply Adjustment</Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
