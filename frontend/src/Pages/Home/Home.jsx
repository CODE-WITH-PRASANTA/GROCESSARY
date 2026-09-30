import React from 'react'
import HeroSection from '../../Components/HeroSection/HeroSection'
import HomeCategories from '../../Components/HomeCategories/HomeCategories'
import HomeDailyDiscounts from '../../Components/HomeDailyDiscounts/HomeDailyDiscounts'
import HomeTodayDiscounts from '../../Components/HomeTodayDiscounts/HomeTodayDiscounts'
import OurBestsellers from '../../Components/OurBestsellers/OurBestsellers'
import FreashItem from '../../Components/FreashItem/FreashItem'
import Testimonial from '../../Components/Testimonial/Testimonial'
import Blog from '../../Components/BlogGrid/BlogGrid'

import NourishSection from '../../Components/NourishSection/NourishSection'
import MobileSection from '../../Components/MobileSection/MobileSection'
import PopularProducts from '../../Components/PopularProducts/PopularProducts'

const Home = () => {
  return (
    <div>
      <MobileSection />
      <PopularProducts />
      <HomeTodayDiscounts/>
      
      <OurBestsellers />
      <NourishSection />
     
      <Blog />
    </div>
  )
}
 
export default Home