import React from 'react'
import HeroSection from '../../Components/HeroSection/HeroSection'
import HomeCategories from '../../Components/HomeCategories/HomeCategories'
import HomeDailyDiscounts from '../../Components/HomeDailyDiscounts/HomeDailyDiscounts'
import HomeTodayDiscounts from '../../Components/HomeTodayDiscounts/HomeTodayDiscounts'
import OurBestsellers from '../../Components/OurBestsellers/OurBestsellers'
import NourishSection from '../../Components/NourishSection/NourishSection'

const Home = () => {
  return (
    <div>
      <HeroSection/>
      <HomeCategories/>
      <HomeDailyDiscounts/>
      <HomeTodayDiscounts/>
      
      <OurBestsellers />
      <NourishSection/>
    </div>
  )
}
 
export default Home