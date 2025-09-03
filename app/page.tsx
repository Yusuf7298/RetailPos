"use client"

import { useState } from "react"
import { POSLayout } from "@/components/pos-layout"
import { SalesSection } from "@/components/sales-section"
import { InventorySection } from "@/components/inventory-section"
import { CustomersSection } from "@/components/customers-section"
import { ReportsSection } from "@/components/reports-section"
import { SettingsSection } from "@/components/settings-section"

export default function POSPage() {
  const [activeSection, setActiveSection] = useState("sales")

  const renderSection = () => {
    switch (activeSection) {
      case "sales":
        return <SalesSection />
      case "inventory":
        return <InventorySection />
      case "customers":
        return <CustomersSection />
      case "reports":
        return <ReportsSection />
      case "settings":
        return <SettingsSection />
      default:
        return <SalesSection />
    }
  }

  return (
    <POSLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderSection()}
    </POSLayout>
  )
}
