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

    async getToken(codeValue) {
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
                console.log('Token exchange successful:', data);
                return data;
            })
            .catch(error => {
                // Handle errors
                console.error('Error during token exchange:', error);
            });
    }

    async componentDidMount() {
        try {
            // Check if we already have a token for this user
            let token = localStorage.getItem("accessToken");
            console.log("token:", token);
            if (!token) {
                console.log("No token found. Checking params.");
                const searchParams = new URLSearchParams(window.location.search);
                if (searchParams.has('code')) {
                    const codeValue = searchParams.get('code');
                    console.log('Code:', codeValue);

                    this.getToken(codeValue).then(data => {
                        if (data) {
                            localStorage.setItem("accessToken", data.access_token);
                            localStorage.setItem("refreshToken", data.refresh_token);
                            // localStorage.setItem("id",data.id);
                            console.log('Token saved:', data.access_token);
                        } else {
                            console.error('Failed to get token');
                        }
                    });
                }
                else {
                    // if no token and no code, redirect user back to login page. 
                    window.location.href = '/needlogin';
                }
            }
            this.setState({ data: { message: 'Data loaded' } });
        } catch (error) {
            console.error('Error generating client:', error);
            window.location('/');
        } finally {
            this.setState({ loading: false });
        }
    }

    handleContinue = () => {
        if (!(this.state.startDate && this.state.endDate)) {
            this.state.enterBothWarning = true;
        }
        else {
            // continue to the results
        }
    };

    handleLogout = () => {
        const { logout } = this.props;
        if (logout) {
            logout(); // Call the passed logout function
        }
    };



    render() {
        const { loading, data, startDate, endDate } = this.state;

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
                        <Button className='logout' onClick={this.handleContinue}>Continue</Button>
                        <Button className='logout' onClick={this.handleLogout}>Log out</Button>
                    </div>
                )}
            </div>
        );
    }
}

export default Landing;
