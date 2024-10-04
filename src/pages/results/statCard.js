import React, { Component } from 'react';
import { Grid2, Card, CardContent, Typography } from '@mui/material';


class StatCard extends Component {

    render() {
        const commonCardSX = {
            minWidth: 300,
            backgroundColor: '#1c2b48',
            border: '1px solid',
            borderColor: '#648c94',
            borderRadius: 3 ,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 12px rgba(100, 95, 228, 0.3)',
            },
        }
        const statName = this.props.statName;
        const statData = this.props.statData;
        return (
            <Grid2 item xs={12} sm={6} md={4}>
                <Card sx={commonCardSX}>
                    <CardContent>
                        <Typography variant="h3" fontFamily="'Poppins', sans-serif" color="#b0b8c0">{statData}</Typography>
                        <Typography variant="body2" color="#ffffff">{statName}</Typography>
                    </CardContent>
                </Card>
            </Grid2>
        )
    }
}

export default StatCard