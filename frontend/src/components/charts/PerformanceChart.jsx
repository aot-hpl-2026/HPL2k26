import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts'
import { motion } from 'framer-motion'

const PerformanceChart = ({ data, title, dataKey = 'value', nameKey = 'name' }) => {
  const colors = ['#8B1538', '#D4AF37', '#1B1F3B', '#CD7F32', '#4169E1', '#800020']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-base-100 rounded-xl border border-base-200 p-4"
    >
      {title && (
        <h3 className="font-epic font-semibold text-lg mb-4 text-base-content">{title}</h3>
      )}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis type="category" dataKey={nameKey} tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a2e', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey={dataKey} radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default PerformanceChart
