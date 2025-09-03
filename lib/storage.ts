interface StorageData {
  products: any[]
  customers: any[]
  transactions: any[]
  settings: any
  users: any[]
  lastBackup: string
  version: string
}

class POSStorage {
  private readonly STORAGE_KEY = "pos_data"
  private readonly BACKUP_KEY = "pos_backup"
  private readonly VERSION = "1.0.0"

  // Initialize storage with default data structure
  private getDefaultData(): StorageData {
    return {
      products: [],
      customers: [],
      transactions: [],
      settings: {
        storeName: "RetailPOS",
        taxRate: 0.08,
        currency: "USD",
        receiptFooter: "Thank you for your business!",
        lowStockThreshold: 10,
      },
      users: [],
      lastBackup: new Date().toISOString(),
      version: this.VERSION,
    }
  }

  // Get all data from localStorage
  getAllData(): StorageData {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (!data) {
        const defaultData = this.getDefaultData()
        this.saveAllData(defaultData)
        return defaultData
      }

      const parsedData = JSON.parse(data)

      // Migrate data if version mismatch
      if (parsedData.version !== this.VERSION) {
        return this.migrateData(parsedData)
      }

      return parsedData
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
      return this.getDefaultData()
    }
  }

  // Save all data to localStorage
  saveAllData(data: StorageData): void {
    try {
      data.lastBackup = new Date().toISOString()
      data.version = this.VERSION
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving data to localStorage:", error)
      throw new Error("Failed to save data. Storage may be full.")
    }
  }

  // Get specific data type
  getData<T>(key: keyof StorageData): T {
    const allData = this.getAllData()
    return allData[key] as T
  }

  // Save specific data type
  saveData<T>(key: keyof StorageData, data: T): void {
    const allData = this.getAllData()
    allData[key] = data as any
    this.saveAllData(allData)
  }

  // Create backup
  createBackup(): string {
    try {
      const data = this.getAllData()
      const backup = JSON.stringify(data)
      localStorage.setItem(this.BACKUP_KEY, backup)
      return backup
    } catch (error) {
      console.error("Error creating backup:", error)
      throw new Error("Failed to create backup")
    }
  }

  // Restore from backup
  restoreFromBackup(backupData?: string): boolean {
    try {
      const backup = backupData || localStorage.getItem(this.BACKUP_KEY)
      if (!backup) {
        throw new Error("No backup data found")
      }

      const data = JSON.parse(backup)
      this.validateData(data)
      this.saveAllData(data)
      return true
    } catch (error) {
      console.error("Error restoring from backup:", error)
      return false
    }
  }

  // Export data as JSON
  exportData(): string {
    const data = this.getAllData()
    return JSON.stringify(data, null, 2)
  }

  // Import data from JSON
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      this.validateData(data)
      this.saveAllData(data)
      return true
    } catch (error) {
      console.error("Error importing data:", error)
      return false
    }
  }

  // Clear all data
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.BACKUP_KEY)
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const data = this.getAllData()
      const dataSize = JSON.stringify(data).length
      const maxSize = 5 * 1024 * 1024 // 5MB typical localStorage limit

      return {
        used: dataSize,
        available: maxSize - dataSize,
        percentage: (dataSize / maxSize) * 100,
      }
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 }
    }
  }

  // Validate data structure
  private validateData(data: any): void {
    const requiredKeys = ["products", "customers", "transactions", "settings"]
    for (const key of requiredKeys) {
      if (!(key in data)) {
        throw new Error(`Invalid data structure: missing ${key}`)
      }
    }
  }

  // Migrate data between versions
  private migrateData(oldData: any): StorageData {
    const newData = this.getDefaultData()

    // Copy existing data
    if (oldData.products) newData.products = oldData.products
    if (oldData.customers) newData.customers = oldData.customers
    if (oldData.transactions) newData.transactions = oldData.transactions
    if (oldData.settings) newData.settings = { ...newData.settings, ...oldData.settings }
    if (oldData.users) newData.users = oldData.users

    // Save migrated data
    this.saveAllData(newData)
    return newData
  }

  // Check if offline mode is supported
  isOfflineSupported(): boolean {
    return "localStorage" in window && "serviceWorker" in navigator
  }

  // Sync data (placeholder for future server sync)
  async syncData(): Promise<boolean> {
    // This would sync with a server in a real implementation
    console.log("Data sync not implemented - running in offline mode")
    return true
  }
}

export const posStorage = new POSStorage()
