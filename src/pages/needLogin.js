import Button from '@mui/material/Button';
import React, { Component } from 'react';

class About extends Component {

    handleLoginClick = () => {
        window.location.href = '/';
    }

    render() {
        return (
            <div className='about-page' style={{ justifyContent: 'center' }}>
                <div className='about-header'>
                    Please Log Back in
                </div>
                <div className='about-break' />
                <div className='about-description'>
                    <p>You need to log back in before viewing this page! </p> 
                    <p>If you keep seeing this page and think you shouldn't, reach out to us.</p>
                </div>
                <Button className='login' onClick={this.handleLoginClick}>Go back to login</Button>

            </div>
        );
    }
}

export default About;