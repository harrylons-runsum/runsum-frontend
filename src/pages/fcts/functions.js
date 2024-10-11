export async function getAllInfo(accessToken) {
    let allActivities = [];
    try {
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
        payload['allSports'] = await extractAllSportMetrics(allActivities, accessToken);
        payload['run'] = await extractRunMetrics(allActivities, accessToken);
        payload['ride'] = await extractBikeMetrics(allActivities, accessToken);
        payload['swim'] = await extractSwimMetrics(allActivities, accessToken);
        console.log(payload);
        return payload;
    }
    catch (e) {
        console.log('Error in aggregation', e);
    }
}

function calculateTotalDistance(activities) {
    return Math.floor(activities.reduce((total, activity) => total + activity.distance, 0) / 1609.34); // Convert meters to miles
}
function calculateTotalYards(activities) {
    return Math.round(activities.reduce((total, activity) => total + activity.distance, 0) * 1.0936132983); // Convert meters to yards
}
function calculateAverageHeartRate(activities) {
    const heartRates = activities.filter(activity => activity.has_heartrate).map(activity => activity.average_heartrate);
    if (heartRates.length === 0) return 0;

    const totalHeartRate = heartRates.reduce((total, rate) => total + rate, 0);
    return Math.floor(totalHeartRate / heartRates.length);
}
function calculateTotalKudos(activities) {
    return activities.reduce((totalKudos, activity) => totalKudos + activity.kudos_count, 0);
}

function calculateTotalTimeSpent(activities) {
    const totalMinutes = activities.reduce((total, activity) => total + (activity.moving_time / 60), 0); // Convert seconds to minutes
    const hours = Math.floor(totalMinutes / 60); // Calculate full hours
    const minutes = Math.floor(totalMinutes % 60); // Calculate remaining minutes
    return `${hours}h ${minutes}m`; // Return time as "hours:minutes"
}

function calculateTotalElevationGain(activities) {
    // Calculate total elevation gain in meters
    const totalElevationMeters = activities.reduce((total, activity) => total + activity.total_elevation_gain, 0);

    // Convert elevation gain from meters to feet
    const totalElevationFeet = totalElevationMeters * 3.28084;

    // Return the total elevation gain in feet, rounded to the nearest whole number
    return `${Math.floor(totalElevationFeet)} ft`;
}

function calculateActiveDays(activities) {
    const activeDays = new Set();
    activities.forEach(activity => {
        // Extract the date in the local timezone to avoid issues with time shifts
        const date = new Date(activity.start_date);
        const localDate = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
        activeDays.add(localDate);
    });
    return activeDays.size;
}

function calculateAveragePaceMinMi(activities, totalDistance) {
    // Filter out activities where distance is 0
    const filteredActivities = activities.filter(activity => activity.distance > 0);

    // Calculate total moving time for filtered activities
    let totalMovingTime = filteredActivities.reduce((total, activity) => total + activity.moving_time / 60, 0); // Convert seconds to minutes
    let avgSpeed = totalMovingTime > 0 ? (totalMovingTime / totalDistance) : 0;

    const minutes = Math.floor(avgSpeed);
    const seconds = Math.round((avgSpeed - minutes) * 60);
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${minutes}:${formattedSeconds}`; // Return pace as "minutes:seconds"
}

function calculateAveragePaceMPH(activities, totalDistance) {
    // Filter out activities where distance is 0
    const filteredActivities = activities.filter(activity => activity.distance > 0);

    // Calculate total moving time for filtered activities
    let totalMovingTime = filteredActivities.reduce((total, activity) => total + activity.moving_time / 3600, 0); // Convert seconds to hours
    let avgSpeed = totalMovingTime > 0 ? (totalDistance / totalMovingTime) : 0; // Calculate speed in MPH

    return avgSpeed.toFixed(2); // Return pace as miles per hour, rounded to 2 decimal places
}

function calculateAveragePacePer100Yards(activities, totalDistanceYards) {
    // Filter out activities where distance is 0
    const filteredActivities = activities.filter(activity => activity.distance > 0);

    // Calculate total moving time for filtered activities
    let totalMovingTime = filteredActivities.reduce((total, activity) => total + activity.moving_time / 60, 0); // Convert seconds to minutes
    let avgPacePer100Yards = totalMovingTime > 0 ? (totalMovingTime / totalDistanceYards) * 100 : 0; // Calculate time in minutes per 100 yards

    const minutes = Math.floor(avgPacePer100Yards);
    const seconds = Math.round((avgPacePer100Yards - minutes) * 60);
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${minutes}:${formattedSeconds}`; // Return pace as "minutes:seconds per 100 yards"
}

