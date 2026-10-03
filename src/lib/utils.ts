import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatPrice(price: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price)
}

export function calculateDays(start: Date | string, end: Date | string): number {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diff = endDate.getTime() - startDate.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getBoatTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    yacht: "Motor Yacht",
    sailboat: "Sailboat",
    motorboat: "Motorboat",
    catamaran: "Catamaran",
    rib: "RIB",
  }
  return labels[type] || type
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    maintenance: "bg-yellow-100 text-yellow-800",
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    refunded: "bg-purple-100 text-purple-800",
    failed: "bg-red-100 text-red-800",
    synced: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
    available: "bg-green-50 text-green-700 border-green-200",
    booked: "bg-red-50 text-red-700 border-red-200",
    blocked: "bg-gray-100 text-gray-700 border-gray-200",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}
