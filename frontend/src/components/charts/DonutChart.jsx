import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts'
import { motion } from 'framer-motion'

const DonutChart = ({ data, title }) => {
  const COLORS = ['#36D399', '#F87272', '#FBBD23', '#3ABFF8']

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
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#1a1a2e', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default DonutChart
