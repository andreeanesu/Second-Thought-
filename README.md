# Second Thought

A calm cognitive-bias quiz for learning by doing.

## Run locally

The app loads content from JSON files, so use a simple local server (opening `index.html` directly may not work in all browsers):

```bash
cd second-thought
python3 -m http.server 8080
```

Then visit [http://localhost:8080](http://localhost:8080).

## Project structure

```
second-thought/
├── data/
│   ├── source/cognitive_bias_trainer.xlsx   # your content master file
│   ├── biases.json                          # 20 biases
│   ├── challenges.json                      # 60 quiz questions
│   └── categories.json                      # category lookup
├── scripts/convert-excel.py                 # Excel → JSON converter
├── js/
│   ├── data-loader.js                       # fetch + join data
│   ├── quiz-engine.js                       # 5-question shuffled sessions
│   ├── ui.js                                # render screen
│   └── app.js                               # startup wiring
├── index.html
└── styles.css
```

## Update content from Excel

1. Edit `data/source/cognitive_bias_trainer.xlsx`
2. Run: `python3 second-thought/scripts/convert-excel.py`
3. Refresh the browser

Each quiz round serves **5 random challenges** from the full bank of 60.
