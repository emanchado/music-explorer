const React = require("react"),
      ReactDOM = require("react-dom"),
      R = require("ramda"),
      teoria = require("teoria"),
      RUList = require("../lib/RUList"),
      notePlayer = require("../lib/note-player"),
      Mousetrap = require("mousetrap");

const ACCIDENTAL_LABELS = {
    "#": "♯",
    "b": "♭",
    "x": "𝄪",
    "bb": "𝄫",
    "": ""
};

const INITIAL_SCALE = "major", INITIAL_KEY = "";

const KNOWN_SCALES = [
    {name: "major", label: "Major"},
    {name: "minor", label: "Minor"},
    {name: "melodicminor", label: "Melodic minor"},
    {name: "harmonicminor", label: "Harmonic minor"},
    {name: "majorpentatonic", label: "Major pentatonic"},
    {name: "minorpentatonic", label: "Minor pentatonic"},

    {name: "blues", label: "Blues"},
    {name: "flamenco", label: "Flamenco"},
    {name: "wholetone", label: "Whole tone"},
    {name: "doubleharmonic", label: "Double harmonic"},
    {name: "chromatic", label: "Chromatic"},

    {name: "ionian", label: "Ionian"},
    {name: "dorian", label: "Dorian"},
    {name: "phrygian", label: "Phrygian"},
    {name: "lydian", label: "Lydian"},
    {name: "mixolydian", label: "Mixolydian"},
    {name: "aeolian", label: "Aeolian"},
    {name: "locrian", label: "Locrian"}
];

const OCTAVE_KEYS = ["zsxdcvgbhnjm".split(""), "q2w3er5t6y7u".split("")];