function calculateAverageDistancePerActivity(totalDistance, activitiesCount) {
    return activitiesCount > 0 ? (totalDistance / activitiesCount).toFixed(2) : 0;
}
function calculateAverageActivityLength(activities) {
    // Calculate the total time spent in seconds
    const totalTimeSeconds = activities.reduce((total, activity) => total + activity.moving_time, 0);

    // Calculate the number of activities
    const numberOfActivities = activities.length;

    // Calculate the average time per activity in seconds
    const averageTimeSeconds = numberOfActivities > 0 ? totalTimeSeconds / numberOfActivities : 0;

    // Convert average time from seconds to hours and minutes
    const hours = Math.floor(averageTimeSeconds / 3600);
    const minutes = Math.floor((averageTimeSeconds % 3600) / 60);

    // Format hours and minutes into a string
    const formattedTime = `${hours}h ${minutes}m`;

    return formattedTime;
}
function calculateAbsoluteMaxHeartRate(activities) {
    // Initialize max heart rate to zero
    let maxHeartRate = 0;

    // Iterate through each activity
    activities.forEach(activity => {
        // Check if the activity has a maximum heart rate
        if (activity.has_heartrate && activity.max_heartrate) {
            // Update maxHeartRate if the current activity's max heart rate is higher
            maxHeartRate = Math.max(maxHeartRate, activity.max_heartrate);
        }
    });

    return maxHeartRate;
}

function calculatePercentageActiveDays(activities, startDate, endDate) {
    // Create a set to store unique active days
    const activeDays = new Set();

    activities.forEach(activity => {
        // Convert the activity's start date to a day (ignoring time)
        const activityDate = new Date(activity.start_date).toDateString();
        activeDays.add(activityDate);
    });

    // Calculate the total days between startDate and endDate
    const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));

    return totalDays > 0 ? `${((activeDays.size / totalDays) * 100).toFixed(2)}%` : 0;
}

function formatISODate(isoString) {
    const date = new Date(isoString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };
    return date.toLocaleString('en-US', options);
}


async function findMaxActivity(activities, metric, accessToken) {
    console.log(accessToken);
    if (activities.length === 0) return null;
    var filteredActivities;
    if (metric === 'max_heartrate' || metric === 'average_heartrate' || metric === 'suffer_score') {
        // Filter activities to only include those with heart rate data
        filteredActivities = activities.filter(activity => activity.has_heartrate);
        // If no activities have heart rate data, return null
        if (filteredActivities.length === 0) return null;
    }
    else {
        filteredActivities = activities;
    }
    // Find the activity with the longest distance
    const foundActivity = filteredActivities.reduce((maxActivity, currentActivity) =>
        currentActivity[metric] > maxActivity[metric] ? currentActivity : maxActivity
    );
    // Phased out code to make call to detailed activity API
    // const id = foundActivity['id']
    // const response = await fetch(`https://www.strava.com/api/v3/activities/${id}`, {
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': 'Bearer ' + accessToken,
    //     },
    // });
    // if(!response.ok){
    //     //handle error
    // }
    // const longestActivity = await response.json();
    // console.log(longestActivity);
    const longestActivity = foundActivity;

    // Extract and calculate the desired features
    const distanceInMiles = (longestActivity.distance / 1609.34).toFixed(2); // Convert meters to miles
    const paceInMinutes = Math.floor(longestActivity.moving_time / 60 / distanceInMiles); // Calculate whole minutes
    const paceInSeconds = Math.round((longestActivity.moving_time / 60 / distanceInMiles - paceInMinutes) * 60); // Calculate remaining seconds
    // Ensure seconds are always displayed with two digits (e.g., "06" instead of "6")
    const paceFormatted = `${paceInMinutes}:${paceInSeconds.toString().padStart(2, '0')}`;
    const movingTimeInMinutes = Math.floor(longestActivity.moving_time / 60); // Convert seconds to minutes
    const movingTimeFormatted = `${Math.floor(movingTimeInMinutes / 60)}h ${movingTimeInMinutes % 60}m`; // Format time as "hours:minutes"
    return {
        'Distance': `${distanceInMiles} miles`,
        'Pace': `${paceFormatted} min/mile`,
        'Moving Time': movingTimeFormatted,
        'Sport': longestActivity.sport_type,
        'Date': formatISODate(longestActivity.start_date),
        'Name': longestActivity.name,
        'Suffer Score': longestActivity.suffer_score,
        id: longestActivity.id,
        'Achievement Count': longestActivity.achievement_count
    };
}

