

function About(props) {
    return (
        <div className='about-page'>
            <div className='about-header'>
                About
            </div>
            <div className='about-break' />
            <div className='about-description'>
                Created by <a href='https://harrylons.com' target='_blank' rel='noreferrer'>Harry Lonsdale</a> and powered by Strava,
                RunSum is a site designed to provide retrospective training insights for endurance athletes.
            </div>
            <div className='about-description'>
                Inspired by <a href='https://www.spotify.com/us/wrapped/' target='_blank' rel='noreferrer'>Spotify Wrapped</a> and similar
                products, RunSum allows Strava users to sign in with their Strava accounts, define a time range they're interested in, and
                attain some summary statistics and metrics on their workouts during that period.
            </div>
            <div className='about-description'>
                Check out the <a href='https://www.youtube.com' target='_blank' rel='noreferrer'>Demo Video</a> on YouTube
                or <a href='/'>try RunSum for yourself!</a>
            </div>
        </div>
    );
}

export default About;