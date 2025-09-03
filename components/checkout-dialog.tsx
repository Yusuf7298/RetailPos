"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, DollarSign, Smartphone, Banknote, ArrowLeft } from "lucide-react"

interface CheckoutDialogProps {
  total: number
  onComplete: (paymentMethod: string, paymentDetails?: any) => void
  trigger: React.ReactNode
}

export function CheckoutDialog({ total, onComplete, trigger }: CheckoutDialogProps) {
  const [open, setOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [cashAmount, setCashAmount] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [splitPayments, setSplitPayments] = useState<Array<{ method: string; amount: number }>>([])

  const paymentMethods = [
    { id: "cash", label: "Cash", icon: DollarSign, color: "bg-green-100 hover:bg-green-200" },
    { id: "card", label: "Credit/Debit Card", icon: CreditCard, color: "bg-blue-100 hover:bg-blue-200" },
    { id: "mobile", label: "Mobile Payment", icon: Smartphone, color: "bg-purple-100 hover:bg-purple-200" },
    { id: "split", label: "Split Payment", icon: Banknote, color: "bg-orange-100 hover:bg-orange-200" },
  ]

  const handlePaymentComplete = () => {
    if (paymentMethod === "cash") {
      const cash = Number.parseFloat(cashAmount)
      if (cash >= total) {
        onComplete("Cash", { amountPaid: cash, change: cash - total })
        resetDialog()
      }
    } else if (paymentMethod === "card") {
      onComplete("Credit Card", { cardNumber: cardNumber.slice(-4) })
      resetDialog()
    } else if (paymentMethod === "mobile") {
      onComplete("Mobile Payment")
      resetDialog()
    }
  }

  const resetDialog = () => {
    setOpen(false)
    setPaymentMethod(null)
    setCashAmount("")
    setCardNumber("")
    setSplitPayments([])
  }

  const change = cashAmount ? Math.max(0, Number.parseFloat(cashAmount) - total) : 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {paymentMethod && (
              <Button variant="ghost" size="sm" onClick={() => setPaymentMethod(null)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {paymentMethod ? "Payment Details" : "Select Payment Method"}
          </DialogTitle>
        </DialogHeader>

        {!paymentMethod ? (
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-colors ${method.color}`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <CardContent className="p-4 text-center">
                    <Icon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">{method.label}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">${total.toFixed(2)}</p>
            </div>

            {paymentMethod === "cash" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cash-amount">Cash Amount</Label>
                  <Input
                    id="cash-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                  />
                </div>
                {change > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-700">Change Due</p>
                    <p className="text-xl font-bold text-green-800">${change.toFixed(2)}</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {[20, 50, 100].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setCashAmount((total + amount).toString())}
                    >
                      +${amount}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    placeholder="**** **** **** 1234"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">Card will be processed for ${total.toFixed(2)}</p>
              </div>
            )}

            {paymentMethod === "mobile" && (
              <div className="text-center space-y-4">
                <div className="w-32 h-32 bg-muted mx-auto rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">QR Code</p>
                </div>
                <p className="text-sm text-muted-foreground">Customer can scan QR code to pay ${total.toFixed(2)}</p>
              </div>
            )}

            <Button
              onClick={handlePaymentComplete}
              className="w-full"
              disabled={
                (paymentMethod === "cash" && Number.parseFloat(cashAmount) < total) ||
                (paymentMethod === "card" && !cardNumber)
              }
            >
              Complete Payment
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
