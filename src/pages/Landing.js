import React, { Component } from 'react';
import Button from '@mui/material/Button';
import { ClipLoader } from 'react-spinners'; // Import the spinner from the library
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class Landing extends Component {
    state = {
        loading: true,
        startDate: null,
        data: null,
        endDate: null,
        enterBothWarning: false,
    };
    async setStartDate(date) {
        await this.setState({
            startDate: date
        });
    }
    async setEndDate(date) {
        await this.setState({
            endDate: date
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
            }
            
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

    updateToken(){
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
                console.log(data);
                // Handle successful response data
                return data;
            })
            .catch(error => {
                // Handle errors
                console.error('Error during getting new token:', error);
            });

    }

    async componentDidMount() {
        try {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.has('code')) {
                const codeValue = searchParams.get('code');
                console.log('Code:', codeValue);

                this.getTokenFromCode(codeValue).then(data => {
                    if (data && data['access_token']) {
                        // change access token
                        this.props.setAccessToken(data['access_token']);
                        console.log(data);
                    } else {
                        console.error('Failed to get token');
                    }
                });
            }
            else {
                // TODO handle no code
                this.updateToken();
            }
        } catch (error) {
            console.error('Error generating client:', error);
            // window.location.href = '/';
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
            console.log('both entered');
            localStorage.setItem('startDate', this.state.startDate);
            localStorage.setItem('endDate', this.state.endDate);
            window.location.href = '/results';
        }
    };

    handleLogout = () => {
        const { logout } = this.props;
        if (logout) {
            logout(); // Call the passed logout function
        }
    };



    render() {
        const { loading, data, startDate, endDate, enterBothWarning } = this.state;

        return (
            <div className="landing-page">
                {loading ? (
                    <div className="spinner-container">
                        <ClipLoader color="#3498db" loading={loading} size={60} />
                        <p>Validating login...</p>
                    </div>
                ) : (
                    <div className='picker-container'>
                        <p>Choose dates to calculate summary statistics. </p>
                        <p>Enter as MM/DD/YYYY or select from the pickers</p>
                        <p style={{ marginBottom: 5 }}>Start Date:</p>
                        <DatePicker placeholderText='MM/DD/YYYY' selected={startDate} onChange={(date) => this.setStartDate(date)} value={startDate} selectsStart startDate={startDate} endDate={endDate} maxDate={new Date()} />
                        <p style={{ marginBottom: 5 }}>End Date:</p>
                        <DatePicker placeholderText='MM/DD/YYYY' selected={endDate} onChange={(date) => this.setEndDate(date)} value={endDate} selectsEnd startDate={startDate} endDate={endDate} maxDate={new Date()} />
                        {enterBothWarning && (
                            <div style={{ color: '#648c94' }}><p>Enter both start and end date</p></div>
                        )}
                        <Button className='logout' onClick={this.handleContinue}>Continue</Button>
                        <Button className='logout' onClick={this.handleLogout}>Log out</Button>
                    </div>
                )}
            </div>
        );
    }
}

export default Landing;
