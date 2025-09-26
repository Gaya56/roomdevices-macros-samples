---
mode: agent
---
Define the task to achieve, including specific requirements, constraints, and success criteria.

## Target Files:

1. `/workspaces/roomdevices-macros-samples/ShutDownTimer/Volume-Fix2/ShutDownTimer.js`
2. `/workspaces/roomdevices-macros-samples == /workspaces/roomdevices-macros-samples/ShutDownTimer/Volume-Fix2`

Note: You can only edit the ShutDownTimer.js file in the `/workspaces/roomdevices-macros-samples/ShutDownTimer/Volume-Fix2` directory. You may use code from other parts of the repository as examples, but modifications can only be made to this specific file.

## **RULES:**

- DO NOT make any edits without my explicit permission
- Must use MCP BraveSearch, filesystem, memory, and sequential thinking for every step
- MUST double-check with official Cisco documentation BEFORE and AFTER applying any code changes
- MUST review the final script 3 TIMES before presenting
- No shortcuts - validate every xAPI path against official docs

## **TASK:**

Replace the broken Audio.Input.Level path in the hasIncomingSounds() function with Audio.Input.Microphone[1] status path.

## **DESIRED FLOW:**

1. Teams call begins
2. Monitor for occupancy via RoomAnalytics.PeoplePresence
3. ONLY when occupancy = 0 (no people detected)
4. THEN trigger `Audio.Input.Microphone[1]` monitoring
5. If microphone detects audio activity, cancel shutdown timer
6. If no audio activity, proceed with 5-minute countdown

Current broken code:

```jsx
const audioLevel = await xapi.status.get('Audio.Input.Level');
return audioLevel > AUDIO_THRESHOLD;
```

## **ESSENTIAL URLS FOR AUDIO FIX:**

**Critical Documentation (Must Have):**

- https://www.cisco.com/c/dam/en/us/td/docs/telepresence/endpoint/roomos-1127/api-reference-guide-roomos-1127.pdf - Cisco Board, Desk, and Room Series API Reference Guide (RoomOS 11.27)
- https://roomos.cisco.com/xapi - RoomOS xAPI Reference Documentation
- https://www.cisco.com/c/dam/en/us/td/docs/telepresence/endpoint/technical-papers/cisco-collaboration-devices-audio-integration-setup-guide.pdf - Audio Integration Setup Guide
- https://roomos.cisco.com/xapi/domain/?domain=Audio - Audio Domain Reference

**Validation & Examples (Important):**

- https://github.com/CiscoDevNet/roomdevices-macros-samples - Cisco DevNet xAPI Examples (official macro examples)
- https://roomos.cisco.com/xapi/Status.RoomAnalytics.PeoplePresence/ - Room Analytics Documentation (occupancy detection)

**Additional References:**

- https://developer.webex.com/docs/api/v1/xapi - Webex Device xAPI Developer Guide
- https://roomos.cisco.com/xapi/Status.Call/ - Call Status Reference

**IMPORTANT:** You may ONLY reference official Cisco documentation from the URLs listed above OR existing code examples found in the current codespace. No external sources, Stack Overflow, or unofficial documentation are permitted.