import React, { Component } from 'react';
import Button from '@mui/material/Button';
import { ClipLoader } from 'react-spinners'; // Import the spinner from the library
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Navigate } from 'react-router-dom';

class Landing extends Component {
    state = {
        loading: true,
        startDate: null,
        data: null,
        endDate: null,
        enterBothWarning: false,
        dateOrderWarning: false,
        redirectToResults: false,
        redirectToNeedLogin: false,
    };
    async setStartDate(date) {
        await this.setState({
            startDate: date
        });
    }
    async setEndDate(date) {
        // Switch endDate from start of selected day to end of selected day
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        await this.setState({
            endDate: endOfDay
        });
    }


    async getTokenFromCode(codeValue) {
        let payload = {
            code: codeValue,
        }
        let endpointURL = process.env.REACT_APP_BACKEND_URL + '/get-token';
        return fetch(endpointURL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            credentials: 'include' // include cookie

        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Parse response body as JSON
            })
            .then(data => {
                // Handle successful response data
                return data;
            })
            .catch(error => {
                // Handle errors
                console.error('Error during token exchange:', error);
            });
    }

    async updateToken() {
        let payload = {}
        let endpointURL = process.env.REACT_APP_BACKEND_URL + '/refresh-token';
        return fetch(endpointURL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            credentials: 'include' // include cookie
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Parse response body as JSON
            })
            .then(data => {
                // Handle successful response data
                return data;
            })
            .catch(error => {
                // Handle errors
                console.error('Error during getting new token:', error);
            });

    }

    async componentDidMount() {
        console.log('requesting from ', process.env.REACT_APP_BACKEND_URL);
        try {
            const searchParams = new URLSearchParams(window.location.search);

            if (searchParams.has('code')) {
                const data = await this.getTokenFromCode(searchParams.get('code'));
                if (data && data['access_token']) {
                    // successful code for token exchange
                    this.props.setAccessToken(data['access_token']);
                } else {
                    console.error('No token in response');
                    // Code failed. try to update token from existing
                    const tokenRefreshResult = await this.updateToken();
                    if (!(tokenRefreshResult && tokenRefreshResult['access_token'])) {
                        console.error("token for token unsuccessful. redirecting to needlogin");
                        this.setState({ redirectToNeedLogin: true });
                    }
                    else {
                        console.log("token for token successful");
                        this.props.setAccessToken(tokenRefreshResult['access_token']);
                    }
                }
            } else {
                // handle no code case. try to update token from existing
                const tokenRefreshResult = await this.updateToken();
                if (!(tokenRefreshResult && tokenRefreshResult['access_token'])) {
                    console.error("token for token unsuccessful. redirecting to needlogin");
                    this.setState({ redirectToNeedLogin: true });
                }
                else {
                    console.log("token for token successful");
                    this.props.setAccessToken(tokenRefreshResult['access_token']);
                }
            }
        } catch (error) {
            console.error('Error generating client:', error);
        } finally {
            this.setState({ loading: false });
        }
    }


    handleContinue = () => {
        if (!(this.state.startDate && this.state.endDate)) {
            this.setState({ enterBothWarning: true });
            console.log('WARNING: enter both dates');
        }
        else {
            if (this.state.startDate >= this.state.endDate) {
                this.setState({ enterBothWarning: false });
                this.setState({ dateOrderWarning: true });
                console.log('WARNING: wrong date order');
            }
            else {
                console.log('both entered');
                localStorage.setItem('startDate', this.state.startDate);
                localStorage.setItem('endDate', this.state.endDate);
                this.setState({ redirectToResults: true });
            }
        }
    };

    handleLogout = () => {
        const { logout } = this.props;
        if (logout) {
            logout(); // Call the passed logout function
        }
    };

    render() {
        if (this.state.redirectToResults) {
            // update access token again
            try {
                this.updateToken();
            }
            catch (e) {
                console.error('Couldn\'t refresh token on render. redirecting');
                this.setState({ redirectToNeedLogin: true });
            }
            return <Navigate to="/results" />;
        }
        else if (this.state.redirectToNeedLogin) {
            return <Navigate to="/needlogin" />;
        }
        const { loading, data, startDate, endDate, enterBothWarning, dateOrderWarning } = this.state;

        return (

            <div className="landing-page">
                {loading ? (
                    <div className="spinner-container">
                        <ClipLoader color="#3498db" loading={loading} size={60} />
                        <p style={{color:'#ffffff'}}>Validating login...</p>
                    </div>
                ) : (
                    <div className='picker-container'>
                        <p>Choose dates to calculate summary statistics. </p>
                        <p>Enter as MM/DD/YYYY or select from the pickers</p>
                        <p style={{ marginBottom: 5 }}>Start Date:</p>
                        <DatePicker placeholderText='MM/DD/YYYY' selected={startDate} onChange={(date) => this.setStartDate(date)} value={startDate} selectsStart startDate={startDate} endDate={endDate} maxDate={new Date()} />
                        {startDate &&
                            (
                                <div>
                                    <p style={{ marginBottom: 5 }}>End Date:</p>
                                    <DatePicker placeholderText='MM/DD/YYYY' selected={endDate} onChange={(date) => this.setEndDate(date)} value={endDate} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} maxDate={new Date()} />
                                </div>
                            )
                        }
                        {enterBothWarning && (
                            <div style={{ color: '#B3BAA0' }}><p>Enter both start and end dates</p></div>
                        )}
                        {dateOrderWarning && (
                            <div style={{ color: '#B3BAA0' }}><p>End date must be at least 1 day after start date</p></div>
                        )}
                        {(startDate && endDate) &&
                            (
                                <Button className='logout' onClick={this.handleContinue}>Continue</Button>
                            )
                        }
                        <Button className='logout' onClick={this.handleLogout}>Log out</Button>
                    </div>
                )}
            </div>
        );
    }
}

export default Landing;
