'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { Chart } from '@/components/Chart'
import { Table } from '@/components/Table'
import { Modal } from '@/components/Modal'
import { Input, Textarea, Select } from '@/components/Form'
import { Button } from '@/components/Button'
import { useToast } from '@/context/ToastContext'
import { itemAPI } from '@/lib/api'
import { TrendingUp, Users, DollarSign, Activity, Plus, Edit, Trash2 } from 'lucide-react'

export default function DashboardPage() {
  const [items, setItems] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({ title: '', description: '', status: 'active' })
  const { addToast } = useToast()

  const analyticsData = [
    { icon: TrendingUp, label: 'Total Revenue', value: '$45,231', change: '+20.1%', color: 'text-green-600' },
    { icon: Users, label: 'Active Users', value: '2,345', change: '+12.5%', color: 'text-blue-600' },
    { icon: DollarSign, label: 'Sales', value: '1,234', change: '+8.2%', color: 'text-purple-600' },
    { icon: Activity, label: 'Conversion', value: '3.2%', change: '+2.1%', color: 'text-orange-600' },
  ]

  const chartData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
  ]

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const { data } = await itemAPI.getAll()
      setItems(data.items)
    } catch (error) {
      addToast('Failed to fetch items', 'error')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await itemAPI.update(editingItem.id, formData)
        addToast('Item updated successfully', 'success')
      } else {
        await itemAPI.create(formData)
        addToast('Item created successfully', 'success')
      }
      setIsModalOpen(false)
      setFormData({ title: '', description: '', status: 'active' })
      setEditingItem(null)
      fetchItems()
    } catch (error) {
      addToast('Operation failed', 'error')
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({ title: item.title, description: item.description, status: item.status })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await itemAPI.delete(id)
      addToast('Item deleted successfully', 'success')
      fetchItems()
    } catch (error) {
      addToast('Delete failed', 'error')
    }
  }

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'description', label: 'Description', sortable: false },
    { key: 'status', label: 'Status', sortable: true, render: (row: any) => (
      <span className={`px-2 py-1 rounded text-xs ${row.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        {row.status}
      </span>
    )},
    { key: 'actions', label: 'Actions', sortable: false, render: (row: any) => (
      <div className="flex gap-2">
        <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          <Edit size={18} />
        </button>
        <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
          <Trash2 size={18} />
        </button>
      </div>
    )},
  ]

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto animate-fade-in">
          <div className="flex justify-between items-center mb-6 animate-slide-down">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button onClick={() => { setIsModalOpen(true); setEditingItem(null); setFormData({ title: '', description: '', status: 'active' }); }}>
              <Plus size={20} className="inline mr-2" />
              Add Item
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {analyticsData.map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="animate-slide-up" style={{animationDelay: `${idx * 0.1}s`}}>
                  <Card>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
                        <p className="text-2xl font-bold mt-1">{item.value}</p>
                        <p className={`text-sm mt-1 ${item.color}`}>{item.change}</p>
                      </div>
                      <Icon size={40} className="text-gray-400 dark:text-gray-500" />
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="animate-slide-right" style={{animationDelay: '0.4s'}}>
              <Card title="Revenue Overview">
                <Chart data={chartData} dataKey="value" type="line" />
              </Card>
            </div>
            <div className="animate-slide-left" style={{animationDelay: '0.4s'}}>
              <Card title="Sales Statistics">
                <Chart data={chartData} dataKey="value" type="bar" color="#8b5cf6" />
              </Card>
            </div>
          </div>

          <div className="animate-slide-up" style={{animationDelay: '0.5s'}}>
            <Card title="Items Management">
              <Table columns={columns} data={items} />
            </Card>
          </div>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Item' : 'Add New Item'}>
            <form onSubmit={handleSubmit}>
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
              <div className="flex gap-2 mt-4">
                <Button type="submit" className="flex-1">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
