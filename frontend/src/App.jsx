import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";



const App = () => {
  return (
    <BrowserRouter>
     <Navbar />

      <Routes>
      
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;