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
        payload['run'] = await extractRunMetrics(allActivities);
        payload['ride'] = await extractBikeMetrics(allActivities);
        payload['swim'] = await extractSwimMetrics(allActivities);
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
    let totalMovingTime = activities.reduce((total, activity) => total + activity.moving_time / 60, 0); // Convert seconds to minutes
    let avgSpeed = totalMovingTime > 0 ? (totalMovingTime / totalDistance) : 0;

    const minutes = Math.floor(avgSpeed);
    const seconds = Math.round((avgSpeed - minutes) * 60);
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${minutes}:${formattedSeconds}`; // Return pace as "minutes:seconds"
}
function calculateAveragePaceMPH(activities, totalDistance) {
    let totalMovingTime = activities.reduce((total, activity) => total + activity.moving_time / 3600, 0); // Convert seconds to hours
    let avgSpeed = totalMovingTime > 0 ? (totalDistance / totalMovingTime) : 0; // Calculate speed in MPH

    return (avgSpeed.toFixed(2)); // Return pace as miles per hour, rounded to 2 decimal places
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

async function extractAllSportMetrics(activities) {
    // DISTANCE
    const totalDistance = calculateTotalDistance(activities);

    // AVG HEART RATE
    const avgHeartRate = calculateAverageHeartRate(activities);

    // KUDOS
    const totalKudos = calculateTotalKudos(activities);
    // TIME
    const totalTimeSpent = calculateTotalTimeSpent(activities);

    // ELEVATION
    const totalElevation = calculateTotalElevationGain(activities);

    // COUNT ACTIVE DAYS
    const activeDaysCount = calculateActiveDays(activities);

    // AVG SPEED (min/mi)
    const avgPace = calculateAveragePaceMinMi(activities, totalDistance);

    // AVG DISTANCE PER ACTIVITY
    const avgDistancePerActivity = calculateAverageDistancePerActivity(totalDistance, activities.length);

    // % ACTIVE DAYS
    const percentActiveDays = calculatePercentageActiveDays(activities, localStorage.getItem('startDate'), localStorage.getItem('endDate'));

    // ACTIVITY LENGTH
    const averageLength = calculateAverageActivityLength(activities);

    // ABSOLUTE MAX HR
    const maxHR = calculateAbsoluteMaxHeartRate(activities);

    const allSports = {
        'Activities': activities.length,
        'Miles': totalDistance,
        'Active Time': totalTimeSpent,
        'Active Days': activeDaysCount,
        'Of Days Active': percentActiveDays,
        'Elevation gain': totalElevation,
        'Average Pace (min/mi)': avgPace,
        'Average miles per activity': avgDistancePerActivity,
        'Average activity length': averageLength,
        'Average Heart Rate': avgHeartRate,
        'Max Heart Rate': maxHR,
        'Kudos received': totalKudos,
    };
    return allSports;
}

// Re-calculate all metrics for running and create a new payload format
async function extractRunMetrics(activities) {
    // Filter activities for running-specific types 
    const runningActivities = activities.filter(activity =>
        activity.sport_type === 'Run' || activity.sport_type === 'Trail Run' || activity.sport_type === 'Virtual Run'
    );
    if (runningActivities.length === 0) {
        return {
            'Activities': 0,
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
        };
    }

    // DISTANCE
    const totalDistance = calculateTotalDistance(runningActivities);

    // AVG HEART RATE
    const avgHeartRate = calculateAverageHeartRate(runningActivities);

    // KUDOS
    const totalKudos = calculateTotalKudos(runningActivities);

    // TIME
    const totalTimeSpent = calculateTotalTimeSpent(runningActivities);

    // ELEVATION
    const totalElevation = calculateTotalElevationGain(runningActivities);

    // COUNT ACTIVE DAYS
    const activeDaysCount = calculateActiveDays(runningActivities);

    // AVG SPEED (min/mi)
    const avgPace = calculateAveragePaceMinMi(runningActivities, totalDistance);

    // AVG DISTANCE PER ACTIVITY
    const avgDistancePerActivity = calculateAverageDistancePerActivity(totalDistance, runningActivities.length);

    // % ACTIVE DAYS
    const percentActiveDays = calculatePercentageActiveDays(runningActivities, localStorage.getItem('startDate'), localStorage.getItem('endDate'));

    // ACTIVITY LENGTH
    const averageLength = calculateAverageActivityLength(runningActivities);

    // ABSOLUTE MAX HR
    const maxHR = calculateAbsoluteMaxHeartRate(runningActivities);

    const runMetrics = {
        'Activities': runningActivities.length,
        'Miles run': totalDistance,
        'Running Time': totalTimeSpent,
        'Running Days': activeDaysCount,
        'Of Days Running': percentActiveDays,
        'Elevation gain': totalElevation,
        'Average Pace (min/mi)': avgPace,
        'Average miles per run': avgDistancePerActivity,
        'Average run length': averageLength,
        'Average Heart Rate': avgHeartRate,
        'Max Heart Rate': maxHR,
        'Kudos on your runs': totalKudos,
    };

    return runMetrics;
}

async function extractBikeMetrics(activities) {
    // filter to type in (ride, virtual ride, etc)
    const bikeActivities = activities.filter(activity =>
        activity.sport_type === 'Ride' || activity.sport_type === 'Mountain Bike Ride' || activity.sport_type === 'Gravel Ride' || activity.sport_type === 'Virtual Ride'
    );
    if (bikeActivities.length === 0) {
        return {
            'Activities': 0,
            'Miles cycled': 0,
            'Cycling Time': '0h 0m',
            'Cycling Days': 0,
            'Of Days Cycling': '0%',
            'Elevation gain': '0 ft',
            'Average Speed': '0',
            'Average miles per ride': 0,
            'Average ride length': '0h 0m',
            'Average Heart Rate': 0,
            'Max Heart Rate': 0,
            'Kudos on your rides': 0
        };
    }

    // DISTANCE
    const totalDistance = calculateTotalDistance(bikeActivities);

    // AVG HEART RATE
    const avgHeartRate = calculateAverageHeartRate(bikeActivities);

    // KUDOS
    const totalKudos = calculateTotalKudos(bikeActivities);

    // TIME
    const totalTimeSpent = calculateTotalTimeSpent(bikeActivities);

    // ELEVATION
    const totalElevation = calculateTotalElevationGain(bikeActivities);

    // COUNT ACTIVE DAYS
    const activeDaysCount = calculateActiveDays(bikeActivities);

    // AVG SPEED (min/mi)
    const avgPace = calculateAveragePaceMPH(bikeActivities, totalDistance);

    // AVG DISTANCE PER ACTIVITY
    const avgDistancePerActivity = calculateAverageDistancePerActivity(totalDistance, bikeActivities.length);

    // % ACTIVE DAYS
    const percentActiveDays = calculatePercentageActiveDays(bikeActivities, localStorage.getItem('startDate'), localStorage.getItem('endDate'));

    // ACTIVITY LENGTH
    const averageLength = calculateAverageActivityLength(bikeActivities);

    // ABSOLUTE MAX HR
    const maxHR = calculateAbsoluteMaxHeartRate(bikeActivities);

    const bikeMetrics = {
        'Activities': bikeActivities.length,
        'Miles cycled': totalDistance,
        'Cycling Time': totalTimeSpent,
        'Cycling Days': activeDaysCount,
        'Of Days Cycling': percentActiveDays,
        'Elevation gain': totalElevation,
        'Average Speed (mph)': avgPace,
        'Average miles per ride': avgDistancePerActivity,
        'Average ride length': averageLength,
        'Average Heart Rate': avgHeartRate,
        'Max Heart Rate': maxHR,
        'Kudos on your rides': totalKudos,
    };

    return bikeMetrics;

}

async function extractSwimMetrics(activities) {
    // filter to type swim
    const swimActivities = activities.filter(activity =>
        activity.sport_type === 'Swim'
    );
    if (swimActivities.length === 0) {
        return {
            'Activities': 0,
            'Miles': 0,
            'Active Time': '0h 0m',
            'Active Days': 0,
            'Of Days Active': '0%',
            'Elevation gain': '0 ft',
            'Average Pace (min/mi)': '0:00',
            'Average miles per activity': 0,
            'Average activity length': '0h 0m',
            'Average Heart Rate': 0,
            'Max Heart Rate': 0,
            'Kudos received': 0,
        };
    }

    // DISTANCE
    const totalDistance = calculateTotalDistance(swimActivities);

    // AVG HEART RATE
    const avgHeartRate = calculateAverageHeartRate(swimActivities);

    // KUDOS
    const totalKudos = calculateTotalKudos(swimActivities);

    // TIME
    const totalTimeSpent = calculateTotalTimeSpent(swimActivities);

    // ELEVATION
    const totalElevation = calculateTotalElevationGain(swimActivities);

    // COUNT ACTIVE DAYS
    const activeDaysCount = calculateActiveDays(swimActivities);

    // AVG SPEED (min/mi)
    const avgPace = calculateAveragePaceMinMi(swimActivities, totalDistance);

    // AVG DISTANCE PER ACTIVITY
    const avgDistancePerActivity = calculateAverageDistancePerActivity(totalDistance, swimActivities.length);

    // % ACTIVE DAYS
    const percentActiveDays = calculatePercentageActiveDays(swimActivities, localStorage.getItem('startDate'), localStorage.getItem('endDate'));

    // ACTIVITY LENGTH
    const averageLength = calculateAverageActivityLength(swimActivities);

    // ABSOLUTE MAX HR
    const maxHR = calculateAbsoluteMaxHeartRate(swimActivities);

    const swimMetrics = {
        'Activities': swimActivities.length,
        'Miles run': totalDistance,
        'Running Time': totalTimeSpent,
        'Running Days': activeDaysCount,
        'Of Days Running': percentActiveDays,
        'Elevation gain': totalElevation,
        'Average Pace (min/mi)': avgPace,
        'Average miles per run': avgDistancePerActivity,
        'Average run length': averageLength,
        'Average Heart Rate': avgHeartRate,
        'Max Heart Rate': maxHR,
        'Kudos on your runs': totalKudos,
    };

    return swimMetrics;
}