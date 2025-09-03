"use client"

import { useState, useEffect, useCallback } from "react"
import { posStorage } from "@/lib/storage"

interface UsePOSDataReturn<T> {
  data: T
  loading: boolean
  error: string | null
  updateData: (newData: T) => void
  refreshData: () => void
}

export function usePOSData<T>(key: keyof any): UsePOSDataReturn<T> {
  const [data, setData] = useState<T>({} as T)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(() => {
    try {
      setLoading(true)
      setError(null)
      const loadedData = posStorage.getData<T>(key)
      setData(loadedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [key])

  const updateData = useCallback(
    (newData: T) => {
      try {
        setError(null)
        posStorage.saveData(key, newData)
        setData(newData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save data")
      }
    },
    [key],
  )

  const refreshData = useCallback(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    loading,
    error,
    updateData,
    refreshData,
  }
}

// Specific hooks for different data types
export function useProducts() {
  return usePOSData<any[]>("products")
}

export function useCustomers() {
  return usePOSData<any[]>("customers")
}

export function useTransactions() {
  return usePOSData<any[]>("transactions")
}

export function useSettings() {
  return usePOSData<any>("settings")
}
