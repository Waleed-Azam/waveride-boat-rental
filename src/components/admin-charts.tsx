"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts"
import { format, subMonths, startOfMonth, isSameMonth } from "date-fns"

export function AdminCharts({ data }: { data: { createdAt: Date; totalPrice: number; status: string }[] }) {
  const months = Array.from({ length: 6 }, (_, i) => subMonths(startOfMonth(new Date()), 5 - i))
  const chartData = months.map((m) => {
    const items = data.filter((d) => isSameMonth(new Date(d.createdAt), m))
    return {
      name: format(m, "MMM"),
      bookings: items.length,
      revenue: items.filter((i) => i.status !== "cancelled").reduce((sum, i) => sum + i.totalPrice, 0),
    }
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis yAxisId="left" fontSize={12} />
        <YAxis yAxisId="right" orientation="right" fontSize={12} />
        <Tooltip />
        <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#2563eb" strokeWidth={2} name="Bookings" />
        <Bar yAxisId="right" dataKey="revenue" fill="#06b6d4" name="Revenue (€)" radius={[4,4,0,0]} />
      </LineChart>
    </ResponsiveContainer>
  )
}
