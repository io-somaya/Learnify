---
name: Bug report
about: Create a report to help us improve
title: ''
labels: documentation
assignees: Mahmoud-Eid-Elsayed

---

name: Bug Report
description: Report a bug or unexpected behavior
title: "[BUG] <Brief Description>"
labels: ["bug"]
body:
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Describe the bug in detail.
    validations:
      required: true
  - type: textarea
    id: steps-to-reproduce
    attributes:
      label: Steps to Reproduce
      description: Include steps, screenshots, or code.
  - type: input
    id: environment
    attributes:
      label: Environment (Browser/Device/Version)
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
