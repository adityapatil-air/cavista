'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartProps {
  data: any[]
  type?: 'line' | 'bar'
  dataKey: string
  xKey?: string
  color?: string
}

export const Chart = ({ data, type = 'line', dataKey, xKey = 'name', color = '#3b82f6' }: ChartProps) => {
  const ChartComponent = type === 'bar' ? BarChart : LineChart
  const DataComponent = type === 'bar' ? Bar : Line

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <DataComponent type="monotone" dataKey={dataKey} stroke={color} fill={color} />
      </ChartComponent>
    </ResponsiveContainer>
  )
}
