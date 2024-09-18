
import Button from '@mui/material/Button';
import StravaButtonIcon from './std/StravaButtonIcon.svg';
import { Link } from 'react-router-dom';

function Home(props) {
    const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
    const CALLBACK_DOMAIN = process.env.REACT_APP_CALLBACK_DOMAIN;
    if (!CLIENT_ID || !CALLBACK_DOMAIN) {
        console.log("Missing or misconfigured .env file!");
    }
    let to = "https://www.strava.com/oauth/authorize?client_id=" + CLIENT_ID + "&redirect_uri=" + CALLBACK_DOMAIN + "/landing&response_type=code&scope=activity:read_all";
    console.log(to);



    return (
        <div className='home-page'>
            { }
            <Button component={Link} to={to}>
                <img src={StravaButtonIcon} alt="Connect with Strava" />
            </Button>
            <a href='/about'>What is this?</a>
        </div>
    );
}

export default Home;
