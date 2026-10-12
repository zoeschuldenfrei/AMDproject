# AMD Creative Pathways: Project Repo

Work for the AMD Creative Pathways fellowship: the final-pitch rework of the
**"AMD Powers What's Next"** brand video into **ZENITH**, an animated miniseries and
sizzle-reel campaign set in a city powered by AMD.

## Who works here
Zoe and Hillary share this repo **and one Claude account**. So everyone (and every Claude
session) keeps work in the right person's folder:

| Folder | Owner | What goes in it |
|---|---|---|
| [`zoe/`](zoe/) | Zoe | Zoe's drafts, decks, reels, notes |
| [`hillary/`](hillary/) | Hillary | Hillary's drafts, decks, reels, notes |
| [`shared/`](shared/) | Both | Only things both of you have agreed are team-wide, like the original brief and final submitted files |

Rule of thumb: **if you didn't make it together, it goes in your own folder.** Copy something into `shared/` only when you've both signed off on it.

## Layout
```
.
├── README.md            ← you are here
├── CLAUDE.md            ← instructions Claude reads in every session
├── shared/
│   └── brief/           ← the original assignment and constraints
├── zoe/
│   └── final-pitch/     ← ZENITH concept docs, slides, sizzle reel
└── hillary/             ← Hillary's workspace
```

## Working with git (quick version)
- Each person works on their own branch (e.g. `zoe/<topic>`, `hillary/<topic>`) and merges to `main` with a pull request.
- Big media (video renders, raw art) should stay under ~20 MB per file. Put anything larger in Google Drive and link it.
