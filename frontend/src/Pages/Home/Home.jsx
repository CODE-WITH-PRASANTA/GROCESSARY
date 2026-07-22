import React from 'react'
import OurBestsellers from '../../Components/OurBestsellers/OurBestsellers'
import FreashItem from '../../Components/FreashItem/FreashItem'
import Testimonial from '../../Components/Testimonial/Testimonial'
import Blog from '../../Components/Blog/Blog'
import NourishSection from '../../Components/NourishSection/NourishSection'

const Home = () => {
  return (
    <div>
      <OurBestsellers />
      <NourishSection />
      <FreashItem />
      <Testimonial />
      <Blog />
     
    </div>
  )
}

export default Home