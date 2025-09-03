"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Percent } from "lucide-react"

interface DiscountDialogProps {
  discount: number
  discountType: "percentage" | "fixed"
  onApplyDiscount: (amount: number, type: "percentage" | "fixed") => void
}

export function DiscountDialog({ discount, discountType, onApplyDiscount }: DiscountDialogProps) {
  const [open, setOpen] = useState(false)
  const [tempDiscount, setTempDiscount] = useState(discount.toString())
  const [tempType, setTempType] = useState(discountType)

  const handleApply = () => {
    const amount = Number.parseFloat(tempDiscount) || 0
    onApplyDiscount(amount, tempType)
    setOpen(false)
  }

  const handleClear = () => {
    onApplyDiscount(0, "percentage")
    setTempDiscount("0")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Percent className="w-4 h-4 mr-2" />
          Discount
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Discount Type</Label>
            <RadioGroup value={tempType} onValueChange={(value: "percentage" | "fixed") => setTempType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage">Percentage (%)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed">Fixed Amount ($)</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="discount-amount">{tempType === "percentage" ? "Percentage" : "Amount"}</Label>
            <Input
              id="discount-amount"
              type="number"
              step={tempType === "percentage" ? "1" : "0.01"}
              placeholder={tempType === "percentage" ? "10" : "5.00"}
              value={tempDiscount}
              onChange={(e) => setTempDiscount(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApply} className="flex-1">
              Apply Discount
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
