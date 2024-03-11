import React from 'react';
import '../styles/Home.css'; // Make sure to create this CSS module
import Poster from "../images/FYDP_Poster.png"

const Home = () => {
  return (
    <div className='panel'>
      <img src={Poster} alt="" style={{height: "calc(100vh - 56px)"}}></img>
    </div>
  );
};

export default Home;