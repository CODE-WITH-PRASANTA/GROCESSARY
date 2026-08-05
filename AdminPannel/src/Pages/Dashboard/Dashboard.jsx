import React from 'react'
import Overview from '../../Components/Overview/Overview'
import Sales from '../../Components/Sales/Sales'
import TopProducts from '../../Components/TopProducts/TopProducts'
import SalesPerformance from '../../Components/SalesPerformance/SalesPerformance'

const Dashboard = () => {
  return (
    <div>
      
      <Overview/>
      <Sales/>
      <TopProducts/>
      <SalesPerformance/>
    </div>
  )
}

export default Dashboard