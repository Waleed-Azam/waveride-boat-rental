"use client"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts"

const COLORS = ["#2563eb", "#06b6d4", "#8b5cf6", "#f59e0b", "#10b981"]

export function AnalyticsCharts({ locationData, typeData }: {
  locationData: { name: string; value: number }[]
  typeData: { name: string; value: number }[]
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Bookings by Destination</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <BarChart data={locationData} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" fontSize={12} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Bookings by Boat Type</CardTitle></CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// Need card imports:
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
