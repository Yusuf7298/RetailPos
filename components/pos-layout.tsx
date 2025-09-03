"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingCart, Package, Users, BarChart3, Settings, Bell, Menu, X, Store, Database } from "lucide-react"
import { DataManagementDialog } from "@/components/data-management-dialog"

interface POSLayoutProps {
  children: React.ReactNode
  activeSection: string
  onSectionChange: (section: string) => void
}

export function POSLayout({ children, activeSection, onSectionChange }: POSLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navigationItems = [
    { id: "sales", label: "Sales", icon: ShoppingCart },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "customers", label: "Customers", icon: Users },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300 bg-sidebar border-r border-sidebar-border flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-sidebar-foreground">RetailPOS</h1>
                <p className="text-xs text-sidebar-foreground/60">Store Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  onClick={() => onSectionChange(item.id)}
                >
                  <Icon className="w-5 h-5" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Button>
              )
            })}
          </div>
        </nav>

        {/* Data Management Button */}
        {sidebarOpen && (
          <div className="p-4 border-t border-sidebar-border">
            <DataManagementDialog
              trigger={
                <Button variant="ghost" size="sm" className="w-full text-sidebar-foreground hover:bg-sidebar-accent">
                  <Database className="w-4 h-4 mr-2" />
                  Data Management
                </Button>
              }
            />
          </div>
        )}

        {/* Sidebar Toggle */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-card-foreground capitalize">{activeSection}</h2>
              <p className="text-sm text-muted-foreground">
                {activeSection === "sales" && "Process transactions and manage cart"}
                {activeSection === "inventory" && "Manage products and stock levels"}
                {activeSection === "customers" && "View and manage customer information"}
                {activeSection === "reports" && "View sales and performance analytics"}
                {activeSection === "settings" && "Configure system preferences"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Card className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-foreground">JD</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-card-foreground">John Doe</p>
                    <p className="text-muted-foreground">Cashier</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
