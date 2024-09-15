import React, { Component } from 'react';
import { ClipLoader } from 'react-spinners'; // Import the spinner from the library
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { styled } from '@mui/material/styles';


class Results extends Component {
    state = {
        loading: true,
        currentTab: 0,
    };

    async componentDidMount() {
        this.setState({ loading: false });
    }

    handleLogout = () => {
        const { logout } = this.props;
        if (logout) {
            logout(); // Call the passed logout function
        }
    };

    handleTabChange = (event, newValue) => {
        this.setState({ currentTab: newValue });
    };

    handleNewTimeRange = () => {
        localStorage.removeItem('startDate');
        localStorage.removeItem('endDate');
        window.location.href = '/landing';
    };
    StyledTabs = styled((props) => (
        <Tabs
            {...props}
            TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
        />
    ))({
        '& .MuiTabs-indicator': {
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: 'transparent',
        },
        '& .MuiTabs-indicatorSpan': {
            maxWidth: 40,
            width: '100%',
            backgroundColor: '#635ee7',
        },
    });

    StyledTab = styled((props) => <Tab disableRipple {...props} />)(
        ({ theme }) => ({
            textTransform: 'none',
            fontWeight: theme.typography.fontWeightRegular,
            fontSize: theme.typography.pxToRem(15),
            marginRight: theme.spacing(1),
            color: 'rgba(255, 255, 255, 0.7)',
            '&.Mui-selected': {
                color: '#fff',
            },
            '&.Mui-focusVisible': {
                backgroundColor: 'rgba(100, 95, 228, 0.32)',
            },
        }),
    );

    render() {
        const { loading, currentTab } = this.state;
        
        return (
            <div className="results-page">
                {loading ? (
                    <div className="spinner-container">
                        <ClipLoader color="#3498db" loading={loading} size={60} />
                        <p>Loading your activities. This may take a minute if you selected a large time range.</p>
                    </div>
                ) : (
                    <div className='content-container'>
                        <this.StyledTabs value={currentTab} onChange={this.handleTabChange} textColor="secondary" centered>
                            <this.StyledTab label="All Sports" />
                            <this.StyledTab label="Run" />
                            <this.StyledTab label="Bike" />
                            <this.StyledTab label="Swim" />
                        </this.StyledTabs>
                        <div className='buttons-container'>
                            <Button className='actionButtons' onClick={this.handleNewTimeRange}>New Time Range</Button>
                            <Button className='actionButtons' onClick={this.handleLogout}>Log out</Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default Results;