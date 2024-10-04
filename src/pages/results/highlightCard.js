import React, { Component } from 'react';
import { Grid2, Card, CardContent, Typography } from '@mui/material';
import StravaEmbed from './StravaEmbed';

class HighlightCard extends Component {
    render() {
        const commonCardSX = {
            backgroundColor: '#2a3e5d',
            border: '1px solid',
            borderColor: '#4a6a86',
            borderRadius: 4,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            width: '100%', 
            maxWidth:'100vw',
            margin: '16px auto', // Added margin for vertical spacing and center alignment
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            textAlign: 'left', // Left-align text inside the card
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(100, 95, 228, 0.4)'
            },
        };

        const typographyStyles = {
            highlight: { fontSize: '2.0rem', fontWeight: 700, marginBottom: 1 },
            mainTitle: { fontSize: '1.8rem', fontWeight: 700, marginBottom: 1 },
            subText: { fontSize: '1rem', color: '#b0b8c0', marginBottom: '0.25rem' },
            dataText: { fontSize: '1rem', color: '#e0e7ed' },
        };

        const { highlightName, data } = this.props;
        return (
            <Grid2 item xs={12} sm={12} md={12} lg={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card sx={commonCardSX}>
                    <CardContent>
                        <div className='highlight-container' >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography sx={typographyStyles.highlight} fontFamily="'Poppins', sans-serif" color="#ffffff">
                                    {highlightName}
                                </Typography>
                                <Typography sx={typographyStyles.subText}>{data['Date']}</Typography>
                                <Typography sx={typographyStyles.mainTitle} color="#ffffff">{data['Name']}</Typography>
                                <Typography sx={typographyStyles.dataText}>Distance: {data['Distance']}</Typography>
                                <Typography sx={typographyStyles.dataText}>Pace (min/mi): {data['Pace']}</Typography>
                                <Typography sx={typographyStyles.dataText}>Moving Time: {data['Moving Time']}</Typography>
                                <Typography sx={typographyStyles.dataText}>Achievement Count: {data['Achievement Count']}</Typography>
                                {(this.props.sport == 'allSports') ?
                                    <Typography sx={typographyStyles.dataText}>Sport: {data['Sport']}</Typography>
                                    : null
                                }
                                <Typography sx={typographyStyles.dataText}>View on Strava:
                                    <a style={{ color: '#FC4C02' }} target='_blank' rel='noreferrer' href={`https://strava.com/activities/${data['id']}`}>
                                        {`https://strava.com/activities/${data['id']}`}
                                    </a>
                                </Typography>
                            </div>
                            <StravaEmbed embed={data['id']} />
                        </div>
                    </CardContent>
                </Card>
            </Grid2>
        );
    }
}

export default HighlightCard;
