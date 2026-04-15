---
name: AI-Scheduler
description: Useful Prompts for this app
version: 1.0.0
author: Cod3rKane
license: MIT
prerequisites:
  env_vars: []
  commands: []
metadata:
  hermes:
    tags: [Project Management, API, Productivity, TypeScript, JavaScript, Programming]
---

Add a new worker named 'John Doe' with the role 'Server' and skills 'Customer Service,
Bartending'


1. To test the schedule tool (fills the schedule for a given date range):

    * "Schedule all workers for next week, from April 21st, 2026 to April 27th, 2026."
    * "Can you fill the schedule for the first two weeks of May? That would be from 2026-05-01 until 2026-05-14."
    * "I need the schedule for June 2026." (This will test if the model can infer the start and end dates for the month).

2. To test the addWorker tool (adds a new worker):

* "Add a new worker named 'Alice Wonderland' with the role 'Server' and skills 'Customer Service, Bartending'."
* "Please add Bob The Builder as a 'Maintenance' worker with no specific skills listed."
* "Create a new worker called 'Charlie Chaplin', role 'Cleaner'."

3. To test the getAssignedWorkers tool (retrieves assigned workers):

* "Show me all assigned workers between April 21st, 2026 and April 25th, 2026."
* "Who is assigned to work on April 21st, 2026?"
* "List all assigned workers." (This should show assignments across all dates in the system).


List all  workers


Simply ask the chatbot something like:
* "Can you show me a visual schedule for next week?"
* "Show the assignments as a graph."
* "Display the worker timeline for tomorrow."

The AI will now trigger the tool and you'll see a clean, interactive schedule grid instead of just a text list.

Can you show me a visual schedule?