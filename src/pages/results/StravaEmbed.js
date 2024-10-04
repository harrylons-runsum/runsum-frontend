import React, { Component } from 'react';

class StravaEmbed extends Component {
    componentDidMount() {
        // Dynamically create a script element to load the Strava embed script
        const script = document.createElement("script");
        script.src = "https://strava-embeds.com/embed.js";
        script.async = true;
        this.divRef.appendChild(script);
    }

    render() {
        return (
            <div className='embed-container'
            style={{ width: '350px', height: 'auto' }}>
                {/* Create a placeholder for the Strava embed and reference it */}
                <div
                    ref={(el) => (this.divRef = el)}
                    className="strava-embed-placeholder"
                    data-embed-type="activity"
                    data-embed-id={this.props.embed}
                    data-style="standard"
                ></div>
            </div>
        );
    }
}

export default StravaEmbed;
