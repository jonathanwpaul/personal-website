# My projects.

Goals:

- effectively showcase my projects in one location
- direct users to other links (e.g. Printables, Thingiverse) as needed

Method:

- static HTML site
- Github rest API integration

Structure:

- Homepage - list of all projects
  - Project X
    - Description
      - Goals
      - Method
        - Images
      - BOM w/ cost
      - Results/improvements
    - Files
  - ...

Tables:

- project
  - id
  - status
  - name
  - description
  - reasoning
  - goals
  - process
  - bom
  - conclusion
  - files
  - video_link
  - web_link
- tag
  - id
  - name
- project_tags
  - project_id
  - tag_id
- status
  - id
  - name
