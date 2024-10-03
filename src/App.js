import React, { Component } from 'react';
import './App.scss';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Footer from './pages/std/footer';
import Landing from './pages/Landing';
import NeedLogin from './pages/needLogin';
import Results from './pages/Results';

class App extends Component {
  state = {
    accessToken : "",
  };
  setAccessToken = (newToken) => {
    console.log("setting access token");
    this.setState({ accessToken: newToken });
  };
  getAccessToken = () => {
    return this.state.accessToken;
  }
  // Method for handling logout
  logout = () => {
    console.log('logging out');
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("startDate");
    localStorage.removeItem("endDate");
    window.location.href = '/';
  };

  render() {
    const { accessToken } = this.state;
    return (
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/landing"
            element={<Landing logout={this.logout} setAccessToken={this.setAccessToken} getAccessToken={this.getAccessToken}/>}
          />
          <Route path="/needlogin" element={<NeedLogin />} />
          <Route
            path="/results"
            element={<Results logout={this.logout} getAccessToken={this.getAccessToken}/>}
          />
        </Routes>
        <Footer /> {/* Place Footer outside of Routes to appear on every page */}
      </div>
    );
  }
}

export default App;