const PianoKey = React.createClass({
    getInitialState() {
        return {active: false};
    },

    componentDidMount: function() {
        const note = teoria.note(this.props.noteName);
        Mousetrap.bind(OCTAVE_KEYS[this.props.octave - 1][note.chroma()],
                       () => {
                           this.setState({active: true});
                           this.playNote();
                           setTimeout(() => {
                               this.setState({active: false});
                           }, 300);
                       });
    },

    noteInScale: function (note, scale) {
        if (scale) {
            const scaleNotes = scale.notes();
            for (let i = 0, len = scaleNotes.length; i < len; i++) {
                if (scaleNotes[i].chroma() === note.chroma()) {
                    return scaleNotes[i];
                }
            }
        }

        return null;
    },

    noteInChord: function (note, chord) {
        if (chord) {
            const chordNotes = chord.notes();
            for (let i = 0, len = chordNotes.length; i < len; i++) {
                if (chordNotes[i].chroma() === note.chroma()) {
                    return chordNotes[i];
                }
            }
        }

        return null;
    },

    roleInChordDiv: function(chord, noteInChord) {
        if (!noteInChord) {
            return (
                <div className="note-role">&nbsp;</div>
            );
        }

        const roleInChord = chord.root.interval(noteInChord);
        if (roleInChord.toString() === "P1") {
            // Want to show as "R" (for "root"), not as P1. Also, mark
            // with a CSS class because it's kind of special
            return (
                <div className="note-role note-role-root">R</div>
            );
        } else {
            return (
                <div className="note-role">{roleInChord.toString()}</div>
            );
        }
    },

    noteLabel: function(note, defaultNoteName) {
        const rawNoteName = note ?
                            note.name() + ACCIDENTAL_LABELS[note.accidental()] :
                            defaultNoteName.replace(/#$/, ACCIDENTAL_LABELS["#"]).
                                            replace(/b$/, ACCIDENTAL_LABELS["b"]);

        return rawNoteName.toUpperCase();
    },

    playNote: function() {
        this.props.notePlayer.playNote(this.props.octave, this.props.noteName);
    },

    render: function() {
        const note = teoria.note(this.props.noteName),
              noteInScale = this.noteInScale(note, this.props.scale),
              noteInChord = this.noteInChord(note, this.props.chord),
              label = this.noteLabel(noteInChord || noteInScale,
                                     this.props.noteName);

        const scaleInclusionClassName = noteInScale ? "in-scale" : "out-scale",
              scaleHighlightClassName = this.props.scale ?
                                        scaleInclusionClassName : "",
              chordHighlightClassName = noteInChord ? "in-chord" : "",
              className = (note.accidental().length ? "ebony" : "") + " " +
                          scaleHighlightClassName + " " +
                          chordHighlightClassName +
                          (this.state.active ? " active" : "");

        return (
            <li key={this.props.noteName}
                className={className}
                onClick={this.playNote}>
              <div className="note">
                {this.roleInChordDiv(this.props.chord, noteInChord)}
                <div className="note-name">{label}</div>
              </div>
            </li>
        );
    }
});

const Piano = React.createClass({
    render: function() {
        const scaleKeyName = this.props.scalekey,
              scaleName = this.props.scale,
              currentScale = (scaleKeyName && scaleName) ?
                             teoria.note(scaleKeyName + "4").scale(scaleName) :
                             null,
              keys = R.flatten(R.range(0, this.props.notePlayer.NUMBER_OCTAVES).map((octaveNumber) => {
                  return this.props.notePlayer.OCTAVE_NOTES.map((noteName) => {
                      let reactKey = (octaveNumber + 1) + "-" + noteName,
                          playNoteHandler = () => {
                              this.props.notePlayer.playNote(octaveNumber + 1, noteName);
                          };
                      return (
                          <PianoKey octave={octaveNumber+1}
                                    key={reactKey}
                                    noteName={noteName}
                                    scale={currentScale}
                                    chord={this.props.highlightChord}
                                    notePlayer={this.props.notePlayer} />
                      );
                  });
              }));

        return (
            <ol className="piano">
              {keys}
            </ol>
        );
    }
});

const MatchingChords = React.createClass({
    chordSelectionHandler: function(chordName) {
        return (e) => {
            this.props.onSelectChord(chordName);
            e.preventDefault();
        };
    },

    render: function() {
        const scale = (this.props.keyName && this.props.scaleName) ?
                      teoria.note(this.props.keyName + "4").scale(this.props.scaleName) :
                      null;
        let matchingChordMarkup;

        if (scale) {
            const potentialChords = R.flatten(scale.notes().map((note) => {
                return ["", "m", "dim", "aug"].map((chordType) => {
                    return note.chord(chordType);
                });
            }));

            const matchingChords = potentialChords.filter(function(chord) {
                return isChordInScale(chord, scale);
            });

            matchingChordMarkup = matchingChords.map((chord) => {
                return (
                    <li key={chord.name}>
                      <Chord onClick={this.chordSelectionHandler(chord)} chord={chord} />
                    </li>
                );
            });
        } else {
            matchingChordMarkup = (
                <em>Select key/scale to show basic matching chords</em>
            );
        }

        if (scale) {
            return (
                <div>
                  <h2>Matching triad chords:</h2>
                  <ul className="chords">{matchingChordMarkup}</ul>
                </div>
            );
        } else {
            return (
                <div></div>
            );
        }
    }
});

const Chord = React.createClass({
    chordLabel: function(chord) {
        return R.reduce(function(acc, symbol) {
            return acc.replace(symbol, ACCIDENTAL_LABELS[symbol]);
        }, chord.name, ["bb", "x", "b", "#"]);
    },

    render: function() {
        const chordLabel = this.chordLabel(this.props.chord);

        return (
            <a href="#" onClick={this.props.onClick}>{chordLabel}</a>
        );
    }
});

const ScaleSelector = React.createClass({
    onChangeKey: function(e) {
        const newKey = e.target.options[e.target.selectedIndex].value;
        this.props.onChangeKey(newKey);
    },

    onChangeScale: function(e) {
        const newScale = e.target.options[e.target.selectedIndex].value;
        this.props.onChangeScale(newScale);
    },

    render: function() {
        const scaleOptions = KNOWN_SCALES.map((scale) => {
            return (
                <option key={scale.name} value={scale.name}>{scale.label}</option>
            );
        });

        return (
            <div>
              <select value={this.props.keyName} onChange={this.onChangeKey}>
                <option value="">Choose a key</option>
                <option value="c">C</option>
                <option value="c#">C♯ (D♭)</option>
                <option value="d">D</option>
                <option value="d#">D♯ (E♭)</option>
                <option value="e">E</option>
                <option value="f">F</option>
                <option value="f#">F♯ (G♭)</option>
                <option value="g">G</option>
                <option value="g#">G♯ (A♭)</option>
                <option value="a">A</option>
                <option value="a#">A♯ (B♭)</option>
                <option value="b">B</option>
              </select>

              <select value={this.props.scaleName} onChange={this.onChangeScale}>
                {scaleOptions}
              </select>
            </div>
        );
    }
});

function isChordInScale(chord, scale) {
    const scaleNoteChromas = scale.notes().map((n) => {
        return n.chroma();
    });

    return chord.notes().every((chordNote) => {
        return scaleNoteChromas.indexOf(chordNote.chroma()) !== -1;
    });
}

const MusicExplorerApp = React.createClass({
    getInitialState: function() {
        return {scale: INITIAL_SCALE,
                key: INITIAL_KEY,
                lastUsedChords: new RUList()};
    },

    onChangeScale: function(newScale) {
        this.setState({scale: newScale});
    },

    onChangeKey: function(newKey) {
        this.setState({key: newKey});
    },

    onSelectChord: function(chord) {
        if (chord) {
            for (let note of chord.simple()) {
                this.props.notePlayer.playNote(1, note);
            }
            this.setState({highlightChord: chord,
                           chordName: chord.name});
        } else {
            this.setState({highlightChord: null,
                           chordName: ""});
        }
    },

    onChangeChordName: function(e) {
        const newChordName = e.target.value;
        this.setState({chordName: newChordName});
    },

    onClickHighlightChord: function(e) {
        e.preventDefault();

        try {
            const newChord = teoria.chord(this.state.chordName);
            this.onSelectChord(newChord);

            this.state.lastUsedChords.add(newChord.name);
        } catch (e) {
            if (this.state.chordName) {
                console.log("Ignoring unknown chord '" + this.state.chordName + "'");
            } else {
                this.onSelectChord(null);
            }
        }
    },

    render: function() {
        let chord,
            chordBoxCss = "chord-name";
        try {
            chord = teoria.chord(this.state.chordName);
        } catch (e) {
            // Only mark as wrong if the chordName isn't empty, as
            // it's irritating that the cursor turns red on an empty
            // textbox
            if (this.state.chordName && this.state.chordName.length) {
                chordBoxCss += " wrong";
            }
        }

        let lastChords = this.state.lastUsedChords.toArray(),
            lastChordsMarkup;

        if (lastChords.length) {
            let lastChordsItems = lastChords.map(chordName => {
                const chord = teoria.chord(chordName),
                      clickHandler = (e) => {
                          this.onSelectChord(chord);
                          e.preventDefault();
                      };

                return (
                    <li key={chordName}>
                      <Chord onClick={clickHandler} chord={chord} />
                    </li>
                );
            });

            lastChordsMarkup = (
                <ul className="chords">{lastChordsItems}</ul>
            );
        } else {
            lastChordsMarkup = (
                <em>None</em>
            );
        }

        return (
            <div>
              <Piano scale={this.state.scale}
                     scalekey={this.state.key}
                     highlightChord={this.state.highlightChord}
                     notePlayer={this.props.notePlayer} />

              <div className="toolbox">
                <div className="scale-tools">
                  <h1>Scales</h1>
                  <ScaleSelector keyName={this.state.key}
                                 scaleName={this.state.scale}
                                 onChangeKey={this.onChangeKey}
                                 onChangeScale={this.onChangeScale} />

                  <MatchingChords keyName={this.state.key}
                                  scaleName={this.state.scale}
                                  onSelectChord={this.onSelectChord} />
                </div>

                <div className="chord-tools">
                  <h1>Chords</h1>
                  <h2>Highlight chord</h2>
                  <form action="#">
                    <input type="text"
                           size="7"
                           className={chordBoxCss}
                           value={this.state.chordName}
                           onChange={this.onChangeChordName} />
                    <button type="submit"
                            onClick={this.onClickHighlightChord}>Highlight</button>
                  </form>

                  <h2>Last used chords</h2>
                  <ul className="chords">{lastChordsMarkup}</ul>
                </div>
              </div>
            </div>
        );
    }
});

ReactDOM.render(
    <MusicExplorerApp notePlayer={notePlayer} />,
    document.getElementById("app")
);

notePlayer.init();
