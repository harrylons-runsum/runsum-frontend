import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import OneFAQ from './std/oneFAQ.js';

function FAQ(props) {
    return (
        <div className='about-page'>
            <div className='about-header'>
                FAQ
            </div>
            <div className='about-break' />
            <div className='about-description'>
                Click an FAQ below to see the explanation
            </div>
            <OneFAQ
                question="What is RunSum?"
                answer="See the about page: "
                link="/about"
            />
            <OneFAQ
                question="How is the site built?"
                answer="RunSum is running on a Raspberry pi in my bedroom, connected to the internet through cloudflare tunnels.
                The frontend is built in React, and the backend API is written in Python through Flask. Both the frontend and backend
                are open-source and available on GitHub at "
                link="https://github.com/harrylons-runsum"
            />
            <OneFAQ
                question="How does RunSum access my Strava data?"
                answer="Strava supplies an API client for developers to build apps. When you sign in to RunSum with Strava, my site never
                sees your username or password. Instead, Strava's sign-in portal redirects you back to RunSum with a short-lived access code,
                which I can exchange for an access token, which RunSum can then use to fetch your activities and run some calculations on them.
                RunSum never stores your activity data in a persistent form. Check out the detailed documentation on Strava's API at "
                link="https://developers.strava.com"
            />
            <OneFAQ
                question="Are date ranges inclusive or exclusive?"
                answer="Data is acquired from the beginning (00:00:00) of the start date to the end (11:59:59) of the end date, so the dates
                can be considered inclusive."
            />
            <OneFAQ
                question='What is the "Most Strenuous Activity" highlight based on?'
                answer="This is based on strava's relative effort (FKA Suffer Score), which is assigned to any activity with heart rate data. 
                If your activity does not have heart rate data, it could not be in consideration for the 'most strenuous activity', since it
                was not given a relative effort value by Strava. You can read more about how relative effort is calculated at "
                link="https://communityhub.strava.com/t5/strava-insider-journal/using-relative-effort-to-analyze-your-efforts-on-strava/ba-p/7953"
            />
            <OneFAQ
                question='Why does it take so long to fetch the data?'
                answer="RunSum never stores your data persistently. Hence, data is fetched from Strava's API every time you request a new date range. 
                For very large intervals with many activities, it's understandable that the data transfer and calculations may take a minute or two.
                As a benchmark, about 33 activities can be processed per second when using RunSum on my MacBook Pro"
            />
            <Button className='logout' component={Link} to={'/'}>Go back to home</Button>
        </div>
    );
}

export default FAQ;