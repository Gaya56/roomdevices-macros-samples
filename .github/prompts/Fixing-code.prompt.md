---
mode: agent
---
# Task: Fix Code in ShutDownTimer Directory

## Access Permissions
- You can ONLY edit files in: `/workspaces/roomdevices-macros-samples/ShutDownTimer/fix1`
- You cannot modify any other files in the repository

## Resources
- Use the rest of the repository as reference material and code examples
- These examples will help you understand how to fix the code in your editable directory

## Approach
- Utilize all available tools: filesystem search, bravesearch, memory, and sequential thinking
- Work step-by-step to identify and fix issues in the target files
- Make one edit at a time, ensuring code functionality after each change

## Target Files
Fix these specific files to make them work correctly:
1. `/workspaces/roomdevices-macros-samples/ShutDownTimer/fix1/ShutDown_Timer.js`
2. `/workspaces/roomdevices-macros-samples/ShutDownTimer/fix1/CancelShutdownTimer.xml`

## Success Criteria
- Both files should work perfectly together
- Code must follow best practices from official documentation

Script:
This JavaScript script is a macro for a Cisco Room Device that automatically manages Microsoft Teams calls based on room occupancy. It uses the xapi library to interact with the device. Key functions include: endTeamsCall(), which checks for active Teams calls (identified by the domain 'vconlink.pwc.com') and disconnects them; startNoOccupancyTimer(), which sets a 5-minute timer to trigger call ending if no one is present; and cancelNoOccupancyTimer(), which clears the timer when occupancy is detected. The script listens for occupancy changes via RoomAnalytics.PeoplePresence (starting the timer on 'No' presence, canceling on presence), call starts (CallSuccessful event, checking occupancy to start timer), and call ends (CallDisconnect event, canceling the timer). Overall, it ensures Teams calls are ended after 5 minutes of no occupancy to save resources. The accompanying XML defines a UI panel with a "Cancel Timer" button for manual intervention.

