import xapi from 'xapi';

let noOccupancyTimer = null;
let countdownInterval = null;
const TEAMS_DOMAIN = 'vconlink.pwc.com';
const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const AUDIO_THRESHOLD = 0; // Level below which we consider "no incoming sounds"
const UPDATE_INTERVAL_MS = 10 * 1000; // Update display every 10 seconds

async function hasIncomingSounds() {
    try {
        const calls = await xapi.status.get('Call');
        if (!calls || calls.length === 0) return false; // No call, so no sounds

        // Check the Teams call specifically
        for (const call of calls) {
            const domain = call.CallbackNumber?.split('@')[1];
            if (domain === TEAMS_DOMAIN) {
                const audioLevel = await xapi.status.get('Audio.Input.Level');
                return audioLevel > AUDIO_THRESHOLD; // True if sounds detected
            }
        }
        return false; // No matching call
    } catch (error) {
        console.error('Error checking incoming sounds:', error);
        return false; // Default to no sounds on error
    }
}

function endTeamsCall() {
    xapi.status.get('Call').then(calls => {
        if (!calls || calls.length === 0) return;

        calls.forEach(call => {
            const domain = call.CallbackNumber?.split('@')[1];
            if (domain === TEAMS_DOMAIN) {
                console.log('Ending Microsoft Teams call due to no occupancy and no incoming sounds.');
                xapi.command('Call Disconnect', { CallId: call.id });
            }
        });
    });
    clearCountdownDisplay(); // Clear display when ending call
}

function updateCountdownDisplay(remainingMs) {
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    xapi.command('UserInterface.Message.TextLine.Display', {
        Text: `Call will end in ${timeString} due to no occupancy and no sounds.`,
        Duration: 0
    });
}

function clearCountdownDisplay() {
    xapi.command('UserInterface.Message.TextLine.Clear');
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

async function startNoOccupancyTimer() {
    if (noOccupancyTimer) return;

    const hasSounds = await hasIncomingSounds();
    if (hasSounds) {
        console.log('No occupancy detected, but incoming sounds present. Not starting timer.');
        return;
    }

    console.log('No occupancy and no incoming sounds detected. Starting 5-minute timer...');
    let remainingMs = TIMEOUT_MS;
    updateCountdownDisplay(remainingMs);

    countdownInterval = setInterval(() => {
        remainingMs -= UPDATE_INTERVAL_MS;
        if (remainingMs <= 0) {
            clearCountdownDisplay();
        } else {
            updateCountdownDisplay(remainingMs);
        }
    }, UPDATE_INTERVAL_MS);

    noOccupancyTimer = setTimeout(() => {
        endTeamsCall();
        noOccupancyTimer = null;
        countdownInterval = null;
    }, TIMEOUT_MS);
}

function cancelNoOccupancyTimer() {
    if (noOccupancyTimer) {
        console.log('Occupancy or sounds detected. Cancelling timer.');
        clearTimeout(noOccupancyTimer);
        noOccupancyTimer = null;
        clearCountdownDisplay();
    }
}

// Monitor occupancy changes
xapi.status.on('RoomAnalytics.PeoplePresence', async presence => {
    if (presence === 'No') {
        await startNoOccupancyTimer();
    } else {
        cancelNoOccupancyTimer();
    }
});

// On call start, check occupancy and sounds
xapi.event.on('CallSuccessful', async () => {
    console.log('Call started.');
    const presence = await xapi.status.get('RoomAnalytics.PeoplePresence');
    if (presence === 'No') {
        await startNoOccupancyTimer();
    }
});

// On call end, clear timer
xapi.event.on('CallDisconnect', () => {
    console.log('Call ended. Clearing timer.');
    cancelNoOccupancyTimer();
});

// Handle cancel button press
xapi.event.on('UserInterface.Extensions.Widget.Action', (event) => {
    if (event.WidgetId === 'cancel_timer') {
        cancelNoOccupancyTimer();
    }
});
