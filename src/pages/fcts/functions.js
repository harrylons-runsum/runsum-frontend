
async function extractAllSportMetrics(activities) {
    const distance = Math.floor(activities.reduce((total, activity) => total + activity.distance, 0) / 1000);
    const heartRates = activities.filter(activity => activity.has_heartrate).map(activity => activity.average_heartrate);
    var avgHR = 0;
    if (heartRates.length !== 0) { 
        const totalHeartRate = heartRates.reduce((total, rate) => total + rate, 0);
        avgHR = Math.floor(totalHeartRate / heartRates.length);
    }
    const timeSpent = Math.floor(activities.reduce((total, activity) => total + (activity.moving_time / 60), 0));
    const elev = Math.floor(activities.reduce((total, activity) => total + activity.total_elevation_gain, 0));
    const activeDays = new Set();
    activities.forEach(activity => {
        // Extract the date portion from the start_date (YYYY-MM-DD)
        const date = new Date(activity.start_date).toISOString().split('T')[0];
        activeDays.add(date);
    });
    const allSports = {
        'Activities': activities.length,
        'Kilometers': distance,
        'Average Heart Rate': avgHR,
        'Minutes': timeSpent,
        'Elevation': elev,
        'Active Days': activeDays.size,
    };
    return allSports;
}
async function extractRunMetrics() {

}
async function extractBikeMetrics() {

}



export async function getAllInfo(accessToken) {
    let allActivities = [];
    try {
        console.log("in getAllInfo. AccessToken: ", accessToken);
        const startDate = localStorage.getItem('startDate');
        const endDate = localStorage.getItem('endDate');
        if (!startDate || !endDate) {
            throw new Error("Missing a date");
        }
        const startDateConverted = new Date(startDate);
        const endDateConverted = new Date(endDate);
        const sdEpoch = Math.floor(startDateConverted.getTime() / 1000);
        const edEpoch = Math.floor(endDateConverted.getTime() / 1000);
        console.log('startDate: ', sdEpoch);
        console.log('endDate', edEpoch);
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            // Make the API call
            const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${sdEpoch}&before=${edEpoch}&page=${page}&per_page=200&nocache=${new Date().getTime()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accessToken,
                },
            });

            console.log("got one batch");

            // Check if the response is successful (status code 200-299)
            if (!response.ok) {
                console.error("response not ok!");
                throw new Error('Network response was not ok');
            }

            // Parse the response body as JSON
            const activities = await response.json();

            // If there are activities in the response, add them to the allActivities array
            if (activities.length > 0) {
                console.log("incrementing page: ", page);
                allActivities = allActivities.concat(activities);
                page++; // Increment the page number for the next request
            } else {
                console.log("all done");
                hasMore = false; // No more activities to fetch
            }
            if (page >= 5) { break; }
        }

        // Handle or return the collected activities
        console.log(allActivities);

    } catch (error) {
        // Handle errors
        console.error('Error fetching activities:', error);
        return false;
    }
    try {
        var payload = {};
        payload['allSports'] = await extractAllSportMetrics(allActivities);
        console.log(payload);
        return payload;
    }
    catch (e) {
        console.log('Error in aggregation', e);
    }
}

