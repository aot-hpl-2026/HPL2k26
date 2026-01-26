// Animated counter hook
import { useState, useEffect, useRef } from 'react'

export const useCountUp = (end, duration = 1500, start = 0) => {
  const [count, setCount] = useState(start)
  const countRef = useRef(start)
  const frameRef = useRef()

  useEffect(() => {
    const startTime = Date.now()
    const startValue = countRef.current
    const difference = end - startValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease out quad
      const easeProgress = 1 - (1 - progress) * (1 - progress)
      
      const currentValue = startValue + difference * easeProgress
      countRef.current = currentValue
      setCount(Math.round(currentValue))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [end, duration])

  return count
}

export default useCountUp