async function extractAllSportMetrics(activities, accessToken) {
    // DISTANCE
    const totalDistance = calculateTotalDistance(activities);

    const allSports = {
        stats: {
            'Activities': activities.length,
            'Miles': totalDistance,
            'Active Time': calculateTotalTimeSpent(activities),
            'Active Days': calculateActiveDays(activities),
            'Of Days Active': calculatePercentageActiveDays(activities, localStorage.getItem('startDate'), localStorage.getItem('endDate')),
            'Elevation gain': calculateTotalElevationGain(activities),
            'Average Pace (min/mi)': calculateAveragePaceMinMi(activities, totalDistance),
            'Average miles per activity': calculateAverageDistancePerActivity(totalDistance, activities.length),
            'Average activity length': calculateAverageActivityLength(activities),
            'Average Heart Rate': calculateAverageHeartRate(activities),
            'Max Heart Rate': calculateAbsoluteMaxHeartRate(activities),
            'Kudos received': calculateTotalKudos(activities),
        },
        highlights: {
            'Farthest Activity': await findMaxActivity(activities, 'distance', accessToken),
            'Longest Activity': await findMaxActivity(activities, 'moving_time', accessToken),
            'Most Strenuous Activity': await findMaxActivity(activities, 'suffer_score', accessToken),
            'Peak Heart Rate Activity': await findMaxActivity(activities, 'max_heartrate', accessToken),
        }
    };
    return allSports;
}

// Re-calculate all metrics for running and create a new payload format
async function extractRunMetrics(activities, accessToken) {
    const runningActivities = activities.filter(activity =>
        activity.sport_type === 'Run' || activity.sport_type === 'Trail Run' || activity.sport_type === 'Virtual Run'
    );

    return {
        stats: runningActivities.length === 0 ? {
            'Runs': 0,
            'Miles run': 0,
            'Running Time': '0h 0m',
            'Running Days': 0,
            'Of Days Running': '0%',
            'Elevation gain': '0 ft',
            'Average Pace (min/mi)': '0:00',
            'Average miles per run': 0,
            'Average run length': '0h 0m',
            'Average Heart Rate': 0,
            'Max Heart Rate': 0,
            'Kudos on your runs': 0
        } : {
            'Runs': runningActivities.length,
            'Miles run': calculateTotalDistance(runningActivities),
            'Running Time': calculateTotalTimeSpent(runningActivities),
            'Running Days': calculateActiveDays(runningActivities),
            'Of Days Running': calculatePercentageActiveDays(runningActivities, localStorage.getItem('startDate'), localStorage.getItem('endDate')),
            'Elevation gain': calculateTotalElevationGain(runningActivities),
            'Average Pace (min/mi)': calculateAveragePaceMinMi(runningActivities, calculateTotalDistance(runningActivities)),
            'Average miles per run': calculateAverageDistancePerActivity(calculateTotalDistance(runningActivities), runningActivities.length),
            'Average run length': calculateAverageActivityLength(runningActivities),
            'Average Heart Rate': calculateAverageHeartRate(runningActivities),
            'Max Heart Rate': calculateAbsoluteMaxHeartRate(runningActivities),
            'Kudos on your runs': calculateTotalKudos(runningActivities)
        },
        highlights: {
            'Farthest Run': await findMaxActivity(runningActivities, 'distance', accessToken),
            'Longest Run': await findMaxActivity(runningActivities, 'moving_time', accessToken),
            'Most Strenuous Run': await findMaxActivity(runningActivities, 'suffer_score', accessToken),
            'Peak Heart Rate Run': await findMaxActivity(runningActivities, 'max_heartrate', accessToken),
        }
    };
}

