import './App.scss';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Footer from './pages/std/footer';
import Landing from './pages/Landing';
import NeedLogin from './pages/needLogin';

function logout(){
  console.log('logging out');
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = '/';
}
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/landing" element={<Landing 
            logout={logout}/>}
         />
         <Route path="/needlogin" element={<NeedLogin/>} />
      </Routes>
      <Footer />  {/* Place Footer outside of Routes to appear on every page */}
    </div>
  );
}

export default App;
