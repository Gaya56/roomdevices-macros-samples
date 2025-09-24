---
mode: agent
---
# Task: Fix Code in ShutDownTimer Directory
The `/workspaces/roomdevices-macros-samples/ShutDownTimer/Original_Copy/ShutDownTimer.js` code is:

Primary Goal: Detect if there's an active conversation happening on the Teams call to prevent hanging up when people are still talking, even if the local room is empty.

What we need: Detect incoming audio from remote participants (sounds coming FROM the other side of the call TO our device) to avoid disconnecting calls where remote participants are still speaking but local room occupancy shows "No".

Critical Requirement: The script should NOT hang up if someone on the remote side is still talking, even when both local participants have left the room.

Current Problem: The Audio.Input.Level path we tried doesn't exist/work on this device, and my research suggests real-time audio input level monitoring may not be supported via xAPI status calls.
## Access Permissions
- You can ONLY edit files in: `/workspaces/roomdevices-macros-samples/ShutDownTimer/Volume-Fix/`
- You cannot modify any other files in the repository

## Resources
- Use the rest of the repository as reference material and code examples
- These examples will help you understand how to fix the code in your editable directory

## Approach
- Utilize all available tools: filesystem search, bravesearch, memory, and sequential thinking
- **MANDATORY**: Always ask for permission before making any file edits
- **MANDATORY**: Use MCP tools to double-check file contents, syntax, and paths before implementing
- Work step-by-step to identify and fix issues in the target files
- Make one edit at a time, ensuring code functionality after each change
- Create backups before testing each alternative option

## Target Files
Fix these specific files to make them work correctly:
1. `/workspaces/roomdevices-macros-samples/ShutDownTimer/Volume-Fix/CancelShutdownTimer.xml`
2. `/workspaces/roomdevices-macros-samples/ShutDownTimer/Volume-Fix/ShutDownTimer.js`
3. `/workspaces/roomdevices-macros-samples/ShutDownTimer/Volume-Fix/configuration.txt`
4. `/workspaces/roomdevices-macros-samples/ShutDownTimer/Volume-Fix/manifest.json`

## Success Criteria
- Both files should work perfectly together
- Code must follow best practices from official documentation: `/workspaces/roomdevices-macros-samples/ShutDownTimer/Volume-Fix/ShutDownTimer.js`, `/workspaces/roomdevices-macros-samples/ShutDownTimer/Volume-Fix/CancelShutdownTimer.xml`

# do not edit : 
`/workspaces/roomdevices-macros-samples/ShutDownTimer/Volume-Fix/configuration.txt`
`/workspaces/roomdevices-macros-samples/ShutDownTimer/Volume-Fix/manifest.json`
* this files are correct and set and stone 

# Fix Audio Input Detection in ShutDownTimer

## Research Findings

After comprehensive analysis of official documentation and repository examples, **MediaChannels.Call** is the best practice approach for detecting incoming audio from remote participants.

### Analysis of Alternatives:

1. **MediaChannels.Call Audio Statistics** ✅ **RECOMMENDED**
   - ✅ Used in working repository examples (Smart Dual Screen, Datadog)
   - ✅ Directly monitors call media streams in real-time
   - ✅ Can filter by Direction: 'Incoming' and Type: 'Audio'
   - ✅ Has Netstat properties for activity detection (bytes, packets)
   - ✅ Proven, reliable, follows best practices

2. **Audio.Input.Ethernet.DiscoveredStream** ❌ Not Recommended
   - ❌ No repository examples found
   - ❌ Unclear what "DiscoveredStream" represents
   - ❌ Not related to call audio streams

3. **Audio.Input.Connectors** ❌ Not Recommended  
   - ❌ Hardware-level connectors, not call audio
   - ❌ No repository examples for audio activity detection

4. **Audio.Input.Level** ❌ Not Supported
   - ❌ Path doesn't exist on device (confirmed)
   - ❌ Real-time audio level monitoring not supported via xAPI

## Implementation Plan

Replace the failing `hasIncomingSounds()` function with MediaChannels.Call approach following the Smart Dual Screen presentation pattern:

```javascript
async function hasIncomingSounds() {
    try {
        const calls = await xapi.status.get('Call');
        if (!calls || calls.length === 0) return false;

        for (const call of calls) {
            const domain = call.CallbackNumber?.split('@')[1];
            if (domain === TEAMS_DOMAIN) {
                const mediaChannels = await xapi.status.get('MediaChannels Call');
                if (mediaChannels && mediaChannels[0]) {
                    for (const channel of mediaChannels[0].Channel) {
                        if (channel.Direction === 'Incoming' && 
                            channel.Type === 'Audio' &&
                            channel.Netstat && 
                            channel.Netstat.Bytes > 0) {
                            return true; // Active incoming audio detected
                        }
                    }
                }
            }
        }
        return false;
    } catch (error) {
        console.error('Error checking incoming sounds:', error);
        return false;
    }
}
```

## Success Criteria
- MediaChannels.Call approach detects active incoming audio from remote participants
- Script prevents shutdown when remote participants are speaking
- All existing functionality preserved (occupancy, timer, cancel button)
- Follows repository best practices and proven patterns

## File to Edit
`/workspaces/roomdevices-macros-samples/ShutDownTimer/Volume-Fix/ShutDownTimer.js`
Replace `hasIncomingSounds()` function (lines ~9-25)

## Alternative Detection Methods - Test All Options