async function extractBikeMetrics(activities, accessToken) {
    const bikeActivities = activities.filter(activity =>
        activity.sport_type === 'Ride' || activity.sport_type === 'Mountain Bike Ride' || activity.sport_type === 'Gravel Ride' || activity.sport_type === 'Virtual Ride'
    );
    const totalDistance = calculateTotalDistance(bikeActivities);
    return {
        stats: bikeActivities.length === 0 ? {
            'Rides': 0,
            'Miles cycled': 0,
            'Cycling Time': '0h 0m',
            'Cycling Days': 0,
            'Of Days Cycling': '0%',
            'Elevation gain': '0 ft',
            'Average Speed (mph)': '0.00',
            'Average miles per ride': 0,
            'Average ride length': '0h 0m',
            'Average Heart Rate': 0,
            'Max Heart Rate': 0,
            'Kudos on your rides': 0
        } : {
            'Rides': bikeActivities.length,
            'Miles cycled': totalDistance,
            'Cycling Time': calculateTotalTimeSpent(bikeActivities),
            'Cycling Days': calculateActiveDays(bikeActivities),
            'Of Days Cycling': calculatePercentageActiveDays(bikeActivities, localStorage.getItem('startDate'), localStorage.getItem('endDate')),
            'Elevation gain': calculateTotalElevationGain(bikeActivities),
            'Average Speed (mph)': calculateAveragePaceMPH(bikeActivities, totalDistance),
            'Average miles per ride': calculateAverageDistancePerActivity(totalDistance, bikeActivities.length),
            'Average ride length': calculateAverageActivityLength(bikeActivities),
            'Average Heart Rate': calculateAverageHeartRate(bikeActivities),
            'Max Heart Rate': calculateAbsoluteMaxHeartRate(bikeActivities),
            'Kudos on your rides': calculateTotalKudos(bikeActivities)
        },
        highlights: {
            'Farthest Ride': await findMaxActivity(bikeActivities, 'distance'),
            'Longest Ride': await findMaxActivity(bikeActivities, 'moving_time'),
            'Most Strenuous Ride': await findMaxActivity(bikeActivities, 'suffer_score'),
            'Peak Heart Rate Ride': await findMaxActivity(bikeActivities, 'max_heartrate'),
        }
    };
}

async function extractSwimMetrics(activities, accessToken) {
    const swimActivities = activities.filter(activity => activity.sport_type === 'Swim');
    const totalDistance = calculateTotalYards(swimActivities);

    return {
        stats: swimActivities.length === 0 ? {
            'Swims': 0,
            'Yards': 0,
            'Swimming Time': '0h 0m',
            'Swim Days': 0,
            'Of Days Swimming': '0%',
            'Elevation gain': '0 ft',
            'Average pace /100y': '0:00',
            'Average yds per activity': 0,
            'Average activity length': '0h 0m',
            'Average Heart Rate': 0,
            'Max Heart Rate': 0,
            'Kudos received': 0
        } : {
            'Swims': swimActivities.length,
            'Yards': totalDistance,
            'Swimming Time': calculateTotalTimeSpent(swimActivities),
            'Swim Days': calculateActiveDays(swimActivities),
            'Of Days Swimming': calculatePercentageActiveDays(swimActivities, localStorage.getItem('startDate'), localStorage.getItem('endDate')),
            'Elevation gain': calculateTotalElevationGain(swimActivities),
            'Average pace /100y': calculateAveragePacePer100Yards(swimActivities, totalDistance),
            'Average yds per activity': calculateAverageDistancePerActivity(totalDistance, swimActivities.length),
            'Average activity length': calculateAverageActivityLength(swimActivities),
            'Average Heart Rate': calculateAverageHeartRate(swimActivities),
            'Max Heart Rate': calculateAbsoluteMaxHeartRate(swimActivities),
            'Kudos received': calculateTotalKudos(swimActivities)
        },
        highlights: {
            'Farthest Swim': await findMaxActivity(swimActivities, 'distance'),
            'Longest Swim': await findMaxActivity(swimActivities, 'moving_time'),
            'Most Strenuous Swim': await findMaxActivity(swimActivities, 'suffer_score'),
            'Max Heart Rate Swim': await findMaxActivity(swimActivities, 'max_heartrate')
        }
    };
}
