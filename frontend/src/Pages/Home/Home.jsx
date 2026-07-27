import React from 'react'
import HeroSection from '../../Components/HeroSection/HeroSection'
import HomeCategories from '../../Components/HomeCategories/HomeCategories'
import HomeDailyDiscounts from '../../Components/HomeDailyDiscounts/HomeDailyDiscounts'
import HomeTodayDiscounts from '../../Components/HomeTodayDiscounts/HomeTodayDiscounts'
import OurBestsellers from '../../Components/OurBestsellers/OurBestsellers'
import FreashItem from '../../Components/FreashItem/FreashItem'
import Testimonial from '../../Components/Testimonial/Testimonial'
import Blog from '../../Components/Blog/Blog'
import NourishSection from '../../Components/NourishSection/NourishSection'
import MobileSection from '../../Components/MobileSection/MobileSection'

const Home = () => {
  return (
    <div>
      <MobileSection />
      <HeroSection/>
      <HomeCategories/>
      <HomeDailyDiscounts/>
      <HomeTodayDiscounts/>
      
      <OurBestsellers />
      <NourishSection />
      <FreashItem />
      <Testimonial />
      <Blog />
     
    </div>
  )
}
 
export default Home