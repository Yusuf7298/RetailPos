"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSave: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}

export function ProductDialog({ open, onOpenChange, product, onSave, onCancel }: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    price: "",
    cost: "",
    category: "",
    supplier: "",
    stock: "",
    minStock: "",
    maxStock: "",
    description: "",
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || "",
        price: product.price.toString(),
        cost: product.cost.toString(),
        category: product.category,
        supplier: product.supplier,
        stock: product.stock.toString(),
        minStock: product.minStock.toString(),
        maxStock: product.maxStock.toString(),
        description: product.description || "",
      })
    } else {
      setFormData({
        name: "",
        sku: "",
        barcode: "",
        price: "",
        cost: "",
        category: "",
        supplier: "",
        stock: "",
        minStock: "",
        maxStock: "",
        description: "",
      })
    }
  }, [product, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const productData = {
      name: formData.name,
      sku: formData.sku,
      barcode: formData.barcode || undefined,
      price: Number.parseFloat(formData.price),
      cost: Number.parseFloat(formData.cost),
      category: formData.category,
      supplier: formData.supplier,
      stock: Number.parseInt(formData.stock),
      minStock: Number.parseInt(formData.minStock),
      maxStock: Number.parseInt(formData.maxStock),
      description: formData.description || undefined,
    }

    onSave(productData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Sale Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="cost">Cost Price *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="stock">Current Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="minStock">Minimum Stock *</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="maxStock">Maximum Stock *</Label>
              <Input
                id="maxStock"
                type="number"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{product ? "Update Product" : "Add Product"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
