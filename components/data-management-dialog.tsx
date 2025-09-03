"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Download, Upload, RotateCcw, Trash2, HardDrive, AlertTriangle, CheckCircle } from "lucide-react"
import { posStorage } from "@/lib/storage"

interface DataManagementDialogProps {
  trigger: React.ReactNode
}

export function DataManagementDialog({ trigger }: DataManagementDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"backup" | "import" | "storage">("backup")
  const [importData, setImportData] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const storageInfo = posStorage.getStorageInfo()

  const handleExport = () => {
    try {
      const data = posStorage.exportData()
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `pos-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage({ type: "success", text: "Data exported successfully!" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to export data" })
    }
  }

  const handleImport = () => {
    try {
      if (!importData.trim()) {
        setMessage({ type: "error", text: "Please paste JSON data to import" })
        return
      }

      const success = posStorage.importData(importData)
      if (success) {
        setMessage({ type: "success", text: "Data imported successfully!" })
        setImportData("")
        // Refresh the page to reflect imported data
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessage({ type: "error", text: "Failed to import data - invalid format" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to import data" })
    }
  }

  const handleCreateBackup = () => {
    try {
      posStorage.createBackup()
      setMessage({ type: "success", text: "Backup created successfully!" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create backup" })
    }
  }

  const handleRestoreBackup = () => {
    try {
      const success = posStorage.restoreFromBackup()
      if (success) {
        setMessage({ type: "success", text: "Data restored from backup!" })
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessage({ type: "error", text: "No backup found or restore failed" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to restore backup" })
    }
  }

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      try {
        posStorage.clearAllData()
        setMessage({ type: "success", text: "All data cleared!" })
        setTimeout(() => window.location.reload(), 1500)
      } catch (error) {
        setMessage({ type: "error", text: "Failed to clear data" })
      }
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setImportData(content)
      }
      reader.readAsText(file)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </DialogTitle>
        </DialogHeader>

        {message && (
          <Alert className={message.type === "error" ? "border-destructive" : "border-green-500"}>
            {message.type === "error" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "backup" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("backup")}
          >
            Backup & Restore
          </Button>
          <Button
            variant={activeTab === "import" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("import")}
          >
            Import & Export
          </Button>
          <Button
            variant={activeTab === "storage" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("storage")}
          >
            Storage Info
          </Button>
        </div>

        {activeTab === "backup" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Backup & Restore</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={handleCreateBackup} className="w-full">
                    <Database className="w-4 h-4 mr-2" />
                    Create Backup
                  </Button>
                  <Button onClick={handleRestoreBackup} variant="outline" className="w-full bg-transparent">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore Backup
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Backups are stored locally in your browser. Create regular backups to prevent data loss.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={handleClearData} variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  This will permanently delete all products, customers, transactions, and settings.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "import" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExport} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Download all your POS data as a JSON file for backup or transfer.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Import Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file-import">Import from File</Label>
                  <Input id="file-import" type="file" accept=".json" onChange={handleFileImport} className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="json-import">Or paste JSON data</Label>
                  <Textarea
                    id="json-import"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your JSON data here..."
                    rows={6}
                    className="mt-1 font-mono text-sm"
                  />
                </div>

                <Button onClick={handleImport} className="w-full" disabled={!importData.trim()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>

                <p className="text-sm text-muted-foreground">
                  Warning: Importing will replace all existing data. Create a backup first.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "storage" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Storage Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Used Storage:</span>
                  <Badge variant="outline">{formatBytes(storageInfo.used)}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Available:</span>
                  <Badge variant="outline">{formatBytes(storageInfo.available)}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usage:</span>
                    <span>{storageInfo.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        storageInfo.percentage > 80
                          ? "bg-destructive"
                          : storageInfo.percentage > 60
                            ? "bg-yellow-500"
                            : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {storageInfo.percentage > 80 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Storage is nearly full. Consider exporting and clearing old data.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HardDrive className="w-4 h-4" />
                  <span>Data is stored locally in your browser</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
