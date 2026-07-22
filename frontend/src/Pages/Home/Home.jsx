import React from 'react'
import OurBestsellers from '../../Components/OurBestsellers/OurBestsellers'
import FreashItem from '../../Components/FreashItem/FreashItem'
import Testimonial from '../../Components/Testimonial/Testimonial'
import Blog from '../../Components/Blog/Blog'

const Home = () => {
  return (
    <div>
      <OurBestsellers />
      <FreashItem />
      <Testimonial />
      <Blog />
    </div>
  )
}

export default Home