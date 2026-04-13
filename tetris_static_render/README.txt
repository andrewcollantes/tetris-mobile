TETRIS STATIC RENDER PACK

Files:
- index.html
- style.css
- script.js
- render-blueprint-example.yaml

Recommended setup on Render:
1) Deploy this Tetris game as a Static Site.
2) Deploy your second project as a Web Service.

Why:
- Static Sites are fast and free, and do not use service instances.
- The 750 monthly free instance hours apply to Free web services.
- A Free web service spins down after 15 minutes without inbound traffic.

For Tetris Static Site settings on Render:
- Service Type: Static Site
- Root Directory: tetris-static (if you place these files in that folder in your repo)
- Build Command: leave blank
- Publish Directory: .

For a Flask second app on Render:
- requirements.txt should include Flask and gunicorn
- Start command: gunicorn app:app

Suggested repo layout:
repo/
  tetris-static/
    index.html
    style.css
    script.js
  second-app/
    app.py
    requirements.txt
    templates/
    static/
