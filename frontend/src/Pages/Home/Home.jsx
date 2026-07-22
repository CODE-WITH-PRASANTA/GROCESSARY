import React from 'react'
import HeroSection from '../../Components/HeroSection/HeroSection'
import HomeCategories from '../../Components/HomeCategories/HomeCategories'
import HomeDailyDiscounts from '../../Components/HomeDailyDiscounts/HomeDailyDiscounts'
import HomeTodayDiscounts from '../../Components/HomeTodayDiscounts/HomeTodayDiscounts'

const Home = () => {
  return (
    <div>
      <HeroSection/>
      <HomeCategories/>
      <HomeDailyDiscounts/>
      <HomeTodayDiscounts/>
      
    </div>
  )
}
 
export default Home