Since we need to determine the most reliable method for our specific device, we will test multiple approaches:

### Option 1: MediaChannels.Call Audio Statistics ✅ **PRIMARY RECOMMENDATION**
```javascript
async function hasIncomingSounds() {
    try {
        const calls = await xapi.status.get('Call');
        if (!calls || calls.length === 0) return false;

        for (const call of calls) {
            const domain = call.CallbackNumber?.split('@')[1];
            if (domain === TEAMS_DOMAIN) {
                const mediaChannels = await xapi.status.get('MediaChannels Call');
                if (mediaChannels && mediaChannels[0]) {
                    for (const channel of mediaChannels[0].Channel) {
                        if (channel.Direction === 'Incoming' && 
                            channel.Type === 'Audio' &&
                            channel.Netstat && 
                            (channel.Netstat.Bytes > 0 || channel.Netstat.Packets > 0)) {
                            return true; // Active incoming audio detected
                        }
                    }
                }
            }
        }
        return false;
    } catch (error) {
        console.error('Error checking incoming sounds:', error);
        return false;
    }
}
```

### Option 2: Audio Input Stream Discovery Status
```javascript
async function hasIncomingSounds() {
    try {
        const calls = await xapi.status.get('Call');
        if (!calls || calls.length === 0) return false;

        for (const call of calls) {
            const domain = call.CallbackNumber?.split('@')[1];
            if (domain === TEAMS_DOMAIN) {
                const streams = await xapi.status.get('Audio.Input.Ethernet.DiscoveredStream');
                if (streams && streams.length > 0) {
                    for (const stream of streams) {
                        if (stream.Status === 'Active') {
                            return true; // Active incoming audio stream detected
                        }
                    }
                }
            }
        }
        return false;
    } catch (error) {
        console.error('Error checking incoming sounds:', error);
        return false;
    }
}
```

### Option 3: Audio Input Connectors Activity
```javascript
async function hasIncomingSounds() {
    try {
        const calls = await xapi.status.get('Call');
        if (!calls || calls.length === 0) return false;

        for (const call of calls) {
            const domain = call.CallbackNumber?.split('@')[1];
            if (domain === TEAMS_DOMAIN) {
                const connectors = await xapi.status.get('Audio.Input.Connectors');
                if (connectors && connectors.Ethernet) {
                    for (const ethernet of connectors.Ethernet) {
                        if (ethernet.StreamName && ethernet.StreamName !== '') {
                            return true; // Active stream name indicates incoming audio
                        }
                    }
                }
            }
        }
        return false;
    } catch (error) {
        console.error('Error checking incoming sounds:', error);
        return false;
    }
}
```

### Option 4: Direct MediaChannels Audio Properties
```javascript
async function hasIncomingSounds() {
    try {
        const calls = await xapi.status.get('Call');
        if (!calls || calls.length === 0) return false;

        for (const call of calls) {
            const domain = call.CallbackNumber?.split('@')[1];
            if (domain === TEAMS_DOMAIN) {
                const mediaChannels = await xapi.status.get('MediaChannels Call');
                if (mediaChannels && mediaChannels[0]) {
                    for (const channel of mediaChannels[0].Channel) {
                        if (channel.Direction === 'Incoming' && 
                            channel.Type === 'Audio' &&
                            channel.Audio && 
                            (channel.Audio.Bitrate > 0 || channel.Audio.Status === 'Active')) {
                            return true; // Active incoming audio channel
                        }
                    }
                }
            }
        }
        return false;
    } catch (error) {
        console.error('Error checking incoming sounds:', error);
        return false;
    }
}
```

## Testing Protocol
**SAFETY FIRST**: Before implementing each option, you MUST:
1. Create a backup copy: `cp -r /workspaces/roomdevices-macros-samples/ShutDownTimer/Original_Copy /workspaces/roomdevices-macros-samples/ShutDownTimer/Volume-Fix`
2. **ALWAYS ask for permission** before making any file edits
3. **Use MCP tools to double-check everything** (file contents, paths, syntax) before implementing
4. Verify current file state using read tools before making changes

**Testing Sequence**:
1. Start with Option 1 (MediaChannels.Call) as it has proven repository examples
2. If Option 1 fails, restore from backup and test Option 2 (DiscoveredStream)
3. If Option 2 fails, restore from backup and test Option 3 (Connectors)  
4. If Option 3 fails, restore from backup and test Option 4 (Direct Audio Properties)
5. Document which option works for future reference

**Before Each Implementation**:
- ✅ Ask user permission to proceed with the specific option
- ✅ Use MCP filesystem tools to verify current file contents
- ✅ Double-check syntax and logic before editing
- ✅ Confirm backup is in place

## Implementation Notes
- **CRITICAL**: Create backup before each option: `cp -r /workspaces/roomdevices-macros-samples/ShutDownTimer/Original_Copy /workspaces/roomdevices-macros-samples/ShutDownTimer/Volume-Fix`
- **MANDATORY**: Ask permission before any file edits
- **MANDATORY**: Use MCP tools to verify file contents and syntax before implementing
- Each option maintains the same function signature for easy swapping
- All options preserve Teams domain filtering (`TEAMS_DOMAIN = 'vconlink.pwc.com'`)
- Error handling ensures graceful fallback to no audio detection
- Test one option at a time, restore from backup between attempts
- Successful option can be marked as the final solution
- Document which specific option works for future reference
