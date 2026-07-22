import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import Home from "./Pages/Home/Home";



const App = () => {
  return (
    <BrowserRouter>
     <Navbar />

      <Routes>

       <Route path="/" element={<Home />} />
       
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;