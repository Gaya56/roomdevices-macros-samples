import xapi from 'xapi';

let noOccupancyTimer = null;
const TEAMS_DOMAIN = 'vconlink.pwc.com';
const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

function endTeamsCall() {
    xapi.status.get('Call').then(calls => {
        if (!calls || calls.length === 0) return;

        calls.forEach(call => {
            const domain = call.CallbackNumber?.split('@')[1];
            if (domain === TEAMS_DOMAIN) {
                console.log('Ending Microsoft Teams call due to no occupancy.');
                xapi.command('Call Disconnect', { CallId: call.id });
            }
        });
    });
}

function startNoOccupancyTimer() {
    if (noOccupancyTimer) return;
    console.log('No occupancy detected. Starting 5-minute timer...');
    noOccupancyTimer = setTimeout(() => {
        endTeamsCall();
        noOccupancyTimer = null;
    }, TIMEOUT_MS);
}

function cancelNoOccupancyTimer() {
    if (noOccupancyTimer) {
        console.log('Occupancy detected. Cancelling timer.');
        clearTimeout(noOccupancyTimer);
        noOccupancyTimer = null;
    }
}

// Monitor occupancy changes
xapi.status.on('RoomAnalytics.PeoplePresence', presence => {
    if (presence === 'No') {
        startNoOccupancyTimer();
    } else {
        cancelNoOccupancyTimer();
    }
});

// On call start, check occupancy
xapi.event.on('CallSuccessful', () => {
    console.log('Call started.');
    xapi.status.get('RoomAnalytics.PeoplePresence').then(presence => {
        if (presence === 'No') {
            startNoOccupancyTimer();
        }
    });
});

// On call end, clear timer
xapi.event.on('CallDisconnect', () => {
    console.log('Call ended. Clearing timer.');
    cancelNoOccupancyTimer();
});
