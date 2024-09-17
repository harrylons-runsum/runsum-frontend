import React, { Component } from 'react';
import { Grid2 } from '@mui/material';
import StatCard from './statCard';

class AllSportsResults extends Component {
    render() {
        const { data } = this.props;
        if (!data) {
            return (
                <p color="#FFFFFF">No Data. Please try logging back in</p>
            )
        }
        return (
            <div className='stats-container'>
                <div className='section-header'>
                    Summary Stats
                </div>
                <div className='section-break' />
                <Grid2 container spacing={3} justifyContent="center" sx={{ ml: 10, mr: 10 }}>
                    {Object.entries(data).map(([key, value]) => (
                        <StatCard
                            key={key} // Unique key for each card
                            statName={key}
                            statData={value}
                        />
                    ))}
                </Grid2>
                <div className='section-header'>
                    Highlights
                </div>
                <div className='section-break' />
            </div>
        )
    }
}

export default AllSportsResults;
